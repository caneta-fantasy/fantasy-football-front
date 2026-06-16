// src/utils/positions.ts
// Single source for position labels, filter options, and slot mappings.
// Previously these constants were copy-pasted across PlayersList,
// DraftPlayerSearch, PlayerSelectModal, ProposeTradeModal, AcceptTradeModal, etc.

export type RosterSlot = 'GK' | 'DEF' | 'MEI' | 'ATA';

export function mapPositionToSlot(position: string): RosterSlot | null {
  const n = position.toLowerCase();
  if (n === 'goalkeeper') return 'GK';
  if (n === 'defense' || n === 'defender') return 'DEF';
  if (n === 'midfielder') return 'MEI';
  if (['attacker', 'forward', 'striker', 'winger'].includes(n)) return 'ATA';
  return null;
}

/** English position (and ALL/Defense aliases) → Portuguese label. */
export const POSITIONS_TRANSLATION: Record<string, string> = {
  Defender: 'Defensor',
  Midfielder: 'Meio-Campo',
  Attacker: 'Atacante',
  Goalkeeper: 'Goleiro',
  Defense: 'Defesa',
  ALL: 'Todos',
};

/** Position filter dropdown options (closed defense — synthetic Defense unit). */
export const CLOSED_POSITION_OPTIONS = [
  { value: 'ALL', label: 'TODOS' },
  { value: 'DEF', label: 'DEF' },
  { value: 'MEI', label: 'MEI' },
  { value: 'ATA', label: 'ATA' },
];

/** Position filter dropdown options (open defense — real GK + defenders). */
export const OPEN_POSITION_OPTIONS = [
  { value: 'ALL', label: 'TODOS' },
  { value: 'GK', label: 'GK' },
  { value: 'DEF', label: 'DEF' },
  { value: 'MEI', label: 'MEI' },
  { value: 'ATA', label: 'ATA' },
];

/** Slot code → backend position string (closed defense). */
export const CLOSED_POSITIONS_BACKEND_MAP: Record<string, string> = {
  DEF: 'Defense',
  MEI: 'Midfielder',
  ATA: 'Attacker',
};

/** Slot code → backend position string (open defense). */
export const OPEN_POSITIONS_BACKEND_MAP: Record<string, string> = {
  GK: 'Goalkeeper',
  DEF: 'Defender',
  MEI: 'Midfielder',
  ATA: 'Attacker',
};

/** Backend position → which roster slot codes it can occupy (used by trades). */
export const POSITION_SLOT_MAP: Record<string, string[]> = {
  Defense: ['DEF'],
  Defender: ['DEF'],
  Midfielder: ['MEI', 'FLEX'],
  Attacker: ['ATA', 'FLEX'],
  Forward: ['ATA', 'FLEX'],
  Striker: ['ATA', 'FLEX'],
  Winger: ['ATA', 'FLEX'],
};
