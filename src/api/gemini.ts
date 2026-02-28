import { GoogleGenAI } from '@google/genai';
import type { Creature, Environment, EvolutionResult, TrialResult } from '../types';
import {
  CREATURE_SYSTEM_PROMPT,
  ENVIRONMENT_SYSTEM_PROMPT,
  EVOLUTION_SYSTEM_PROMPT,
  TRIAL_SYSTEM_PROMPT,
  SYNTHESIS_SYSTEM_PROMPT,
  buildCreatureUserPrompt,
  buildEnvironmentUserPrompt,
  buildEvolutionUserPrompt,
  buildTrialUserPrompt,
  buildSynthesisUserPrompt,
} from './prompts';
import { callWithRetry } from './utils';
import {
  creatureJsonSchema,
  parseCreatureResponse,
  environmentJsonSchema,
  parseEnvironmentResponse,
  evolutionJsonSchema,
  parseEvolutionResponse,
  trialJsonSchema,
  parseTrialResponse,
  synthesisJsonSchema,
  parseSynthesisResponse,
} from './schemas';
import type { SynthesisResult } from '../game/types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const ai = new GoogleGenAI({ apiKey: API_KEY });

const BASE_CONFIG = {
  temperature: 0.9,
  topP: 0.95,
  maxOutputTokens: 8192,
  responseMimeType: 'application/json' as const,
  thinkingConfig: { thinkingBudget: 0 },
};

export async function generateCreature(keyword1: string, keyword2: string): Promise<Creature | null> {
  const userPrompt = buildCreatureUserPrompt(keyword1, keyword2);

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        ...BASE_CONFIG,
        systemInstruction: CREATURE_SYSTEM_PROMPT,
        responseJsonSchema: creatureJsonSchema,
      },
    });

    const parsed = JSON.parse(response.text!);
    console.log('[Gemini Creature]', parsed);
    return parseCreatureResponse(parsed);
  });
}

export async function generateEnvironment(
  creature: Creature,
  chaosLevel: number,
  prevEnv?: Environment,
): Promise<Environment | null> {
  const userPrompt = buildEnvironmentUserPrompt(creature, chaosLevel, prevEnv);

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        ...BASE_CONFIG,
        systemInstruction: ENVIRONMENT_SYSTEM_PROMPT,
        responseJsonSchema: environmentJsonSchema,
      },
    });

    const parsed = JSON.parse(response.text!);
    console.log('[Gemini Environment]', parsed);
    return parseEnvironmentResponse(parsed);
  });
}

export async function generateEvolution(
  creature: Creature,
  environment: Environment,
): Promise<EvolutionResult | null> {
  const userPrompt = buildEvolutionUserPrompt(creature, environment);

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        ...BASE_CONFIG,
        systemInstruction: EVOLUTION_SYSTEM_PROMPT,
        responseJsonSchema: evolutionJsonSchema,
      },
    });

    const parsed = JSON.parse(response.text!);
    console.log('[Gemini Evolution]', parsed);
    return parseEvolutionResponse(parsed);
  });
}

export async function generateTrial(
  creature: Creature,
  environment: Environment,
  chaosLevel: number,
): Promise<TrialResult | null> {
  const userPrompt = buildTrialUserPrompt(creature, environment, chaosLevel);

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        ...BASE_CONFIG,
        systemInstruction: TRIAL_SYSTEM_PROMPT,
        responseJsonSchema: trialJsonSchema,
      },
    });

    const parsed = JSON.parse(response.text!);
    console.log('[Gemini Trial]', parsed);
    return parseTrialResponse(parsed);
  });
}

export async function generateSynthesis(
  creature: Creature,
  trialResult: TrialResult,
  newKeyword: string,
): Promise<SynthesisResult | null> {
  const userPrompt = buildSynthesisUserPrompt(creature, trialResult, newKeyword);

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        ...BASE_CONFIG,
        systemInstruction: SYNTHESIS_SYSTEM_PROMPT,
        responseJsonSchema: synthesisJsonSchema,
      },
    });

    const parsed = JSON.parse(response.text!);
    console.log('[Gemini Synthesis]', parsed);
    return parseSynthesisResponse(parsed);
  });
}
