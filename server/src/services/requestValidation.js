const projectTypes = new Set(['web', 'mobile', 'saas', 'ai', 'custom']);
const values = {
  roles: ['Customer / end user', 'Administrator', 'Team member', 'Manager', 'Other', 'App user', 'End user', 'Service provider', 'Account owner', 'Workspace administrator', 'Reviewer / approver', 'Operations team'],
  features: ['User accounts', 'Dashboard', 'Search & filters', 'Payments', 'Notifications', 'Reporting', 'Content management', 'Push notifications', 'In-app payments', 'Camera / media', 'Location / maps', 'Offline access', 'Messaging', 'Workspaces / teams', 'Role-based access', 'Subscription plans', 'Usage limits', 'Analytics dashboard', 'Content generation', 'Question answering', 'Document processing', 'Recommendations', 'Workflow automation', 'Human review controls', 'Usage analytics', 'Data import / export', 'Approvals', 'Other'],
  platforms: ['Responsive web', 'Desktop web', 'Mobile web', 'Android', 'iOS', 'Mobile companion app', 'Web interface', 'Mobile app', 'API / backend service', 'Chat or collaboration tool', 'Web application', 'Mobile application', 'Desktop application', 'Internal system'],
  integrations: ['Payments', 'Email / SMS', 'CRM', 'Maps / location', 'Analytics', 'Cloud storage', 'Identity provider / SSO', 'External API', 'Other'],
  authentication: ['Email and password', 'Social sign-in', 'Single sign-on (SSO)', 'Passwordless sign-in', 'Not sure yet'],
  existingSystem: ['Yes', 'No', 'Not sure yet'],
  billing: ['Monthly / annual subscriptions', 'One-time payments', 'Usage-based billing', 'Not needed', 'Not sure yet'],
  aiUseCase: ['Content generation', 'Search or question answering', 'Classification or extraction', 'Recommendations', 'Automated actions', 'Not sure yet'],
  budget: ['Under ₹5 lakh', '₹5–15 lakh', '₹15–50 lakh', '₹50 lakh+', 'Not sure yet'],
  timeline: ['Under 1 month', '1–3 months', '3–6 months', '6+ months', 'Flexible'],
  complexity: ['Simple', 'Moderate', 'Complex', 'Not sure'],
};
const scopedOptions = {
  web: { roles: ['Customer / end user', 'Administrator', 'Team member', 'Manager', 'Other'], features: ['User accounts', 'Dashboard', 'Search & filters', 'Payments', 'Notifications', 'Reporting', 'Content management', 'Other'], platforms: ['Responsive web', 'Desktop web', 'Mobile web'] },
  mobile: { roles: ['App user', 'Administrator', 'Service provider', 'Team member', 'Other'], features: ['User accounts', 'Push notifications', 'In-app payments', 'Camera / media', 'Location / maps', 'Offline access', 'Messaging', 'Other'], platforms: ['Android', 'iOS'] },
  saas: { roles: ['Account owner', 'Workspace administrator', 'Team member', 'Customer / end user', 'Other'], features: ['Workspaces / teams', 'Role-based access', 'Subscription plans', 'Usage limits', 'Analytics dashboard', 'Notifications', 'Reporting', 'Other'], platforms: ['Responsive web', 'Desktop web', 'Mobile companion app'] },
  ai: { roles: ['End user', 'Administrator', 'Reviewer / approver', 'Operations team', 'Other'], features: ['Content generation', 'Question answering', 'Document processing', 'Recommendations', 'Workflow automation', 'Human review controls', 'Usage analytics', 'Other'], platforms: ['Web interface', 'Mobile app', 'API / backend service', 'Chat or collaboration tool'] },
  custom: { roles: ['Customer / end user', 'Administrator', 'Operations team', 'Manager', 'Other'], features: ['User accounts', 'Workflow automation', 'Dashboard', 'Reporting', 'Notifications', 'Data import / export', 'Approvals', 'Other'], platforms: ['Web application', 'Mobile application', 'Desktop application', 'Internal system'] },
};
const textLimits = { projectName: 100, problem: 1200, idea: 1600, users: 500, outcome: 500, otherRole: 100, otherFeature: 160, integrationOther: 100, existingSystemDetails: 500, technologyPreferences: 300, constraints: 800 };
const allowedAnswerFields = new Set([...Object.keys(textLimits), 'projectType', 'userRoles', 'features', 'platforms', 'integrations', 'authentication', 'existingSystem', 'billing', 'aiUseCase', 'budget', 'timeline', 'complexity', 'consent']);
const requiredText = ['problem', 'idea', 'users', 'outcome'];

