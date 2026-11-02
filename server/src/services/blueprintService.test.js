import test from 'node:test';
import assert from 'node:assert/strict';
import { generateBlueprint } from './blueprintService.js';

const answers = { projectType: 'web', projectName: 'Portal', problem: 'Manual intake', idea: 'A portal', users: 'Clients', outcome: 'Faster intake', userRoles: ['Customer / end user', 'Administrator'], features: ['User accounts', 'Dashboard'], platforms: ['Responsive web'], integrations: ['CRM'], authentication: 'Email and password', existingSystem: 'No', billing: '', aiUseCase: '', budget: 'Not sure yet', timeline: 'Flexible', complexity: 'Not sure', technologyPreferences: '', constraints: '' };

test('generates a stable, source-labeled blueprint from actual answers', () => {
  const first = generateBlueprint(answers);
  assert.deepEqual(first, generateBlueprint(answers));
  assert.equal(first.executiveSummary.problem, answers.problem);
  assert.deepEqual(first.functionalRequirements[0], { requirement: 'User accounts', source: 'selected', status: 'User-provided' });
  assert.deepEqual(first.integrations.requested, ['CRM']);
  assert.equal(first.complexity.level, 'Medium');
  assert.match(first.disclaimer, /not an official Cynbit proposal/);
});

test('technology preference is labeled as a client preference', () => {
  const report = generateBlueprint({ ...answers, technologyPreferences: 'React and PostgreSQL' });
  assert.equal(report.technologyStack.at(-1).area, 'Client preference');
  assert.match(report.technologyStack.at(-1).reason, /Provided by the user/);
});
