import type { AnswerResult, Progress, Round, Settings, User } from '@/api/types';

export const learner: User = {
  id: 'u1',
  email: 'learner@example.com',
  displayName: 'Aiko',
  role: 'LEARNER',
  status: 'ACTIVE',
  createdAt: '2026-10-01T00:00:00.000Z',
  lastActiveAt: null,
};

export const settings: Settings = {
  enabledForms: ['TE', 'PAST'],
  jlptLevels: ['N5', 'N4'],
  roundSize: 20,
  romajiInput: false,
  showFurigana: true,
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

const oyogu = { dictionaryForm: '泳ぐ', reading: 'およぐ', meaning: 'to swim' };
const miru = { dictionaryForm: '見る', reading: 'みる', meaning: 'to see' };

export const standardRound: Round = {
  id: 'r1',
  mode: 'STANDARD',
  startedAt: '2026-10-29T10:00:00.000Z',
  items: [
    { id: 'i1', position: 0, form: 'TE', verb: oyogu },
    { id: 'i2', position: 1, form: 'PASSIVE', verb: miru },
  ],
};

export const contrastRound: Round = {
  ...standardRound,
  id: 'r2',
  mode: 'CONTRAST',
  items: [
    { id: 'c1', position: 0, form: 'POTENTIAL', verb: miru },
    { id: 'c2', position: 1, form: 'PASSIVE', verb: miru },
  ],
};

export const examRound: Round = {
  ...standardRound,
  id: 'r3',
  mode: 'EXAM',
  items: [
    {
      id: 'e1',
      position: 0,
      form: 'TE',
      verb: oyogu,
      choices: ['およんで', 'およいで', 'およって', 'およぎて'],
    },
    {
      id: 'e2',
      position: 1,
      form: 'PAST',
      verb: oyogu,
      choices: ['およいだ', 'およんだ', 'およった'],
    },
  ],
};

export const correctTe: AnswerResult = {
  isCorrect: true,
  expected: { kanji: '泳いで', kana: 'およいで' },
  ruleGroup: 'GODAN_GU',
  ruleHint: 'ぐ → いで (泳ぐ → 泳いで)',
};

export const emptyProgress: Progress = {
  totals: { attempts: 0, correct: 0, accuracy: 0, roundsFinished: 0, dueToday: 0 },
  streak: 0,
  ruleGroups: [],
};
