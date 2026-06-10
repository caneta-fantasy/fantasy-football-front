// src/utils/positions.ts
export type RosterSlot = 'GK' | 'DEF' | 'MEI' | 'ATA';

export function mapPositionToSlot(position: string): RosterSlot | null {
  const n = position.toLowerCase();
  if (n === 'goalkeeper') return 'GK';
  if (n === 'defense' || n === 'defender') return 'DEF';
  if (n === 'midfielder') return 'MEI';
  if (['attacker', 'forward', 'striker', 'winger'].includes(n)) return 'ATA';
  return null;
}
