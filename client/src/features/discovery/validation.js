const required = (value) => typeof value === 'string' ? value.trim().length > 0 : Boolean(value);

export function validateStep(step, answers) {
  const errors = {};
  if (step === 0 && !required(answers.projectType)) errors.projectType = 'Choose the project type that best fits your idea.';
  if (step === 1) {
    if (!required(answers.problem)) errors.problem = 'Tell us what problem this project should solve.';
    if (!required(answers.idea)) errors.idea = 'Add a short description of your idea.';
    if (!required(answers.users)) errors.users = 'Tell us who you expect to use it.';
    if (!required(answers.outcome)) errors.outcome = 'Describe the outcome you want to achieve.';
  }
  if (step === 2) {
    if (!answers.userRoles?.length) errors.userRoles = 'Choose at least one expected user role.';
    if (answers.userRoles?.includes('Other') && !required(answers.otherRole)) errors.otherRole = 'Describe the additional user role.';
    if (!answers.features?.length) errors.features = 'Choose at least one essential feature.';
    if (answers.features?.includes('Other') && !required(answers.otherFeature)) errors.otherFeature = 'Describe the additional feature.';
    if (!answers.platforms?.length) errors.platforms = 'Choose at least one target platform.';
    if (!required(answers.authentication)) errors.authentication = 'Choose an authentication option or “Not sure yet”.';
    if (!required(answers.existingSystem)) errors.existingSystem = 'Choose an option or “Not sure yet”.';
    if (answers.integrations?.includes('Other') && !required(answers.integrationOther)) errors.integrationOther = 'Name the additional integration.';
    if (answers.projectType === 'saas' && !required(answers.billing)) errors.billing = 'Choose a billing option or “Not sure yet”.';
    if (answers.projectType === 'ai' && !required(answers.aiUseCase)) errors.aiUseCase = 'Choose an AI use case or “Not sure yet”.';
  }
  if (step === 3) {
    if (!required(answers.budget)) errors.budget = 'Choose a range or select “Not sure yet”.';
    if (!required(answers.timeline)) errors.timeline = 'Choose a timeline or select “Flexible”.';
    if (!required(answers.complexity)) errors.complexity = 'Choose a level or select “Not sure”.';
  }
  if (step === 4) {
    if (!required(answers.contactName)) errors.contactName = 'Enter your name.';
    if (!required(answers.contactEmail)) errors.contactEmail = 'Enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.contactEmail.trim())) errors.contactEmail = 'Enter a valid email address.';
    if (!answers.consent) errors.consent = 'Please confirm before completing this discovery.';
  }
  return errors;
}

export function hasDraftContent(answers) {
  return Object.entries(answers).some(([key, value]) => {
    if (key === 'consent') return Boolean(value);
    if (Array.isArray(value)) return value.length > 0;
    return typeof value === 'string' && value.trim().length > 0;
  });
}
