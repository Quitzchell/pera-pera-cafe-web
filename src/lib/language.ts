export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type CEFRLevel = (typeof CEFR_LEVELS)[number];

export const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
export type JLPTLevel = (typeof JLPT_LEVELS)[number];

export const JLPT_TO_CEFR: Record<JLPTLevel, readonly CEFRLevel[]> = {
  N5: ['A1'],
  N4: ['A2'],
  N3: ['B1'],
  N2: ['B2'],
  N1: ['C1', 'C2'],
};

export const LANGUAGES = [
  { code: 'nl', label: 'Nederlands', levelScheme: 'cefr' },
  { code: 'ja', label: '日本語', levelScheme: 'jlpt' },
] as const satisfies readonly { code: string; label: string; levelScheme: 'cefr' | 'jlpt' }[];

export type Language = (typeof LANGUAGES)[number]['code'];

export function labelForLanguage(code: Language): string {
  return LANGUAGES.find((l) => l.code === code).label ?? code;
}

export function levelsForLanguage(language: Language): readonly (CEFRLevel | JLPTLevel)[] {
  const def = LANGUAGES.find((l) => l.code === language);
  return def?.levelScheme === 'jlpt' ? JLPT_LEVELS : CEFR_LEVELS;
}

export function toCEFRLevels(
  language: Language,
  levels: readonly (CEFRLevel | JLPTLevel)[],
): CEFRLevel[] {
  const def = LANGUAGES.find((l) => l.code === language);
  const expanded = levels.flatMap((level) =>
    def?.levelScheme === 'jlpt' ? [...JLPT_TO_CEFR[level as JLPTLevel]] : [level as CEFRLevel],
  );
  return CEFR_LEVELS.filter((c) => expanded.includes(c));
}

export function targetFromPair(
  languages: readonly Language[],
  nativeLanguage: Language,
): Language | undefined {
  return languages.find((l) => l !== nativeLanguage);
}
