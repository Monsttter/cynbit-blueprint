import { randomBytes } from 'node:crypto';
import { generateBlueprintWithSource } from './blueprintGenerationService.js';
import { validateSubmission } from './requestValidation.js';

export class SubmissionValidationError extends Error {
  constructor(errors) { super('Please correct the highlighted fields.'); this.name = 'SubmissionValidationError'; this.errors = errors; }
}

export async function createBlueprint({ db, body, generate = generateBlueprintWithSource }) {
  const validation = validateSubmission(body);
  if (!validation.valid) throw new SubmissionValidationError(validation.errors);
  if (!db) throw new Error('DATABASE_UNAVAILABLE');
  const { contact, answers } = body;
  const { blueprint, generationSource } = await generate({ answers });
  if (!['rules', 'gemini'].includes(generationSource)) throw new Error('Invalid blueprint generation source.');
  const publicAnswers = { ...answers };
  delete publicAnswers.contactName;
  delete publicAnswers.contactEmail;
  delete publicAnswers.company;
  let client;
  try {
    client = await db.connect();
    await client.query('BEGIN');
    const reference = randomBytes(24).toString('base64url');
    const enquiry = await client.query(
      `INSERT INTO enquiries (reference_token, name, email, company, project_type)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`,
      [reference, contact.name.trim(), contact.email.trim().toLowerCase(), contact.company?.trim() || null, answers.projectType],
    );
    const submission = await client.query(
      `INSERT INTO project_submissions (enquiry_id, answers, blueprint, generation_source, schema_version)
       VALUES ($1, $2::jsonb, $3::jsonb, $4, $5) RETURNING created_at`,
      [enquiry.rows[0].id, JSON.stringify(publicAnswers), JSON.stringify(blueprint), generationSource, blueprint.schemaVersion],
    );
    await client.query('COMMIT');
    return { reference, blueprint, generationSource, createdAt: new Date(submission.rows[0].created_at).toISOString() };
  } catch (error) {
    if (client) { try { await client.query('ROLLBACK'); } catch { /* preserve the original database error */ } }
    throw error;
  } finally { client?.release(); }
}

export async function getPublicBlueprint(db, reference) {
  if (!db) throw new Error('DATABASE_UNAVAILABLE');
  const result = await db.query(
    `SELECT e.reference_token, s.blueprint, s.generation_source, s.created_at
     FROM enquiries e INNER JOIN project_submissions s ON s.enquiry_id = e.id
     WHERE e.reference_token = $1 LIMIT 1`,
    [reference],
  );
  if (!result.rowCount) return null;
  return { reference: result.rows[0].reference_token, blueprint: result.rows[0].blueprint, generationSource: result.rows[0].generation_source, createdAt: new Date(result.rows[0].created_at).toISOString() };
}
