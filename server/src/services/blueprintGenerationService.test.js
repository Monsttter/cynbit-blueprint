import test from 'node:test';
import assert from 'node:assert/strict';
import { generateBlueprint } from './blueprintService.js';
import { blueprintSchema, blueprintRefinementSchema } from './blueprintSchema.js';
import { generateBlueprintWithSource } from './blueprintGenerationService.js';
import { parseGeminiResponse } from './geminiClient.js';

const answers = { projectType: 'saas', projectName: 'Team Desk', problem: 'Scattered work', idea: 'A shared service workspace', users: 'Operations teams', outcome: 'One reliable workflow', userRoles: ['Account owner', 'Team member'], otherRole: '', features: ['Workspaces / teams', 'Role-based access'], otherFeature: '', platforms: ['Responsive web'], integrations: ['Payments'], integrationOther: '', authentication: 'Email and password', existingSystem: 'No', existingSystemDetails: '', billing: 'Monthly / annual subscriptions', aiUseCase: '', budget: 'Not sure yet', timeline: 'Flexible', complexity: 'Moderate', technologyPreferences: '', constraints: '', consent: true };
const deterministic = generateBlueprint(answers);
const validRefinement = {
  executiveSummary: deterministic.executiveSummary,
  functionalRequirements: deterministic.functionalRequirements,
  architecture: deterministic.architecture,
  technologyStack: deterministic.technologyStack,
  integrations: deterministic.integrations,
  complexity: deterministic.complexity,
  risks: deterministic.risks,
  developmentPhases: deterministic.developmentPhases,
  openQuestions: deterministic.openQuestions,
};
const providerResponse = (text) => new Response(JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text }] } }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });

test('parses a valid structured Gemini response and rejects invalid JSON', () => {
  const valid = { candidates: [{ finishReason: 'STOP', content: { parts: [{ text: '{"ok":true}' }] } }] };
  const invalid = { candidates: [{ finishReason: 'STOP', content: { parts: [{ text: '{bad json' }] } }] };
  assert.deepEqual(parseGeminiResponse(valid), { ok: true });
  assert.throws(() => parseGeminiResponse(invalid));
});

test('deterministic blueprint and Gemini refinement satisfy their schemas', () => {
  assert.equal(blueprintSchema.safeParse(deterministic).success, true);
  assert.equal(blueprintRefinementSchema.safeParse(validRefinement).success, true);
  assert.equal(blueprintRefinementSchema.safeParse({ ...validRefinement, risks: 'not a list' }).success, false);
});

test('uses a valid Gemini refinement and sends no contact details to the provider', async () => {
  let requestBody;
  const result = await generateBlueprintWithSource({
    answers: { ...answers, problem: 'Contact the owner at owner@example.test or +91 98765 43210.', contactName: 'Private Name', contactEmail: 'private@example.test', company: 'Private Co' },
    apiKey: 'test-key', model: 'test-model',
    fetchImpl: async (_url, options) => { requestBody = JSON.parse(options.body); return providerResponse(JSON.stringify(validRefinement)); },
  });
  assert.equal(result.generationSource, 'gemini');
  assert.equal(result.blueprint.title, 'Team Desk');
  const serialized = JSON.stringify(requestBody);
  assert.equal(serialized.includes('Private Name'), false);
  assert.equal(serialized.includes('private@example.test'), false);
  assert.equal(serialized.includes('Private Co'), false);
  assert.equal(serialized.includes('owner@example.test'), false);
  assert.equal(serialized.includes('+91 98765 43210'), false);
  assert.equal(requestBody.generationConfig.responseMimeType, 'application/json');
});

test('invalid response and missing configuration fall back to deterministic rules', async () => {
  const unavailable = await generateBlueprintWithSource({ answers, apiKey: '' });
  assert.equal(unavailable.generationSource, 'rules');
  const invalidJson = await generateBlueprintWithSource({ answers, apiKey: 'test-key', fetchImpl: async () => providerResponse('{bad') });
  assert.equal(invalidJson.generationSource, 'rules');
  const invalidSchema = await generateBlueprintWithSource({ answers, apiKey: 'test-key', fetchImpl: async () => providerResponse(JSON.stringify({ unexpected: true })) });
  assert.equal(invalidSchema.generationSource, 'rules');
  const providerOffline = await generateBlueprintWithSource({ answers, apiKey: 'test-key', fetchImpl: async () => { throw new Error('provider offline'); } });
  assert.equal(providerOffline.generationSource, 'rules');
  const oversized = await generateBlueprintWithSource({ answers, apiKey: 'test-key', fetchImpl: async () => providerResponse('x'.repeat(49 * 1024)) });
  assert.equal(oversized.generationSource, 'rules');
  const inventedSelection = structuredClone(validRefinement);
  inventedSelection.functionalRequirements.push({ requirement: 'Facial recognition', source: 'selected', status: 'User-provided' });
  const ungrounded = await generateBlueprintWithSource({ answers, apiKey: 'test-key', fetchImpl: async () => providerResponse(JSON.stringify(inventedSelection)) });
  assert.equal(ungrounded.generationSource, 'rules');
});

test('times out without retrying and falls back to rules', async () => {
  let calls = 0;
  const result = await generateBlueprintWithSource({ answers, apiKey: 'test-key', timeoutMs: 1000, fetchImpl: async (_url, { signal }) => {
    calls += 1;
    return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true }));
  } });
  assert.equal(result.generationSource, 'rules');
  assert.equal(calls, 1);
});
