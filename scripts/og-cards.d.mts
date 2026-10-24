export const CARD_LIMIT: number
export function jpegSize(buf: Buffer): { w: number; h: number } | null
export function checkCards(dir: string, expected: string[], opts: { width: number; height: number; limit?: number }): string[]
export function skipRequested(env: Record<string, string | undefined>): boolean
