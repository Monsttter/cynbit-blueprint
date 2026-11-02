import { env } from '../config/env.js';
import { generateBlueprint } from './blueprintService.js';
import { blueprintRefinementSchema, blueprintSchema, isGroundedRefinement } from './blueprintSchema.js';
import { requestGeminiRefinement } from './geminiClient.js';

export async function generateBlueprintWithSource({ answers, apiKey = env.geminiApiKey, model = env.geminiModel, timeoutMs = env.geminiTimeoutMs, fetchImpl = fetch } = {}) {
  const deterministicBlueprint = generateBlueprint(answers);
  if (!apiKey) return { blueprint: deterministicBlueprint, generationSource: 'rules' };
  try {
    const rawRefinement = await requestGeminiRefinement({ answers, deterministicBlueprint, apiKey, model, timeoutMs, fetchImpl });
    const refinement = blueprintRefinementSchema.parse(rawRefinement);
    if (!isGroundedRefinement(refinement, deterministicBlueprint)) throw new Error('Gemini refinement did not preserve user-selected details.');
    const blueprint = blueprintSchema.parse({
      ...deterministicBlueprint,
      ...refinement,
      title: deterministicBlueprint.title,
      discoveryContext: deterministicBlueprint.discoveryContext,
      userRoles: deterministicBlueprint.userRoles,
      disclaimer: deterministicBlueprint.disclaimer,
    });
    return { blueprint, generationSource: 'gemini' };
  } catch {
    console.warn('Gemini blueprint refinement was unavailable or invalid; using deterministic rules.');
    return { blueprint: deterministicBlueprint, generationSource: 'rules' };
  }
}
