import test from 'node:test';
import assert from 'node:assert/strict';
import { initialAnswers } from './defaults.js';
import { validateStep } from './validation.js';
import { getNextStep, getPreviousStep, LAST_STEP } from './navigation.js';

test('navigation advances in order and returns to review after editing a section', () => {
  assert.deepEqual([0, 1, 2, 3].map((step) => getNextStep(step)), [1, 2, 3, 4]);
  assert.equal(getNextStep(1, true), LAST_STEP);
  assert.equal(getNextStep(LAST_STEP), LAST_STEP);
  assert.deepEqual([0, 1, 2, 3, 4].map(getPreviousStep), [0, 0, 1, 2, 3]);
});

test('project type is required before continuing', () => {
  assert.ok(validateStep(0, initialAnswers).projectType);
  assert.deepEqual(validateStep(0, { ...initialAnswers, projectType: 'web' }), {});
});

test('idea step reports each missing required answer', () => {
  const errors = validateStep(1, initialAnswers);
  assert.deepEqual(Object.keys(errors).sort(), ['idea', 'outcome', 'problem', 'users']);
  const answers = { ...initialAnswers, problem: 'Manual work', idea: 'A simple workflow app', users: 'Operations team', outcome: 'Save time' };
  assert.deepEqual(validateStep(1, answers), {});
});

test('scope requires a role, a feature, platform, authentication, and integration decision', () => {
  assert.equal(Object.keys(validateStep(2, { ...initialAnswers, projectType: 'mobile' })).length, 5);
  const answers = { ...initialAnswers, projectType: 'mobile', userRoles: ['App user'], features: ['Messaging'], platforms: ['Android', 'iOS'], authentication: 'Not sure yet', existingSystem: 'No' };
  assert.deepEqual(validateStep(2, answers), {});
});

test('scope validates conditional “Other”, SaaS billing, and AI use case fields', () => {
  const common = { ...initialAnswers, userRoles: ['Other'], features: ['Other'], platforms: ['Responsive web'], authentication: 'Not sure yet', existingSystem: 'Not sure yet', integrations: ['Other'] };
  assert.ok(validateStep(2, { ...common, projectType: 'saas' }).billing);
  assert.ok(validateStep(2, { ...common, projectType: 'ai' }).aiUseCase);
  const completed = { ...common, projectType: 'saas', otherRole: 'Auditor', otherFeature: 'Bulk upload', integrationOther: 'Internal API', billing: 'Not sure yet' };
  assert.deepEqual(validateStep(2, completed), {});
});

test('constraints accept explicit unsure and flexible selections', () => {
  assert.deepEqual(validateStep(3, { ...initialAnswers, budget: 'Not sure yet', timeline: 'Flexible', complexity: 'Not sure' }), {});
});

test('review requires a name, valid email, and consent', () => {
  assert.ok(validateStep(4, initialAnswers).contactName);
  assert.ok(validateStep(4, { ...initialAnswers, contactName: 'Sam', contactEmail: 'bad', consent: true }).contactEmail);
  assert.ok(validateStep(4, { ...initialAnswers, contactName: 'Sam', contactEmail: 'sam@example.com' }).consent);
  assert.deepEqual(validateStep(4, { ...initialAnswers, contactName: 'Sam', contactEmail: 'sam@example.com', consent: true }), {});
});
