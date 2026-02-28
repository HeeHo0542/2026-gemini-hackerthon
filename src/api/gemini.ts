import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Creature, Environment, EvolutionResult, TrialResult } from '../types';
import { ENVIRONMENT_SYSTEM_PROMPT, buildEnvironmentUserPrompt } from './prompts';
import { parseGeminiJSON, callWithRetry, mapEnvironmentResponse } from './utils';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(API_KEY);

const textModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  generationConfig: {
    temperature: 0.9,
    topP: 0.95,
    maxOutputTokens: 1200,
    responseMimeType: 'application/json',
  },
});

export async function generateCreature(_keyword1: string, _keyword2: string): Promise<Creature | null> {
  // TODO: Implement
  return null;
}

export async function generateEnvironment(
  creature: Creature,
  chaosLevel: number,
  prevEnv?: Environment,
): Promise<Environment | null> {
  const userPrompt = buildEnvironmentUserPrompt(creature, chaosLevel, prevEnv);

  return callWithRetry(async () => {
    const result = await textModel.generateContent({
      systemInstruction: ENVIRONMENT_SYSTEM_PROMPT,
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    });

    const text = result.response.text();
    console.log('[Gemini Environment Raw]', text);

    const parsed = parseGeminiJSON(text);
    if (!parsed) return null;

    return mapEnvironmentResponse(parsed);
  });
}

export async function generateEvolution(
  _creature: Creature,
  _environment: Environment,
): Promise<EvolutionResult | null> {
  // TODO: Implement
  return null;
}

export async function generateTrial(_creature: Creature): Promise<TrialResult | null> {
  // TODO: Implement
  return null;
}
