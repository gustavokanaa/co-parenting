export const VINCULOS = [
  { id: 'mae', label: 'Mãe', emoji: '👩', cor: '#EAF4F4' },
  { id: 'pai', label: 'Pai', emoji: '👨', cor: '#FCEEE9' },
  { id: 'avo', label: 'Avó', emoji: '👵', cor: '#F3EAF8' },
  { id: 'avop', label: 'Avô', emoji: '👴', cor: '#F3EAF8' },
  { id: 'tia', label: 'Tia', emoji: '👩‍👧', cor: '#E8F4EC' },
  { id: 'tio', label: 'Tio', emoji: '👨‍👧', cor: '#E8F4EC' },
  { id: 'responsavel', label: 'Responsável Legal', emoji: '🧑‍⚖️', cor: '#FFF8E1' },
]

const BY_ID = Object.fromEntries(VINCULOS.map(v => [v.id, v]))
const BY_LABEL = Object.fromEntries(VINCULOS.map(v => [v.label, v]))

function lookup(vinculo: string) {
  return BY_ID[vinculo] ?? BY_LABEL[vinculo] ?? null
}

export function labelVinculo(vinculo: string): string {
  return lookup(vinculo)?.label ?? vinculo
}

export function emojiVinculo(vinculo: string): string {
  return lookup(vinculo)?.emoji ?? '👤'
}

export function corVinculo(vinculo: string): string {
  return lookup(vinculo)?.cor ?? '#F0F0F0'
}
