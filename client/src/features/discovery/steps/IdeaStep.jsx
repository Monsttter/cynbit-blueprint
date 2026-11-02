import { Grid } from '@mui/material';
import { useWizard } from '../WizardContext.jsx';
import FormField from '../components/FormField.jsx';
import StepHeading from '../components/StepHeading.jsx';

export default function IdeaStep() {
  const { answers, update, errors } = useWizard();
  return <>
    <StepHeading eyebrow="STEP 02 · YOUR IDEA" title="Tell us what you have in mind." description="A few details about the problem and the people it affects will help shape a useful brief." />
    <Grid container spacing={2.25}>
      <Grid size={{ xs: 12 }}><FormField id="projectName" label="Project name" optional value={answers.projectName} onChange={(value) => update('projectName', value)} placeholder="e.g. Field Notes" /></Grid>
      <Grid size={{ xs: 12 }}><FormField id="problem" label="What problem are you trying to solve?" value={answers.problem} onChange={(value) => update('problem', value)} error={errors.problem} multiline rows={2} placeholder="Describe the challenge or current process that could be better." /></Grid>
      <Grid size={{ xs: 12 }}><FormField id="idea" label="Describe your idea" value={answers.idea} onChange={(value) => update('idea', value)} error={errors.idea} multiline rows={3} placeholder="What would the software help someone do? A rough outline is fine." /></Grid>
      <Grid size={{ xs: 12, md: 6 }}><FormField id="users" label="Who will use this product?" value={answers.users} onChange={(value) => update('users', value)} error={errors.users} multiline rows={2} placeholder="e.g. Customers, internal teams, or both." /></Grid>
      <Grid size={{ xs: 12, md: 6 }}><FormField id="outcome" label="What outcome do you want?" value={answers.outcome} onChange={(value) => update('outcome', value)} error={errors.outcome} multiline rows={2} placeholder="e.g. Reduce manual work or make a service easier to access." /></Grid>
    </Grid>
  </>;
}
