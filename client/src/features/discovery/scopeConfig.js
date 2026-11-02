export const projectTypes = [
  { id: 'web', title: 'Web application', description: 'A browser-based product or internal tool.', icon: '</>' },
  { id: 'mobile', title: 'Mobile application', description: 'A product designed for phones or tablets.', icon: '▯' },
  { id: 'saas', title: 'SaaS product', description: 'Software offered to multiple customers.', icon: '◫' },
  { id: 'ai', title: 'AI solution', description: 'Software that applies AI to a task or workflow.', icon: '✳' },
  { id: 'custom', title: 'Custom software', description: 'A tailored system for a specific need.', icon: '⌘' },
];

export const scopeByProject = {
  web: { roles: ['Customer / end user', 'Administrator', 'Team member', 'Manager', 'Other'], features: ['User accounts', 'Dashboard', 'Search & filters', 'Payments', 'Notifications', 'Reporting', 'Content management', 'Other'], platforms: ['Responsive web', 'Desktop web', 'Mobile web'] },
  mobile: { roles: ['App user', 'Administrator', 'Service provider', 'Team member', 'Other'], features: ['User accounts', 'Push notifications', 'In-app payments', 'Camera / media', 'Location / maps', 'Offline access', 'Messaging', 'Other'], platforms: ['Android', 'iOS'] },
  saas: { roles: ['Account owner', 'Workspace administrator', 'Team member', 'Customer / end user', 'Other'], features: ['Workspaces / teams', 'Role-based access', 'Subscription plans', 'Usage limits', 'Analytics dashboard', 'Notifications', 'Reporting', 'Other'], platforms: ['Responsive web', 'Desktop web', 'Mobile companion app'] },
  ai: { roles: ['End user', 'Administrator', 'Reviewer / approver', 'Operations team', 'Other'], features: ['Content generation', 'Question answering', 'Document processing', 'Recommendations', 'Workflow automation', 'Human review controls', 'Usage analytics', 'Other'], platforms: ['Web interface', 'Mobile app', 'API / backend service', 'Chat or collaboration tool'] },
  custom: { roles: ['Customer / end user', 'Administrator', 'Operations team', 'Manager', 'Other'], features: ['User accounts', 'Workflow automation', 'Dashboard', 'Reporting', 'Notifications', 'Data import / export', 'Approvals', 'Other'], platforms: ['Web application', 'Mobile application', 'Desktop application', 'Internal system'] },
};

export const integrations = ['Payments', 'Email / SMS', 'CRM', 'Maps / location', 'Analytics', 'Cloud storage', 'Identity provider / SSO', 'External API', 'Other'];
export const authenticationOptions = ['Email and password', 'Social sign-in', 'Single sign-on (SSO)', 'Passwordless sign-in', 'Not sure yet'];
export const existingSystemOptions = ['Yes', 'No', 'Not sure yet'];
export const billingOptions = ['Monthly / annual subscriptions', 'One-time payments', 'Usage-based billing', 'Not needed', 'Not sure yet'];
export const aiUseCases = ['Content generation', 'Search or question answering', 'Classification or extraction', 'Recommendations', 'Automated actions', 'Not sure yet'];
export const budgetOptions = ['Under ₹5 lakh', '₹5–15 lakh', '₹15–50 lakh', '₹50 lakh+', 'Not sure yet'];
export const timelineOptions = ['Under 1 month', '1–3 months', '3–6 months', '6+ months', 'Flexible'];
export const complexityOptions = ['Simple', 'Moderate', 'Complex', 'Not sure'];
