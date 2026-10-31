export type Role = 'ADMIN' | 'LEARNER';
export type UserStatus = 'INVITED' | 'ACTIVE' | 'DISABLED';
export type JlptLevel = 'N5' | 'N4' | 'N3';
export type VerbClass = 'GODAN' | 'ICHIDAN' | 'IRREGULAR';
export type DrillMode = 'STANDARD' | 'CONTRAST' | 'EXAM';

export const CONJUGATION_FORMS = [
  'POLITE',
  'POLITE_NEGATIVE',
  'POLITE_PAST',
  'NEGATIVE',
  'PAST_NEGATIVE',
  'TE',
  'PAST',
  'POTENTIAL',
  'PASSIVE',
  'CAUSATIVE',
  'CAUSATIVE_PASSIVE',
  'VOLITIONAL',
  'CONDITIONAL_BA',
  'IMPERATIVE',
  'PROHIBITIVE',
  'POTENTIAL_CONDITIONAL',
] as const;
export type ConjugationForm = (typeof CONJUGATION_FORMS)[number];

export const JLPT_LEVELS = ['N5', 'N4', 'N3'] as const satisfies readonly JlptLevel[];
export const VERB_CLASSES = [
  'GODAN',
  'ICHIDAN',
  'IRREGULAR',
] as const satisfies readonly VerbClass[];

export type RuleGroup =
  | 'GODAN_U_TSU_RU'
  | 'GODAN_MU_BU_NU'
  | 'GODAN_KU'
  | 'GODAN_GU'
  | 'GODAN_SU'
  | 'ICHIDAN'
  | 'IRREGULAR_SURU'
  | 'IRREGULAR_KURU'
  | 'EXCEPTION_IKU'
  | 'EXCEPTION_ARU';

/** Users sign in with their username, which is also the only name shown in the app. */
export interface User {
  id: string;
  username: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  lastActiveAt: string | null;
}

export interface Settings {
  enabledForms: ConjugationForm[];
  jlptLevels: JlptLevel[];
  roundSize: number;
  romajiInput: boolean;
  showFurigana: boolean;
  timeZone: string;
}

export interface VerbSummary {
  dictionaryForm: string;
  reading: string;
  meaning: string;
}

export interface RoundItem {
  id: string;
  position: number;
  form: ConjugationForm;
  verb: VerbSummary;
  choices?: string[];
}

export interface Round {
  id: string;
  mode: DrillMode;
  startedAt: string;
  items: RoundItem[];
}

export interface ExpectedForm {
  kanji: string;
  kana: string;
}

export interface AnswerResult {
  isCorrect: boolean;
  expected: ExpectedForm;
  ruleGroup: RuleGroup;
  ruleHint: string;
  note?: string;
}

export interface RoundMistake {
  itemId: string;
  position: number;
  verb: VerbSummary;
  form: ConjugationForm;
  answer: string;
  expected: ExpectedForm;
  ruleHint: string;
}

export interface RoundSummary {
  id: string;
  mode: DrillMode;
  startedAt: string;
  finishedAt: string;
  total: number;
  answered: number;
  correct: number;
  mistakes: RoundMistake[];
}

export interface RuleGroupProgress {
  form: ConjugationForm;
  ruleGroup: RuleGroup;
  attemptCount: number;
  correctCount: number;
  accuracy: number;
  box: number;
  dueAt: string;
  lastPracticedAt: string;
}

export interface Progress {
  totals: {
    attempts: number;
    correct: number;
    accuracy: number;
    roundsFinished: number;
    dueToday: number;
  };
  streak: number;
  ruleGroups: RuleGroupProgress[];
}

export interface Verb {
  id: string;
  dictionaryForm: string;
  reading: string;
  meaning: string;
  verbClass: VerbClass;
  jlptLevel: JlptLevel;
  isActive: boolean;
  excludedForms: ConjugationForm[];
  baseVerbId: string | null;
  createdAt: string;
}

export interface VerbInput {
  dictionaryForm: string;
  reading: string;
  meaning: string;
  jlptLevel: JlptLevel;
  verbClass?: VerbClass;
  excludedForms?: ConjugationForm[];
  isActive?: boolean;
  baseVerbId?: string | null;
}

export interface VerbSaveResult {
  verb: Verb;
  warnings: string[];
}

export interface IssuedLink {
  link: string;
  expiresAt: string;
}

export interface CreatedUser extends IssuedLink {
  user: User;
}

export interface ApiErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
}
