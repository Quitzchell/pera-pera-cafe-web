import { useState, type FormEvent, type ReactNode } from 'react';

import { CONJUGATION_FORMS, JLPT_LEVELS, type Settings as SettingsData } from '@/api/types';
import { useSignedIn } from '@/auth/useAuth';
import { ErrorMessage } from '@/components/ErrorState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { FORM_EXAMPLES, FORM_LABELS, FORMS_BY_LEVEL } from '@/lib/labels';

const MIN_ROUND = 5;
const MAX_ROUND = 50;

function Checkbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="hover:bg-accent flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-primary size-5"
      />
      <span className="flex-1">{children}</span>
    </label>
  );
}

function toggle<T>(list: T[], value: T, on: boolean) {
  return on ? [...list, value] : list.filter((entry) => entry !== value);
}

export function Settings() {
  const { settings, updateSettings } = useSignedIn();
  const [draft, setDraft] = useState<SettingsData>(settings);
  const [roundSize, setRoundSize] = useState(String(settings.roundSize));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [saved, setSaved] = useState(false);

  function change(changes: Partial<SettingsData>) {
    setDraft((current) => ({ ...current, ...changes }));
    setSaved(false);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    const size = Number(roundSize);
    if (draft.enabledForms.length === 0) return setError('Enable at least one form.');
    if (draft.jlptLevels.length === 0) return setError('Pick at least one JLPT level.');
    if (!Number.isInteger(size) || size < MIN_ROUND || size > MAX_ROUND) {
      return setError(`Round size must be between ${MIN_ROUND} and ${MAX_ROUND}.`);
    }

    setPending(true);
    setError(null);
    try {
      const { enabledForms, jlptLevels, romajiInput, showFurigana } = draft;
      const next = await updateSettings({
        enabledForms: CONJUGATION_FORMS.filter((form) => enabledForms.includes(form)),
        jlptLevels: JLPT_LEVELS.filter((level) => jlptLevels.includes(level)),
        roundSize: size,
        romajiInput,
        showFurigana,
      });
      setDraft(next);
      setSaved(true);
    } catch (caught) {
      setError(caught);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={save} className="grid gap-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card>
        <fieldset className="grid gap-4">
          <legend className="mb-2 text-lg font-semibold">Practice</legend>
          <Field label="Round size" hint={`Between ${MIN_ROUND} and ${MAX_ROUND} questions.`}>
            <Input
              type="number"
              inputMode="numeric"
              min={MIN_ROUND}
              max={MAX_ROUND}
              value={roundSize}
              onChange={(event) => {
                setRoundSize(event.target.value);
                setSaved(false);
              }}
              className="max-w-32"
            />
          </Field>
          <Checkbox checked={draft.romajiInput} onChange={(romajiInput) => change({ romajiInput })}>
            Romaji input
            <span className="text-muted-foreground block text-sm">
              Type <span className="font-mono">oyoide</span> and get <span lang="ja">およいで</span>
              .
            </span>
          </Checkbox>
          <Checkbox
            checked={draft.showFurigana}
            onChange={(showFurigana) => change({ showFurigana })}
          >
            Furigana
            <span className="text-muted-foreground block text-sm">
              Show the reading above kanji.
            </span>
          </Checkbox>
        </fieldset>
      </Card>

      <Card>
        <fieldset className="grid gap-1">
          <legend className="mb-2 text-lg font-semibold">JLPT levels</legend>
          {JLPT_LEVELS.map((level) => (
            <Checkbox
              key={level}
              checked={draft.jlptLevels.includes(level)}
              onChange={(on) => change({ jlptLevels: toggle(draft.jlptLevels, level, on) })}
            >
              {level}
            </Checkbox>
          ))}
        </fieldset>
      </Card>

      <Card>
        <h2 className="mb-1 text-lg font-semibold">Forms</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Grouped by the JLPT level where each form is usually taught.
        </p>
        <div className="grid gap-6">
          {JLPT_LEVELS.map((level) => {
            const forms = FORMS_BY_LEVEL[level];
            const others = draft.enabledForms.filter((form) => !forms.includes(form));
            return (
              <div
                key={level}
                role="group"
                aria-labelledby={`forms-${level}`}
                className="grid gap-1"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <h3 id={`forms-${level}`} className="font-semibold">
                    {level}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label={`Enable all ${level} forms`}
                      onClick={() => change({ enabledForms: [...others, ...forms] })}
                    >
                      All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label={`Disable all ${level} forms`}
                      onClick={() => change({ enabledForms: others })}
                    >
                      None
                    </Button>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2">
                  {forms.map((form) => (
                    <Checkbox
                      key={form}
                      checked={draft.enabledForms.includes(form)}
                      onChange={(on) =>
                        change({ enabledForms: toggle(draft.enabledForms, form, on) })
                      }
                    >
                      {FORM_LABELS[form]}
                      <span lang="ja" className="text-muted-foreground ml-2 text-sm">
                        {FORM_EXAMPLES[form]}
                      </span>
                    </Checkbox>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <ErrorMessage error={error} />
      <div className="flex items-center gap-4">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Saving…' : 'Save settings'}
        </Button>
        <p role="status" className="text-success text-sm">
          {saved ? 'Saved' : ''}
        </p>
      </div>
    </form>
  );
}
