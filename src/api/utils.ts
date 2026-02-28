import type { Environment, EnvVariables, VisualTone, Sensory } from '../types';
import { convertToPlayerAxes } from '../game/environment';

export function parseGeminiJSON<T>(text: string): T | null {
  try {
    const cleaned = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as T;
    return null;
  } catch {
    return null;
  }
}

export async function callWithRetry<T>(
  fn: () => Promise<T | null>,
  maxRetries = 2,
): Promise<T | null> {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const result = await fn();
      if (result) return result;
    } catch (e) {
      console.error(`API call attempt ${i + 1} failed:`, e);
    }
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapEnvironmentResponse(raw: any): Environment {
  const envVariables: EnvVariables = raw.env_variables;
  const visualTone: VisualTone = {
    primaryColor: raw.visual_tone?.primary_color ?? '',
    mood: raw.visual_tone?.mood ?? '',
    keyVisual: raw.visual_tone?.key_visual ?? '',
  };
  const sensory: Sensory = {
    visual: raw.sensory?.visual ?? '',
    auditory: raw.sensory?.auditory ?? '',
    tactile: raw.sensory?.tactile ?? '',
  };

  return {
    eventName: raw.event_name ?? '',
    cascadingCause: raw.cascading_cause ?? '',
    envVariables,
    envTags: raw.env_tags ?? [],
    threatCategory: raw.threat_category ?? '',
    instabilityIndex: raw.instability_index ?? 50,
    narrative: raw.narrative ?? '',
    sensory,
    threatDetail: raw.threat_detail ?? '',
    hiddenOpportunity: raw.hidden_opportunity ?? '',
    visualTone,
    playerAxes: convertToPlayerAxes(envVariables),
  };
}
