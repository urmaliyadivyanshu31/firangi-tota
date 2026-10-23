export type Lang = 'en' | 'hi';
export type L10n = Record<Lang, string>;
export type EraId = 'delhi-1857' | 'lahore-1929' | 'bombay-1942' | 'delhi-1947';
export type Channel = 'petition' | 'note' | 'radio' | 'telegram';
export type Tier = 1 | 2 | 3;
export type TellKind = 'name' | 'place' | 'number' | 'date' | 'weekday' | 'anachronism'
  | 'habit' | 'empty-loop' | 'form' | 'knowledge';

export interface Source { id: string; author: string; title: string; year: string; url?: string }
export interface SourceRef { id: string; loc?: string }            // loc: page, section or URL anchor
export interface Fact { id: string; label: L10n; value: L10n; sources: SourceRef[]; hardHidden?: boolean }
export interface Rule { id: string; text: L10n; arrivesOnDay: number } // 1-based day index
export interface Tell {
  kind: TellKind; explain: L10n; factId?: string; sources?: SourceRef[]
  ruleId?: string                                  // the rulebook rule that lets a player catch this slip
}
export interface Message {
  id: string; tier: Tier; real: boolean; pair?: string; onDay?: number;
  from: L10n; to: L10n; text: L10n;               // text may contain {date} {weekday} {date+N} {weekday+N}
  checks?: { en: string[]; hi: string[] };        // pencil-mark substrings (after placeholder fill)
  document?: { sources: SourceRef[] };            // present => "📜 Real document"
  why?: { text: L10n; sources: SourceRef[] };     // required when real
  tells?: Tell[];                                 // required (≥1) when forged
}
export interface Receipt { id: string; who: L10n; quote: L10n; joke: L10n; theirSide?: L10n; source: SourceRef }
export interface Epilogue { survived: L10n[]; caught: L10n[]; sources: SourceRef[] }
export interface Era {
  id: EraId; order: 1 | 2 | 3 | 4; title: L10n; place: L10n; year: string;
  persona: L10n; intro: [L10n, L10n]; windowStart: string;   // ISO 'YYYY-MM-DD', 14 days from here
  channel: Channel; forger: L10n;
  sources: Source[]; facts: Fact[]; rules: Rule[]; messages: Message[];
  receipts: Receipt[]; epilogue: Epilogue;
  endings: { caught: { stamp: L10n; title: L10n }; survived: { stamp: L10n; title: L10n } }
}
