import type { EnvVariables, PlayerAxes, PlayerAxisLevel } from '../types';

const severityMap: Record<string, number> = {
  // Extreme values (high threat)
  extreme_low: 2, near_zero: 2, micro: 2, desiccated: 2,
  pitch_dark: 2, cataclysmic: 2, toxic: 2, lethal: 2,
  crushing: 2, extreme: 2, extreme_high: 2, scorching: 2,
  // Mid-extreme values
  low: 1, high: 1, dim: 1, bright: 1, thin: 1,
  reducing: 1, dense_inert: 1, scarce: 1, saturated: 1,
  submerged: 1, active: 0.5, volatile: 1.5,
  // Normal (no threat)
  normal: 0, stable: 0, none: 0, dead: 0,
};

function severity(envVars: EnvVariables, key: keyof EnvVariables): number {
  return severityMap[envVars[key]] ?? 0;
}

function toLevel(score: number): PlayerAxisLevel {
  if (score <= 0.5) return 'LOW';
  if (score <= 1.5) return 'NORMAL';
  if (score <= 2.5) return 'HIGH';
  return 'CRITICAL';
}

export function convertToPlayerAxes(envVars: EnvVariables): PlayerAxes {
  const s = (key: keyof EnvVariables) => severity(envVars, key);

  const energyScore = s('luminosity') + s('solvent') * 0.5;
  const physicalScore = (s('temperature') + s('pressure') + s('gravity') * 0.7 + s('tectonics') * 0.8) / 2;
  const purityScore = s('atmosphere') + s('radiation');

  return {
    energy: toLevel(energyScore),
    physical: toLevel(physicalScore),
    purity: toLevel(purityScore),
  };
}

export function getChaosLevel(generation: number): number {
  return Math.min(generation, 5);
}
