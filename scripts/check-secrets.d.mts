export interface SecretFinding { path: string; line: number; rule: string }
export const RULES: { name: string; re: RegExp }[]
export function isForbiddenPath(path: string): boolean
export function scanText(path: string, text: string): SecretFinding[]
export function scanRepo(cwd?: string): SecretFinding[]
