import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { clearDraft, loadDraft, saveDraft } from './wizardStorage.js';
import { hasDraftContent } from './validation.js';
import { initialAnswers } from './defaults.js';

function createInitialState() {
  const draft = loadDraft();
  return { answers: { ...initialAnswers, ...(draft?.answers || {}) },
    step: Number.isInteger(draft?.step) && draft.step >= 0 && draft.step <= 4 ? draft.step : 0,
    restored: Boolean(draft), completed: Boolean(draft?.completed), errors: {}, reviewEditing: false, storageAvailable: true };
}

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE': return { ...state, answers: { ...state.answers, [action.key]: action.value }, errors: { ...state.errors, [action.key]: undefined }, completed: false };
    case 'SET_STEP': return { ...state, step: action.step, reviewEditing: action.reviewEditing ?? state.reviewEditing, errors: {} };
    case 'SET_ERRORS': return { ...state, errors: action.errors };
    case 'COMPLETE': return { ...state, completed: true, reviewEditing: false };
    case 'RESET': return { ...createInitialState(), answers: initialAnswers, step: 0, restored: false, completed: false };
    case 'STORAGE_UNAVAILABLE': return { ...state, storageAvailable: false };
    default: return state;
  }
}

const WizardContext = createContext(null);

export function WizardProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  useEffect(() => {
    if (!hasDraftContent(state.answers) && state.step === 0 && !state.completed) {
      clearDraft();
      return;
    }
    const saved = saveDraft({ answers: state.answers, step: state.step, completed: state.completed });
    if (!saved) dispatch({ type: 'STORAGE_UNAVAILABLE' });
  }, [state.answers, state.step, state.completed]);
  const update = useCallback((key, value) => dispatch({ type: 'UPDATE', key, value }), []);
  const setStep = useCallback((step, reviewEditing) => dispatch({ type: 'SET_STEP', step, reviewEditing }), []);
  const setErrors = useCallback((errors) => dispatch({ type: 'SET_ERRORS', errors }), []);
  const complete = useCallback(() => dispatch({ type: 'COMPLETE' }), []);
  const reset = useCallback(() => { clearDraft(); dispatch({ type: 'RESET' }); }, []);
  const value = useMemo(() => ({ ...state, update, setStep, setErrors, complete, reset }), [state, update, setStep, setErrors, complete, reset]);
  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) throw new Error('useWizard must be used inside WizardProvider');
  return context;
}
