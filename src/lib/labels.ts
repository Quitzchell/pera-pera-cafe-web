import type {
  ConjugationForm,
  DrillMode,
  JlptLevel,
  RuleGroup,
  UserStatus,
  VerbClass,
} from '@/api/types';

export const FORM_LABELS: Record<ConjugationForm, string> = {
  POLITE: 'polite (ます形)',
  POLITE_NEGATIVE: 'polite negative',
  POLITE_PAST: 'polite past',
  NEGATIVE: 'casual negative (ない形)',
  PAST_NEGATIVE: 'casual past negative',
  TE: 'te-form (て形)',
  PAST: 'casual past (た形)',
  POTENTIAL: 'potential (可能形)',
  PASSIVE: 'passive (受身形)',
  CAUSATIVE: 'causative (使役形)',
  CAUSATIVE_PASSIVE: 'causative-passive (使役受身形)',
  VOLITIONAL: 'volitional (意向形)',
  CONDITIONAL_BA: 'ba-conditional (ば形)',
  IMPERATIVE: 'imperative (命令形)',
  PROHIBITIVE: 'prohibitive (〜な)',
  POTENTIAL_CONDITIONAL: 'potential + ba (可能形 + ば)',
};

export const FORM_EXAMPLES: Record<ConjugationForm, string> = {
  POLITE: '書きます',
  POLITE_NEGATIVE: '書きません',
  POLITE_PAST: '書きました',
  NEGATIVE: '書かない',
  PAST_NEGATIVE: '書かなかった',
  TE: '書いて',
  PAST: '書いた',
  POTENTIAL: '書ける',
  PASSIVE: '書かれる',
  CAUSATIVE: '書かせる',
  CAUSATIVE_PASSIVE: '書かせられる',
  VOLITIONAL: '書こう',
  CONDITIONAL_BA: '書けば',
  IMPERATIVE: '書け',
  PROHIBITIVE: '書くな',
  POTENTIAL_CONDITIONAL: '書ければ',
};

export const FORMS_BY_LEVEL: Record<JlptLevel, ConjugationForm[]> = {
  N5: ['POLITE', 'POLITE_NEGATIVE', 'POLITE_PAST', 'NEGATIVE', 'PAST_NEGATIVE', 'TE', 'PAST'],
  N4: [
    'POTENTIAL',
    'PASSIVE',
    'CAUSATIVE',
    'VOLITIONAL',
    'CONDITIONAL_BA',
    'IMPERATIVE',
    'PROHIBITIVE',
  ],
  N3: ['CAUSATIVE_PASSIVE', 'POTENTIAL_CONDITIONAL'],
};

export const RULE_GROUP_LABELS: Record<RuleGroup, string> = {
  GODAN_U_TSU_RU: 'godan う・つ・る',
  GODAN_MU_BU_NU: 'godan む・ぶ・ぬ',
  GODAN_KU: 'godan く',
  GODAN_GU: 'godan ぐ',
  GODAN_SU: 'godan す',
  ICHIDAN: 'ichidan',
  IRREGULAR_SURU: 'する',
  IRREGULAR_KURU: '来る',
  EXCEPTION_IKU: '行く (exception)',
  EXCEPTION_ARU: 'ある (exception)',
};

export const MODE_LABELS: Record<DrillMode, string> = {
  STANDARD: 'Standard',
  CONTRAST: 'Contrast',
  EXAM: 'Exam',
};

export const MODE_DESCRIPTIONS: Record<DrillMode, string> = {
  STANDARD: 'Type each form. Weak rules come back more often.',
  CONTRAST: 'Pairs of forms that are easy to mix up.',
  EXAM: 'Multiple choice, like the JLPT.',
};

export const STATUS_LABELS: Record<UserStatus, string> = {
  INVITED: 'Invited',
  ACTIVE: 'Active',
  DISABLED: 'Disabled',
};

export const VERB_CLASS_LABELS: Record<VerbClass, string> = {
  GODAN: 'Godan',
  ICHIDAN: 'Ichidan',
  IRREGULAR: 'Irregular',
};

export function formatPercent(fraction: number) {
  return `${Math.round(fraction * 100)}%`;
}

const dateTime = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' });
const dateOnly = new Intl.DateTimeFormat('en', { dateStyle: 'medium' });

export function formatDateTime(iso: string) {
  return dateTime.format(new Date(iso));
}

export function formatDate(iso: string) {
  return dateOnly.format(new Date(iso));
}
