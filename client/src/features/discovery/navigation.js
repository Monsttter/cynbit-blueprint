export const LAST_STEP = 4;

export function getNextStep(current, reviewEditing = false) {
  if (current >= LAST_STEP) return LAST_STEP;
  return reviewEditing ? LAST_STEP : current + 1;
}

export function getPreviousStep(current) {
  return Math.max(0, current - 1);
}
