const clean = (value) => typeof value === 'string' ? value.trim() : '';
const list = (items, extra) => [...(Array.isArray(items) ? items : []).filter((item) => item !== 'Other'), ...(extra ? [clean(extra)] : [])];
const title = (type) => ({ web: 'web application', mobile: 'mobile application', saas: 'SaaS product', ai: 'AI solution', custom: 'custom software' }[type] || 'software project');

export function generateBlueprint(answers) {
  const name = clean(answers.projectName) || `A ${title(answers.projectType)}`;
  const features = list(answers.features, answers.otherFeature);
  const roles = list(answers.userRoles, answers.otherRole);
  const explicitIntegrations = list(answers.integrations, answers.integrationOther);
  const platforms = answers.platforms || [];
  const selectedStack = clean(answers.technologyPreferences);
  const complexity = answers.complexity === 'Complex' || explicitIntegrations.length >= 4 || (features.length >= 7 && answers.existingSystem === 'Yes') ? 'High' : answers.complexity === 'Simple' && features.length <= 4 && explicitIntegrations.length <= 1 ? 'Low' : 'Medium';
  const factors = [
    `${features.length} selected feature${features.length === 1 ? '' : 's'}`,
    `${explicitIntegrations.length} requested integration${explicitIntegrations.length === 1 ? '' : 's'}`,
    answers.existingSystem === 'Yes' ? 'connection to an existing system' : null,
    answers.projectType === 'ai' ? `an AI use case (${answers.aiUseCase || 'to be clarified'})` : null,
    platforms.length > 1 ? 'multiple target platforms' : null,
  ].filter(Boolean);
  const front = answers.projectType === 'mobile' ? 'React Native or a native Android/iOS application, selected after confirming platform-specific needs' : 'React with a responsive interface for the selected web platform';
  const backend = answers.projectType === 'ai' ? 'A Node.js API with a separately evaluated model/provider integration and human review where needed' : 'A Node.js API with REST endpoints and server-side validation';
  const database = answers.projectType === 'saas' || roles.some((role) => /workspace|account owner/i.test(role)) ? 'PostgreSQL with tenant boundaries designed and tested from the start' : 'PostgreSQL for structured records, relationships and transactional data';
  const architecture = {
    frontend: { recommendation: front, basis: 'Recommendation based on the selected project type and platforms.' },
    backend: { recommendation: backend, basis: 'Keeps business rules and sensitive operations on the server.' },
    database: { recommendation: database, basis: 'Supports structured data and reliable relationships.' },
    hosting: { recommendation: 'Use a managed application host and managed PostgreSQL in a region appropriate for the intended users; decide environments, backups and monitoring before launch.', basis: 'Hosting provider and region are not specified.' },
  };
  const stack = [
    { area: 'Frontend', recommendation: front.split(' for ')[0], reason: 'Fits the selected project type and target platform.' },
    { area: 'Backend', recommendation: 'Node.js with Express', reason: 'A small REST service can validate and coordinate application workflows.' },
    { area: 'Database', recommendation: 'PostgreSQL', reason: 'Relational storage suits structured product data and transactions.' },
  ];
  if (selectedStack) stack.push({ area: 'Client preference', recommendation: selectedStack, reason: 'Provided by the user; compatibility and operational fit still need review.' });
  const risks = [];
  if (explicitIntegrations.length) risks.push({ title: 'External integration reliability', detail: `Confirm API access, data mapping, rate limits and failure handling for: ${explicitIntegrations.join(', ')}.` });
  if (answers.existingSystem === 'Yes') risks.push({ title: 'Existing system compatibility', detail: clean(answers.existingSystemDetails) || 'The system, data quality and available interfaces need technical discovery.' });
  if (answers.projectType === 'ai') risks.push({ title: 'AI output quality and data handling', detail: 'Define evaluation criteria, human oversight, privacy boundaries and acceptable failure behavior before selecting a model.' });
  if (platforms.length > 1) risks.push({ title: 'Cross-platform consistency', detail: `The requested platforms are ${platforms.join(', ')}; confirm which capabilities must be shared and tested on each.` });
  if (answers.constraints) risks.push({ title: 'Stated constraints', detail: clean(answers.constraints) });
  if (!risks.length) risks.push({ title: 'Scope clarity', detail: 'Validate workflows, edge cases and acceptance criteria with representative users before committing to implementation scope.' });
  const openQuestions = [];
  if (!answers.projectName) openQuestions.push('What working name should be used for the project?');
  if (answers.existingSystem === 'Yes' && !answers.existingSystemDetails) openQuestions.push('Which existing system is involved, and what interfaces or data can it provide?');
  if (answers.integrations?.length) openQuestions.push('Which exact providers, accounts and data flows are required for the selected integrations?');
  if (!selectedStack) openQuestions.push('Are there technology, hosting or team constraints that should shape the stack?');
  if (answers.budget === 'Not sure yet') openQuestions.push('Is there a budget range or prioritization boundary for an initial release?');
  if (answers.timeline === 'Flexible') openQuestions.push('Are there external milestones that could change the preferred sequence?');
  openQuestions.push('What measurable acceptance criteria would demonstrate that the intended outcome has been achieved?');
  const discoveryContext = [
    ['Target platforms', platforms.join(', ')],
    ['Authentication preference', answers.authentication],
    ['Existing system', answers.existingSystem === 'Yes' ? `Yes${answers.existingSystemDetails ? ` — ${clean(answers.existingSystemDetails)}` : ''}` : answers.existingSystem],
    ['SaaS billing preference', answers.billing],
    ['AI use case', answers.aiUseCase],
    ['Client budget range', answers.budget],
    ['Client timeline preference', answers.timeline],
    ['Client complexity impression', answers.complexity],
    ['Technology preferences', selectedStack],
    ['Additional constraints', clean(answers.constraints)],
  ].filter(([, value]) => Boolean(value)).map(([label, value]) => ({ label, value, source: 'User-provided' }));
  return {
    schemaVersion: '1.0',
    title: name,
    executiveSummary: { project: `A ${title(answers.projectType)}${answers.projectName ? ` called ${clean(answers.projectName)}` : ''}.`, problem: clean(answers.problem), targetUsers: clean(answers.users), expectedOutcome: clean(answers.outcome) },
    discoveryContext,
    functionalRequirements: [
      ...features.map((feature) => ({ requirement: feature, source: 'selected', status: 'User-provided' })),
      ...(!features.length ? [] : [{ requirement: 'Define acceptance criteria and edge cases for each selected feature before implementation.', source: 'suggested', status: 'Inferred suggestion' }]),
    ],
    userRoles: roles.map((role) => ({ role, source: 'selected', suggestedPermissions: role.toLowerCase().includes('admin') || role.toLowerCase().includes('owner') ? ['Manage relevant users and settings; confirm exact scope with the project owner.'] : ['Access only the workflows and records required for this role; confirm exact permissions during discovery.'] })),
    architecture,
    technologyStack: stack,
    integrations: { requested: explicitIntegrations, optionalSuggestions: explicitIntegrations.length ? [] : ['Add an integration only when a confirmed workflow requires it.'] },
    complexity: { level: complexity, factors, note: 'Directional planning assessment based on submitted scope; not an estimate of effort, cost or delivery time.' },
    risks,
    developmentPhases: [
      { name: '1. Validate and shape scope', activities: ['Confirm user workflows, acceptance criteria, data and unresolved questions.'] },
      { name: '2. Establish foundations', activities: ['Define architecture, security boundaries, environments and core data model.'] },
      { name: '3. Build the first useful release', activities: features.length ? features.slice(0, 4).map((feature) => `Implement and validate ${feature}.`) : ['Implement the highest-priority confirmed workflow.'] },
      { name: '4. Integrate and harden', activities: ['Test integrations, permissions, failure paths, accessibility and performance.'] },
      { name: '5. Pilot and iterate', activities: ['Validate with representative users, resolve defects and plan subsequent improvements.'] },
    ],
    openQuestions: [...new Set(openQuestions)],
    disclaimer: 'This is a preliminary planning document generated from submitted information. Recommendations and assumptions are suggestions only, not an official Cynbit proposal, quotation, scope commitment or delivery commitment.',
  };
}
