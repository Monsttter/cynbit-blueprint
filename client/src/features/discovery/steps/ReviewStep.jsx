import { Alert, Button, Checkbox, FormControlLabel, Grid, Typography } from '@mui/material';
import { useWizard } from '../WizardContext.jsx';
import FormField from '../components/FormField.jsx';
import StepHeading from '../components/StepHeading.jsx';
import { projectTypes } from '../scopeConfig.js';

function SummarySection({ title, step, onEdit, children }) {
  return <section className="summary-section"><div className="summary-section-heading"><h2>{title}</h2><Button variant="text" size="small" onClick={() => onEdit(step)} aria-label={`Edit ${title}`}>Edit</Button></div>{children}</section>;
}

function SummaryValue({ label, value }) {
  const display = Array.isArray(value) ? value.join(', ') : value;
  return <div className="summary-value"><span>{label}</span><p>{display || <i>Not provided</i>}</p></div>;
}

export default function ReviewStep() {
  const { answers, update, errors, setStep, storageAvailable } = useWizard();
  const projectType = projectTypes.find((item) => item.id === answers.projectType)?.title || 'Project';
  const edit = (step) => setStep(step, true);
  return <>
    <StepHeading eyebrow="STEP 05 · REVIEW" title="Take a look over your project." description="Review your answers and update any section before you finish." />
    {!storageAvailable && <Alert severity="warning" className="review-alert">This browser could not save your draft. Keep this page open until you finish.</Alert>}
    <div className="review-summary">
      <SummarySection title="Project type" step={0} onEdit={edit}><SummaryValue label="Type" value={projectType} /><SummaryValue label="Project name" value={answers.projectName} /></SummarySection>
      <SummarySection title="The idea" step={1} onEdit={edit}><SummaryValue label="Problem" value={answers.problem} /><SummaryValue label="Idea" value={answers.idea} /><SummaryValue label="Users" value={answers.users} /><SummaryValue label="Outcome" value={answers.outcome} /></SummarySection>
      <SummarySection title="Scope" step={2} onEdit={edit}>
        <SummaryValue label="User roles" value={answers.userRoles} />{answers.otherRole && <SummaryValue label="Other role" value={answers.otherRole} />}
        <SummaryValue label="Features" value={answers.features} />{answers.otherFeature && <SummaryValue label="Other feature" value={answers.otherFeature} />}
        <SummaryValue label="Platforms" value={answers.platforms} /><SummaryValue label="Integrations" value={answers.integrations} />
        {answers.integrationOther && <SummaryValue label="Other integration" value={answers.integrationOther} />}
        <SummaryValue label="Authentication" value={answers.authentication} /><SummaryValue label="Existing system" value={answers.existingSystem} />
        {answers.existingSystemDetails && <SummaryValue label="System details" value={answers.existingSystemDetails} />}
        {answers.billing && <SummaryValue label="Billing" value={answers.billing} />}{answers.aiUseCase && <SummaryValue label="AI use case" value={answers.aiUseCase} />}
      </SummarySection>
      <SummarySection title="Expectations" step={3} onEdit={edit}><SummaryValue label="Budget" value={answers.budget} /><SummaryValue label="Timeline" value={answers.timeline} /><SummaryValue label="Complexity" value={answers.complexity} /><SummaryValue label="Technology preferences" value={answers.technologyPreferences} /><SummaryValue label="Additional requirements" value={answers.constraints} /></SummarySection>
    </div>
    <section className="contact-section" aria-labelledby="contact-heading">
      <div className="summary-section-heading"><div><Typography component="h2" variant="h6" id="contact-heading">Where should we send your reference?</Typography><Typography variant="body2" color="text.secondary">Contact details are stored privately with this prototype submission.</Typography></div></div>
      <Grid container spacing={2}><Grid size={{ xs: 12, sm: 6 }}><FormField id="contactName" label="Full name" value={answers.contactName} onChange={(value) => update('contactName', value)} error={errors.contactName} autoComplete="name" /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><FormField id="contactEmail" label="Email address" type="email" value={answers.contactEmail} onChange={(value) => update('contactEmail', value)} error={errors.contactEmail} autoComplete="email" /></Grid>
        <Grid size={{ xs: 12 }}><FormField id="company" label="Company or organization" optional value={answers.company} onChange={(value) => update('company', value)} error={errors.company} autoComplete="organization" /></Grid></Grid>
      <FormControlLabel className="consent-label" control={<Checkbox checked={answers.consent} onChange={(event) => update('consent', event.target.checked)} inputProps={{ 'aria-describedby': errors.consent ? 'consent-error' : undefined }} />} label="I agree to submit my contact details and project information to this independent assessment prototype to create a shareable blueprint. This is not a Cynbit production service." />
      {errors.consent && <Typography id="consent-error" role="alert" className="consent-error">{errors.consent}</Typography>}
    </section>
    <Alert severity="info" className="review-note">Technical recommendations in a future blueprint are preliminary suggestions, not official Cynbit quotations or delivery commitments.</Alert>
  </>;
}
