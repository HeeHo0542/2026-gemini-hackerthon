import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { statsSchema, specMutationSchema, worldEventSchema, normalizeWorldEvents } from './shared';
import type { SynthesisResult } from '../../game/types';

export const synthesisApiSchema = z.object({
  new_name: z.string(),
  fusion_narrative: z.string(),
  new_traits: z.array(z.string()),
  modified_vulnerabilities: z.array(z.string()),
  energy_strategy: z.string(),
  stat_changes: statsSchema,
  fusion_line: z.string(),
  creature_spec_mutation: specMutationSchema.optional(),
  world_events: z.array(worldEventSchema).optional(),
});

export const synthesisJsonSchema = zodToJsonSchema(synthesisApiSchema);

export function parseSynthesisResponse(raw: unknown): SynthesisResult {
  const p = synthesisApiSchema.parse(raw);
  return {
    newName: p.new_name,
    fusionNarrative: p.fusion_narrative,
    newTraits: p.new_traits,
    modifiedVulnerabilities: p.modified_vulnerabilities,
    energyStrategy: p.energy_strategy,
    statChanges: p.stat_changes,
    fusionLine: p.fusion_line,
    creatureSpecMutation: p.creature_spec_mutation ?? {},
    worldEvents: normalizeWorldEvents(p.world_events),
  };
}