function issue(errors, field, message) { errors[field] = message; }
function isString(value) { return typeof value === 'string'; }
function normalized(value) { return value.trim(); }

export function validateSubmission(body) {
  const errors = {};
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { valid: false, errors: { body: 'A JSON object is required.' } };
  const { contact, answers } = body;
  if (!contact || typeof contact !== 'object' || Array.isArray(contact)) issue(errors, 'contact', 'Contact details are required.');
  else {
    for (const [field, max] of [['name', 120], ['email', 254]]) {
      if (!isString(contact[field]) || !normalized(contact[field])) issue(errors, `contact.${field}`, 'This field is required.');
      else if (normalized(contact[field]).length > max) issue(errors, `contact.${field}`, `Must be ${max} characters or fewer.`);
    }
    if (isString(contact.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized(contact.email))) issue(errors, 'contact.email', 'Enter a valid email address.');
    if (contact.company != null && (!isString(contact.company) || contact.company.trim().length > 160)) issue(errors, 'contact.company', 'Must be 160 characters or fewer.');
    if (isString(contact.name) && /[\u0000-\u001f\u007f]/.test(contact.name)) issue(errors, 'contact.name', 'Contains unsupported characters.');
  }
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) issue(errors, 'answers', 'Project answers are required.');
  else {
    for (const field of Object.keys(answers)) if (!allowedAnswerFields.has(field)) issue(errors, 'answers', 'Contains an unexpected field.');
    if (!projectTypes.has(answers.projectType)) issue(errors, 'projectType', 'Choose a valid project type.');
    for (const field of requiredText) if (!isString(answers[field]) || !normalized(answers[field])) issue(errors, field, 'This field is required.');
    for (const [field, max] of Object.entries(textLimits)) {
      if (answers[field] != null && (!isString(answers[field]) || answers[field].length > max)) issue(errors, field, `Must be text of ${max} characters or fewer.`);
    }
    for (const field of ['roles', 'features', 'platforms', 'integrations']) {
      const allowed = field === 'roles' || field === 'features' || field === 'platforms' ? scopedOptions[answers.projectType]?.[field] || [] : values[field];
      const actualField = field === 'roles' ? 'userRoles' : field;
      if (!Array.isArray(answers[actualField]) || answers[actualField].length > 20 || answers[actualField].some((item) => !allowed.includes(item))) issue(errors, actualField, 'Contains an invalid selection.');
    }
    for (const field of ['authentication', 'existingSystem', 'billing', 'aiUseCase', 'budget', 'timeline', 'complexity']) {
      const value = answers[field];
      if (value && values[field] && !values[field].includes(value)) issue(errors, field, 'Choose a valid option.');
      if (['authentication', 'existingSystem', 'budget', 'timeline', 'complexity'].includes(field) && !value) issue(errors, field, 'This field is required.');
    }
    if (answers.projectType === 'saas' && !answers.billing) issue(errors, 'billing', 'Choose a billing option.');
    if (answers.projectType === 'ai' && !answers.aiUseCase) issue(errors, 'aiUseCase', 'Choose an AI use case.');
    if (typeof answers.consent !== 'boolean' || !answers.consent) issue(errors, 'consent', 'Consent is required to submit this enquiry.');
    if (answers.userRoles?.includes('Other') && !normalized(String(answers.otherRole || ''))) issue(errors, 'otherRole', 'Describe the additional role.');
    if (answers.features?.includes('Other') && !normalized(String(answers.otherFeature || ''))) issue(errors, 'otherFeature', 'Describe the additional feature.');
    if (answers.integrations?.includes('Other') && !normalized(String(answers.integrationOther || ''))) issue(errors, 'integrationOther', 'Name the additional integration.');
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
