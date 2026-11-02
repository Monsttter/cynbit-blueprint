import { z } from 'zod';

const text = z.string().trim().min(1).max(5000);
const nonemptyList = z.array(text).min(1).max(40);
const architectureItem = z.object({ recommendation: text, basis: text }).strict();
const requirement = z.object({ requirement: text, source: z.enum(['selected', 'suggested']), status: text }).strict();
const role = z.object({ role: text, source: z.literal('selected'), suggestedPermissions: nonemptyList }).strict();
const stackItem = z.object({ area: text, recommendation: text, reason: text }).strict();
const risk = z.object({ title: text, detail: text }).strict();
const phase = z.object({ name: text, activities: nonemptyList }).strict();
const summary = z.object({ project: text, problem: text, targetUsers: text, expectedOutcome: text }).strict();
const integrations = z.object({ requested: z.array(text).max(30), optionalSuggestions: z.array(text).max(30) }).strict();
const complexity = z.object({ level: z.enum(['Low', 'Medium', 'High']), factors: z.array(text).max(20), note: text }).strict();

export const blueprintSchema = z.object({
  schemaVersion: z.literal('1.0'),
  title: text,
  executiveSummary: summary,
  discoveryContext: z.array(z.object({ label: text, value: text, source: z.literal('User-provided') }).strict()).max(30),
  functionalRequirements: z.array(requirement).max(60),
  userRoles: z.array(role).max(30),
  architecture: z.object({ frontend: architectureItem, backend: architectureItem, database: architectureItem, hosting: architectureItem }).strict(),
  technologyStack: z.array(stackItem).max(30),
  integrations,
  complexity,
  risks: z.array(risk).min(1).max(30),
  developmentPhases: z.array(phase).min(1).max(20),
  openQuestions: z.array(text).max(40),
  disclaimer: text,
}).strict();

export const blueprintRefinementSchema = z.object({
  executiveSummary: summary,
  functionalRequirements: z.array(requirement).max(60),
  architecture: blueprintSchema.shape.architecture,
  technologyStack: z.array(stackItem).max(30),
  integrations,
  complexity,
  risks: z.array(risk).min(1).max(30),
  developmentPhases: z.array(phase).min(1).max(20),
  openQuestions: z.array(text).max(40),
}).strict();

const str = { type: 'string' };
const strings = { type: 'array', items: str };
const props = (properties, required = Object.keys(properties)) => ({ type: 'object', properties, required, propertyOrdering: required });
const itemList = (properties, required = Object.keys(properties)) => ({ type: 'array', items: props(properties, required) });

export const geminiResponseSchema = props({
  executiveSummary: props({ project: str, problem: str, targetUsers: str, expectedOutcome: str }),
  functionalRequirements: itemList({ requirement: str, source: { type: 'string', enum: ['selected', 'suggested'] }, status: str }),
  architecture: props({ frontend: props({ recommendation: str, basis: str }), backend: props({ recommendation: str, basis: str }), database: props({ recommendation: str, basis: str }), hosting: props({ recommendation: str, basis: str }) }),
  technologyStack: itemList({ area: str, recommendation: str, reason: str }),
  integrations: props({ requested: strings, optionalSuggestions: strings }),
  complexity: props({ level: { type: 'string', enum: ['Low', 'Medium', 'High'] }, factors: strings, note: str }),
  risks: itemList({ title: str, detail: str }),
  developmentPhases: itemList({ name: str, activities: strings }),
  openQuestions: strings,
});

export function isGroundedRefinement(refinement, deterministic) {
  const requiredSelections = deterministic.functionalRequirements.filter((item) => item.source === 'selected').map((item) => item.requirement).sort();
  const selectedByModel = refinement.functionalRequirements.filter((item) => item.source === 'selected').map((item) => item.requirement).sort();
  const requestedIntegrations = [...deterministic.integrations.requested].sort();
  const integrationsByModel = [...refinement.integrations.requested].sort();
  return JSON.stringify(requiredSelections) === JSON.stringify(selectedByModel)
    && JSON.stringify(requestedIntegrations) === JSON.stringify(integrationsByModel)
    && refinement.executiveSummary.project === deterministic.executiveSummary.project;
}
