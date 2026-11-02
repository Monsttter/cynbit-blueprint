import { Grid } from '@mui/material';
import { useWizard } from '../WizardContext.jsx';
import FormField from '../components/FormField.jsx';
import ChoiceGroup from '../components/ChoiceGroup.jsx';
import StepHeading from '../components/StepHeading.jsx';
import { aiUseCases, authenticationOptions, billingOptions, existingSystemOptions, integrations, scopeByProject } from '../scopeConfig.js';

export default function ScopeStep() {
  const { answers, update, errors } = useWizard();
  const config = scopeByProject[answers.projectType] || scopeByProject.custom;
  return <>
    <StepHeading eyebrow="STEP 03 · PROJECT SCOPE" title="What should the first version include?" description="Select the essentials. You can include integrations and areas you are still unsure about." />
    <div className="scope-sections">
      <ChoiceGroup label="Who needs access?" options={config.roles} value={answers.userRoles} onChange={(value) => update('userRoles', value)} error={errors.userRoles} />
      {answers.userRoles.includes('Other') && <FormField id="otherRole" label="Other user role" value={answers.otherRole} onChange={(value) => update('otherRole', value)} error={errors.otherRole} placeholder="Describe another role" />}
      <ChoiceGroup label="Essential features" options={config.features} value={answers.features} onChange={(value) => update('features', value)} error={errors.features} />
      {answers.features.includes('Other') && <FormField id="otherFeature" label="Other essential feature" value={answers.otherFeature} onChange={(value) => update('otherFeature', value)} error={errors.otherFeature} placeholder="Describe another feature" />}
      <ChoiceGroup label={answers.projectType === 'mobile' ? 'Which mobile platforms?' : 'Preferred platform'} options={config.platforms} value={answers.platforms} onChange={(value) => update('platforms', value)} error={errors.platforms} />
      <ChoiceGroup label="Integrations you may need" options={integrations} value={answers.integrations} onChange={(value) => update('integrations', value)} />
      {answers.integrations.includes('Other') && <FormField id="integrationOther" label="Other integration" value={answers.integrationOther} onChange={(value) => update('integrationOther', value)} error={errors.integrationOther} placeholder="Name a service or system" />}
      <Grid container spacing={2.25}>
        <Grid size={{ xs: 12, md: 6 }}><ChoiceGroup label="Sign-in or authentication" options={authenticationOptions} value={answers.authentication} onChange={(value) => update('authentication', value)} error={errors.authentication} multiple={false} columns={1} /></Grid>
        <Grid size={{ xs: 12, md: 6 }}><ChoiceGroup label="Connect an existing system?" options={existingSystemOptions} value={answers.existingSystem} onChange={(value) => update('existingSystem', value)} error={errors.existingSystem} multiple={false} columns={1} /></Grid>
      </Grid>
      {answers.existingSystem === 'Yes' && <FormField id="existingSystemDetails" label="What system should connect?" value={answers.existingSystemDetails} onChange={(value) => update('existingSystemDetails', value)} optional placeholder="A name or short description is enough" />}
      {answers.projectType === 'saas' && <ChoiceGroup label="Billing or subscription needs" options={billingOptions} value={answers.billing} onChange={(value) => update('billing', value)} error={errors.billing} multiple={false} columns={2} />}
      {answers.projectType === 'ai' && <ChoiceGroup label="What would the AI help with?" options={aiUseCases} value={answers.aiUseCase} onChange={(value) => update('aiUseCase', value)} error={errors.aiUseCase} multiple={false} columns={2} />}
    </div>
  </>;
}
