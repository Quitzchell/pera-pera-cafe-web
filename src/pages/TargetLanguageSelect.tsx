import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/context/useOnboarding';
import {
  type CEFRLevel,
  type JLPTLevel,
  type Language,
  LANGUAGES,
  levelsForLanguage,
  toCEFRLevels,
} from '@/lib/language';

type InputLevel = CEFRLevel | JLPTLevel;

export function TargetLanguageSelect() {
  const { nativeLanguage, setTarget } = useOnboarding();
  const navigate = useNavigate();
  const [selectedTarget, setSelectedTarget] = useState<Language | null>(null);
  const [selectedLevels, setSelectedLevels] = useState<InputLevel[]>([]);

  const availableTargets = LANGUAGES.filter((l) => l.code !== nativeLanguage);
  const levels = selectedTarget ? levelsForLanguage(selectedTarget) : [];

  function handleSelectTarget(language: Language) {
    setSelectedTarget(language);
    setSelectedLevels([]);
  }

  function toggleLevel(level: InputLevel) {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level],
    );
  }

  function handleContinue() {
    if (!selectedTarget || selectedLevels.length === 0) return;
    setTarget(selectedTarget, toCEFRLevels(selectedTarget, selectedLevels));
    navigate('/sessions/new');
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-12">
      <h1 className="text-3xl font-bold">Which language do you want to practice?</h1>

      <div className="flex w-full max-w-xs flex-col gap-4">
        {availableTargets.map((language) => (
          <Button
            key={language.code}
            size="lg"
            variant={selectedTarget === language.code ? 'default' : 'outline'}
            onClick={() => handleSelectTarget(language.code)}
          >
            {language.label}
          </Button>
        ))}
      </div>

      {selectedTarget && (
        <>
          <h2 className="text-2xl font-semibold">Pick Your level(s)</h2>
          <div className="grid w-full max-w-xs grid-cols-3 gap-3">
            {levels.map((level) => (
              <Button
                key={level}
                size="lg"
                variant={selectedLevels.includes(level) ? 'default' : 'outline'}
                onClick={() => toggleLevel(level)}
              >
                {level}
              </Button>
            ))}
          </div>
        </>
      )}

      <Button
        size="lg"
        className="w-full max-w-xs"
        disabled={!selectedTarget || selectedLevels.length === 0}
        onClick={handleContinue}
      >
        Continue
      </Button>
    </div>
  );
}
