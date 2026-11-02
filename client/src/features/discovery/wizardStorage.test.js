import test from 'node:test';
import assert from 'node:assert/strict';
import { clearDraft, DRAFT_STORAGE_KEY, loadDraft, saveDraft } from './wizardStorage.js';

function createStorage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
}

test('drafts are versioned, restored, and cleared using the injected storage', () => {
  const storage = createStorage();
  const draft = { step: 2, answers: { projectType: 'mobile' } };
  assert.equal(saveDraft(draft, storage), true);
  assert.equal(loadDraft(storage).step, 2);
  assert.equal(loadDraft(storage).answers.projectType, 'mobile');
  assert.equal(clearDraft(storage), true);
  assert.equal(loadDraft(storage), null);
});

test('invalid, outdated, or inaccessible drafts safely return null', () => {
  const storage = createStorage();
  storage.setItem(DRAFT_STORAGE_KEY, '{invalid json');
  assert.equal(loadDraft(storage), null);
  storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ version: 0, answers: {} }));
  assert.equal(loadDraft(storage), null);
  const denied = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };
  assert.equal(loadDraft(denied), null);
  assert.equal(saveDraft({}, denied), false);
  assert.equal(clearDraft(denied), false);
});
