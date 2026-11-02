import { Alert } from '@mui/material';
import { useWizard } from '../WizardContext.jsx';
import { projectTypes } from '../scopeConfig.js';
import OptionCard from '../components/OptionCard.jsx';
import StepHeading from '../components/StepHeading.jsx';

export default function ProjectTypeStep() {
  const { answers, update, errors } = useWizard();
  const selectType = (type) => {
    if (answers.projectType !== type) {
      update('userRoles', []); update('otherRole', '');
      update('features', []); update('otherFeature', ''); update('platforms', []);
      update('billing', ''); update('aiUseCase', '');
    }
    update('projectType', type);
  };
  return <>
    <StepHeading eyebrow="STEP 01 · PROJECT TYPE" title="What are you looking to build?" description="Choose the closest fit. You can add more detail in the next steps." />
    <div className="project-type-grid">{projectTypes.map((type) => <OptionCard key={type.id} title={type.title} description={type.description} icon={type.icon} selected={answers.projectType === type.id} onClick={() => selectType(type.id)} />)}</div>
    {errors.projectType && <Alert severity="error" className="inline-alert">{errors.projectType}</Alert>}
  </>;
}
