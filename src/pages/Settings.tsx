import { Check } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

import {
  CONJUGATION_FORMS,
  JLPT_LEVELS,
  type ConjugationForm,
  type JlptLevel,
  type Settings as SettingsData,
} from '@/api/types';
import { useAuth, useSignedIn } from '@/auth/useAuth';
import { ErrorMessage } from '@/components/ErrorState';
import { Button } from '@/components/ui/button';
import { checkboxClass } from '@/components/ui/input';
import { FORM_EXAMPLES, FORM_LABELS, FORMS_BY_LEVEL } from '@/lib/labels';
import { cn } from '@/lib/utils';

const sortForms = (forms: ConjugationForm[]) =>
  CONJUGATION_FORMS.filter((form) => forms.includes(form));

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
    <label className="flex min-h-11 cursor-pointer items-center gap-3 py-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className={checkboxClass}
      />
      <span className="flex-1">{children}</span>
    </label>
  );
}

type SaveState = 'idle' | 'saving' | 'saved';

export function Settings() {
  const { user, settings, updateSettings } = useSignedIn();
  const { signOut } = useAuth();
  const [draft, setDraft] = useState<SettingsData>(settings);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [error, setError] = useState<unknown>(null);
  const [formLevel, setFormLevel] = useState<JlptLevel>('N5');
  const tabRefs = useRef<Partial<Record<JlptLevel, HTMLButtonElement | null>>>({});
  const queue = useRef(Promise.resolve());
  const latest = useRef(0);

  useEffect(() => {
    if (saveState !== 'saved') return;
    const timer = setTimeout(() => setSaveState('idle'), 2000);
    return () => clearTimeout(timer);
  }, [saveState]);

  // Saves are queued so a fast series of toggles reaches the server in order.
  function save(changes: Partial<SettingsData>) {
    const previous = draft;
    setDraft({ ...draft, ...changes });
    setSaveState('saving');
    setError(null);
    const request = ++latest.current;
    queue.current = queue.current.then(async () => {
      try {
        const next = await updateSettings(changes);
        if (request === latest.current) {
          setDraft(next);
          setSaveState('saved');
        }
      } catch (caught) {
        setDraft(previous);
        setError(caught);
        setSaveState('idle');
      }
    });
  }

  function setForms(enabledForms: ConjugationForm[]) {
    if (enabledForms.length === 0) {
      setError('Keep at least one form switched on.');
      return;
    }
    save({ enabledForms: sortForms(enabledForms) });
  }

  function setVerbLevels(jlptLevels: JlptLevel[]) {
    if (jlptLevels.length === 0) {
      setError('Keep at least one verb level switched on.');
      return;
    }
    save({ jlptLevels: JLPT_LEVELS.filter((level) => jlptLevels.includes(level)) });
  }

  const levelForms = FORMS_BY_LEVEL[formLevel];
  const otherForms = draft.enabledForms.filter((form) => !levelForms.includes(form));

  function handleTabKey(event: KeyboardEvent<HTMLDivElement>) {
    const index = JLPT_LEVELS.indexOf(formLevel);
    const last = JLPT_LEVELS.length - 1;
    const target = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    const level = JLPT_LEVELS[target];
    setFormLevel(level);
    tabRefs.current[level]?.focus();
  }

  return (
    <div className="grid gap-5">
      <h1 className="text-[26px] font-semibold">Settings</h1>

      <section aria-labelledby="practice-heading" className="grid gap-1 pt-7">
        <h2 id="practice-heading" className="section-label">
          Practice
        </h2>
        <Checkbox checked={draft.romajiInput} onChange={(romajiInput) => save({ romajiInput })}>
          Romaji input
          <span className="text-muted-foreground block text-sm">
            Type <span className="font-mono">oyoide</span> and get <span lang="ja">およいで</span>.
          </span>
        </Checkbox>
        <Checkbox checked={draft.showFurigana} onChange={(showFurigana) => save({ showFurigana })}>
          Furigana
          <span className="text-muted-foreground block text-sm">Show the reading above kanji.</span>
        </Checkbox>
      </section>

      <section aria-labelledby="forms-heading" className="grid gap-2.5 pt-7">
        <h2 id="forms-heading" className="section-label">
          Level
        </h2>
        <p className="text-muted-foreground text-sm">
          Choose the verbs and forms you practise per JLPT level. Forms are grouped by the level
          where they are usually taught.
        </p>
        <div
          role="tablist"
          aria-label="JLPT level"
          className="flex gap-6 border-b"
          onKeyDown={handleTabKey}
        >
          {JLPT_LEVELS.map((level) => {
            const selected = level === formLevel;
            return (
              <button
                key={level}
                ref={(element) => {
                  tabRefs.current[level] = element;
                }}
                type="button"
                role="tab"
                id={`forms-tab-${level}`}
                aria-selected={selected}
                aria-controls="forms-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setFormLevel(level)}
                className={cn(
                  'focus-visible:ring-ring/50 -mb-px min-h-11 border-b-[3px] font-medium outline-none focus-visible:ring-[3px]',
                  selected
                    ? 'text-foreground border-primary'
                    : 'text-muted-foreground hover:text-foreground border-transparent',
                )}
              >
                {level}
              </button>
            );
          })}
        </div>
        <div
          role="tabpanel"
          id="forms-panel"
          aria-labelledby={`forms-tab-${formLevel}`}
          className="grid"
        >
          <Checkbox
            checked={draft.jlptLevels.includes(formLevel)}
            onChange={(on) =>
              setVerbLevels(
                on
                  ? [...draft.jlptLevels, formLevel]
                  : draft.jlptLevels.filter((level) => level !== formLevel),
              )
            }
          >
            <span className="font-medium">{formLevel} verbs</span>
            <span className="text-muted-foreground block text-sm">
              Practise verbs from the {formLevel} list.
            </span>
          </Checkbox>
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-sm font-medium">{formLevel} forms</span>
            <div className="flex gap-4">
              <Button
                type="button"
                variant="link"
                size="sm"
                aria-label={`Enable all ${formLevel} forms`}
                onClick={() => setForms([...otherForms, ...levelForms])}
              >
                All
              </Button>
              <Button
                type="button"
                variant="link"
                size="sm"
                aria-label={`Disable all ${formLevel} forms`}
                onClick={() => setForms(otherForms)}
              >
                None
              </Button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 sm:gap-x-6">
            {levelForms.map((form) => (
              <div key={form} className="border-b">
                <Checkbox
                  checked={draft.enabledForms.includes(form)}
                  onChange={(on) =>
                    setForms(
                      on
                        ? [...draft.enabledForms, form]
                        : draft.enabledForms.filter((enabled) => enabled !== form),
                    )
                  }
                >
                  {FORM_LABELS[form]}
                  <span lang="ja" className="text-muted-foreground ml-2 text-sm">
                    {FORM_EXAMPLES[form]}
                  </span>
                </Checkbox>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="account-heading" className="grid justify-items-start gap-2 pt-7">
        <h2 id="account-heading" className="section-label">
          Account
        </h2>
        <p>Signed in as {user.username}</p>
        <Button type="button" onClick={() => void signOut()}>
          Sign out
        </Button>
      </section>

      <div
        role="status"
        className={cn(
          'bg-foreground text-background pointer-events-none fixed bottom-20 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 px-3 py-1.5 text-sm transition-opacity sm:bottom-6',
          saveState === 'idle' ? 'opacity-0' : 'opacity-100',
        )}
      >
        {saveState === 'saving' && 'Saving…'}
        {saveState === 'saved' && (
          <>
            <Check aria-hidden className="size-4" /> Saved
          </>
        )}
      </div>
      {error !== null && (
        <div className="bg-background fixed inset-x-4 bottom-20 z-20 sm:static">
          <ErrorMessage error={error} />
        </div>
      )}
    </div>
  );
}
