import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { newDb } from 'pg-mem';
import { randomUUID } from 'node:crypto';
import { createApp } from './app.js';
import { createBlueprint } from './services/blueprintPersistenceService.js';
import { generateBlueprint } from './services/blueprintService.js';
import { generateBlueprintWithSource } from './services/blueprintGenerationService.js';

let pool;
let app;
const rulesOnly = ({ answers }) => generateBlueprintWithSource({ answers, apiKey: '' });
before(async () => {
  const db = newDb();
  db.public.registerFunction({ name: 'gen_random_uuid', implementation: randomUUID, impure: true });
  db.public.none(`CREATE TABLE enquiries (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), reference_token VARCHAR(64) UNIQUE NOT NULL, name VARCHAR(120) NOT NULL, email VARCHAR(254) NOT NULL, company VARCHAR(160), project_type VARCHAR(16) NOT NULL, status VARCHAR(24) DEFAULT 'completed' NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL); CREATE TABLE project_submissions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), enquiry_id UUID UNIQUE NOT NULL REFERENCES enquiries(id), answers JSONB NOT NULL, blueprint JSONB NOT NULL, generation_source VARCHAR(16) DEFAULT 'rules' NOT NULL, schema_version VARCHAR(16) NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL);`);
  const adapter = db.adapters.createPg();
  pool = new adapter.Pool();
  app = createApp({ db: pool, generate: rulesOnly });
});
after(async () => pool?.end());

const body = () => ({ contact: { name: 'Test Client', email: 'client@example.test', company: 'Example Co' }, answers: { projectType: 'web', projectName: 'Portal', problem: 'Manual intake', idea: 'A client portal', users: 'Clients', outcome: 'Faster intake', userRoles: ['Customer / end user', 'Administrator'], otherRole: '', features: ['User accounts', 'Dashboard'], otherFeature: '', platforms: ['Responsive web'], integrations: ['CRM'], integrationOther: '', authentication: 'Email and password', existingSystem: 'No', existingSystemDetails: '', billing: '', aiUseCase: '', budget: 'Not sure yet', timeline: 'Flexible', complexity: 'Not sure', technologyPreferences: '', constraints: '', consent: true } });

test('rejects missing required contact data and invalid project types', async () => {
  const missing = body(); missing.contact.name = '';
  assert.equal((await request(app).post('/api/blueprints').send(missing)).status, 400);
  const invalid = body(); invalid.answers.projectType = 'crypto';
  assert.equal((await request(app).post('/api/blueprints').send(invalid)).status, 400);
  const outOfScope = body(); outOfScope.answers.userRoles = ['Workspace administrator'];
  assert.equal((await request(app).post('/api/blueprints').send(outOfScope)).status, 400);
  const unexpectedPrivateField = body(); unexpectedPrivateField.answers.contactEmail = 'private@example.test';
  assert.equal((await request(app).post('/api/blueprints').send(unexpectedPrivateField)).status, 400);
});

test('submits and retrieves a blueprint without exposing contact information', async () => {
  const result = await request(app).post('/api/blueprints').send(body());
  assert.equal(result.status, 201, JSON.stringify(result.body));
  assert.match(result.body.reference, /^[A-Za-z0-9_-]{32}$/);
  assert.ok(result.body.createdAt);
  assert.equal(result.body.generationSource, 'rules');
  assert.equal(JSON.stringify(result.body).includes('client@example.test'), false);
  assert.equal(JSON.stringify(result.body).includes('Test Client'), false);
  const saved = await pool.query('SELECT answers FROM project_submissions');
  assert.equal(saved.rows[0].answers.contactName, undefined);
  assert.equal(saved.rows[0].answers.contactEmail, undefined);
  const fetched = await request(app).get(`/api/blueprints/${result.body.reference}`);
  assert.equal(fetched.status, 200);
  assert.equal(fetched.body.generationSource, 'rules');
  assert.equal(JSON.stringify(fetched.body).includes('Example Co'), false);
  assert.equal((await request(app).get('/api/blueprints/unknown-reference')).status, 404);
});

test('persists and returns Gemini as the actual generation source', async () => {
  const saved = await createBlueprint({ db: pool, body: body(), generate: async ({ answers }) => ({ blueprint: generateBlueprint(answers), generationSource: 'gemini' }) });
  assert.equal(saved.generationSource, 'gemini');
  const row = await pool.query('SELECT generation_source FROM project_submissions');
  assert.ok(row.rows.some((item) => item.generation_source === 'gemini'));
});

test('rolls back the enquiry when the blueprint write fails', async () => {
  const commands = [];
  const failingDb = { connect: async () => ({ query: async (sql) => {
    commands.push(sql);
    if (sql.includes('INSERT INTO project_submissions')) throw new Error('simulated write failure');
    if (sql.includes('INSERT INTO enquiries')) return { rows: [{ id: randomUUID(), created_at: new Date() }] };
    return { rows: [] };
  }, release() {} }) };
  const failingApp = createApp({ db: failingDb, generate: rulesOnly });
  assert.equal((await request(failingApp).post('/api/blueprints').send(body())).status, 500);
  assert.ok(commands.includes('BEGIN'));
  assert.ok(commands.includes('ROLLBACK'));
  assert.equal(commands.includes('COMMIT'), false);
});

test('health endpoint reports database connectivity', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.database, 'connected');
  const alternateDevPort = await request(app).get('/api/health').set('Origin', 'http://localhost:5174');
  assert.equal(alternateDevPort.headers['access-control-allow-origin'], 'http://localhost:5174');
});
