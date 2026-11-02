import test from 'node:test';
import assert from 'node:assert/strict';
import { submitBlueprint } from './blueprintApi.js';

const answers = { contactName: 'A Client', contactEmail: 'client@example.test', company: '', projectType: 'web', consent: true };

test('posts contact data separately from project answers and returns the reference', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/blueprints');
    const payload = JSON.parse(options.body);
    assert.equal(payload.contact.name, 'A Client');
    assert.equal(payload.answers.contactName, undefined);
    return { ok: true, json: async () => ({ reference: 'token', blueprint: {}, createdAt: new Date().toISOString() }) };
  };
  try { assert.equal((await submitBlueprint(answers)).reference, 'token'); }
  finally { globalThis.fetch = originalFetch; }
});

test('surfaces field errors and useful network failures', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: false, status: 400, json: async () => ({ error: 'Invalid request', fields: { 'contact.email': 'Invalid email' } }) });
  try { await assert.rejects(submitBlueprint(answers), (error) => error.message === 'Invalid request' && error.fields['contact.email'] === 'Invalid email'); }
  finally { globalThis.fetch = originalFetch; }
  globalThis.fetch = async () => { throw new Error('offline'); };
  try { await assert.rejects(submitBlueprint(answers), /server could not be reached/i); }
  finally { globalThis.fetch = originalFetch; }
});
