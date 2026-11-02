export const DRAFT_STORAGE_KEY = 'cynbit-blueprint-discovery-v1';

export function loadDraft(storage) {
  try {
    const raw = (storage ?? globalThis.localStorage)?.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1 || !parsed.answers || typeof parsed.answers !== 'object') return null;
    return parsed;
  } catch { return null; }
}

export function saveDraft(draft, storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    target?.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ ...draft, version: 1, updatedAt: new Date().toISOString() }));
    return Boolean(target);
  } catch { return false; }
}

export function clearDraft(storage) {
  try { (storage ?? globalThis.localStorage)?.removeItem(DRAFT_STORAGE_KEY); return true; }
  catch { return false; }
}
