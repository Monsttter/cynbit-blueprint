import { useRef, useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useWizard } from './WizardContext.jsx';
import { hasDraftContent, validateStep } from './validation.js';
import { getNextStep, getPreviousStep } from './navigation.js';
import ProgressSteps from './components/ProgressSteps.jsx';
import ProjectTypeStep from './steps/ProjectTypeStep.jsx';
import IdeaStep from './steps/IdeaStep.jsx';
import ScopeStep from './steps/ScopeStep.jsx';
import ConstraintsStep from './steps/ConstraintsStep.jsx';
import ReviewStep from './steps/ReviewStep.jsx';
import { submitBlueprint } from '../../services/blueprintApi.js';

const stepComponents = [ProjectTypeStep, IdeaStep, ScopeStep, ConstraintsStep, ReviewStep];

export default function DiscoveryWizard() {
  const { answers, step, reviewEditing, setStep, setErrors, reset, restored, storageAvailable } = useWizard();
  const [discardOpen, setDiscardOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const submittingRef = useRef(false);
  const navigate = useNavigate();
  const Step = stepComponents[step];
  const isDirty = hasDraftContent(answers) || step > 0;

  const goNext = async () => {
    const errors = validateStep(step, answers);
    setErrors(errors);
    if (Object.keys(errors).length) {
      document.querySelector('.wizard-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (step === 4) {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setSubmitting(true);
      setSubmitError('');
      try {
        const result = await submitBlueprint(answers);
        reset();
        navigate(`/blueprint/${encodeURIComponent(result.reference)}`);
      } catch (error) {
        const fields = Object.fromEntries(Object.entries(error.fields || {}).map(([key, value]) => [key.startsWith('contact.') ? key.slice(8) === 'name' ? 'contactName' : key.slice(8) === 'email' ? 'contactEmail' : key.slice(8) : key, value]));
        if (Object.keys(fields).length) setErrors(fields);
        setSubmitError(error.message || 'We could not submit your blueprint. Your draft is still saved on this device.');
      } finally { submittingRef.current = false; setSubmitting(false); }
    }
    else setStep(getNextStep(step, reviewEditing), false);
  };

  const goBack = () => { if (step > 0) setStep(getPreviousStep(step), reviewEditing && step !== 4); };
  const navigateStep = (target) => { if (target < step) setStep(target, step === 4 || reviewEditing); };
  const requestReset = () => { if (isDirty) setDiscardOpen(true); else reset(); };

  return <div className="wizard-page">
    <header className="wizard-topline"><div><p className="wizard-breadcrumb">PROJECT DISCOVERY <span>/</span> NEW BLUEPRINT</p>
      <p className="wizard-save-state">{storageAvailable ? 'Draft saves automatically on this device' : 'Browser storage unavailable'}</p></div>
      <Button variant="text" onClick={requestReset} className="start-over-button">Start new discovery</Button>
    </header>
    {restored && <Alert severity="success" className="restore-alert">Your saved draft has been restored. You can continue where you left off.</Alert>}
    {submitError && <Alert severity="error" className="restore-alert" role="alert">{submitError}</Alert>}
    {!storageAvailable && <Alert severity="warning" className="restore-alert">Draft saving is unavailable in this browser. Your answers may not survive a refresh.</Alert>}
    <ProgressSteps current={step} onStepClick={navigateStep} />
    <div className="wizard-layout">
      <section className="wizard-content" aria-label={`Step ${step + 1} of 5`}><Step />
        <div className="wizard-actions">
          <Button variant="text" onClick={goBack} disabled={step === 0} className="back-button" startIcon={<span aria-hidden="true">←</span>}>Back</Button>
          <div className="wizard-action-right"><span className="required-note">{step === 4 ? 'Review before finishing' : 'You can change this later'}</span>
            <Button variant="contained" onClick={goNext} className="next-button" disabled={submitting} aria-busy={submitting} endIcon={!submitting && <span aria-hidden="true">{step === 4 ? '✓' : '→'}</span>}>{submitting ? 'Creating blueprint…' : step === 4 ? 'Create my blueprint' : 'Continue'}</Button>
          </div>
        </div>
      </section>
      <aside className="wizard-aside">
        <div className="aside-index"><span>YOUR PROJECT</span><span>0{step + 1} / 05</span></div>
        <h2>{answers.projectName || 'A clearer starting point'}</h2>
        <p>{answers.projectType ? `${answers.projectType === 'ai' ? 'AI solution' : answers.projectType.charAt(0).toUpperCase() + answers.projectType.slice(1)} discovery` : 'A few thoughtful questions can make the next step easier.'}</p>
        <div className="aside-divider" />
        <div className="aside-promise"><span aria-hidden="true">↗</span><p>Build a useful project brief one decision at a time.</p></div>
        <div className="aside-privacy"><span aria-hidden="true">⌑</span><p>Your draft saves on this device. Contact details are sent only when you submit your blueprint.</p></div>
      </aside>
    </div>
    <Dialog open={discardOpen} onClose={() => setDiscardOpen(false)} aria-labelledby="discard-title" aria-describedby="discard-description">
      <DialogTitle id="discard-title">Start a new discovery?</DialogTitle>
      <DialogContent><DialogContentText id="discard-description">This clears the current answers saved in this browser. This cannot be undone.</DialogContentText></DialogContent>
      <DialogActions><Button onClick={() => setDiscardOpen(false)}>Keep working</Button><Button onClick={() => { reset(); setDiscardOpen(false); }} color="error">Clear draft</Button></DialogActions>
    </Dialog>
  </div>;
}
