import { Grid } from '@mui/material';
import { useWizard } from '../WizardContext.jsx';
import ChoiceGroup from '../components/ChoiceGroup.jsx';
import FormField from '../components/FormField.jsx';
import StepHeading from '../components/StepHeading.jsx';
import { budgetOptions, complexityOptions, timelineOptions } from '../scopeConfig.js';

export default function ConstraintsStep() {
  const { answers, update, errors } = useWizard();
  return <>
    <StepHeading eyebrow="STEP 04 · EXPECTATIONS" title="What should the plan account for?" description="Choose your best estimate for now. “Not sure” and “Flexible” are perfectly fine answers." />
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}><ChoiceGroup label="Estimated budget" options={budgetOptions} value={answers.budget} onChange={(value) => update('budget', value)} error={errors.budget} multiple={false} columns={1} /></Grid>
      <Grid size={{ xs: 12, md: 6 }}><ChoiceGroup label="Expected timeline" options={timelineOptions} value={answers.timeline} onChange={(value) => update('timeline', value)} error={errors.timeline} multiple={false} columns={1} /></Grid>
      <Grid size={{ xs: 12 }}><ChoiceGroup label="How complex does this feel?" options={complexityOptions} value={answers.complexity} onChange={(value) => update('complexity', value)} error={errors.complexity} multiple={false} columns={2} /></Grid>
      <Grid size={{ xs: 12 }}><FormField id="technologyPreferences" label="Technology preferences" optional value={answers.technologyPreferences} onChange={(value) => update('technologyPreferences', value)} placeholder="e.g. React, PostgreSQL, or an existing platform" /></Grid>
      <Grid size={{ xs: 12 }}><FormField id="constraints" label="Additional requirements or constraints" optional value={answers.constraints} onChange={(value) => update('constraints', value)} multiline rows={3} placeholder="Accessibility, compliance, devices, or anything else the plan should consider." /></Grid>
    </Grid>
  </>;
}
