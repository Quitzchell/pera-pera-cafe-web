import { useState, type FormEvent } from 'react';

import { adminApi } from '@/api';
import {
  CONJUGATION_FORMS,
  JLPT_LEVELS,
  VERB_CLASSES,
  type JlptLevel,
  type Verb,
  type VerbClass,
  type VerbInput,
  type VerbSaveResult,
} from '@/api/types';
import { ErrorMessage } from '@/components/ErrorState';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input, Select } from '@/components/ui/input';
import { FORM_LABELS, VERB_CLASS_LABELS } from '@/lib/labels';

interface VerbFormProps {
  verb: Verb | null;
  baseCandidates: Verb[];
  onSaved: (result: VerbSaveResult) => void;
  onCancel: () => void;
}

export function VerbForm({ verb, baseCandidates, onSaved, onCancel }: VerbFormProps) {
  const [dictionaryForm, setDictionaryForm] = useState(verb?.dictionaryForm ?? '');
  const [reading, setReading] = useState(verb?.reading ?? '');
  const [meaning, setMeaning] = useState(verb?.meaning ?? '');
  const [jlptLevel, setJlptLevel] = useState<JlptLevel>(verb?.jlptLevel ?? 'N5');
  const [verbClass, setVerbClass] = useState<VerbClass>(verb?.verbClass ?? 'GODAN');
  const [baseVerbId, setBaseVerbId] = useState(verb?.baseVerbId ?? '');
  const [isCompound, setIsCompound] = useState(Boolean(verb?.baseVerbId));
  const [excludedForms, setExcludedForms] = useState(verb?.excludedForms ?? []);
  const [isActive, setIsActive] = useState(verb?.isActive ?? true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (isCompound && !baseVerbId) return setError('Pick the base verb of the compound.');

    const input: VerbInput = {
      dictionaryForm: dictionaryForm.trim(),
      reading: reading.trim(),
      meaning: meaning.trim(),
      jlptLevel,
      excludedForms,
      isActive,
      ...(isCompound ? { baseVerbId } : { verbClass }),
    };

    setPending(true);
    setError(null);
    try {
      onSaved(
        verb
          ? await adminApi.updateVerb(verb.id, {
              ...input,
              ...(!isCompound && { baseVerbId: null }),
            })
          : await adminApi.createVerb(input),
      );
    } catch (caught) {
      setError(caught);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <h2 className="text-lg font-semibold">{verb ? `Edit ${verb.dictionaryForm}` : 'New verb'}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Dictionary form" hint="Kanji where the verb has it, e.g. 泳ぐ.">
          <Input
            lang="ja"
            value={dictionaryForm}
            onChange={(event) => setDictionaryForm(event.target.value)}
            maxLength={30}
            required
          />
        </Field>
        <Field label="Reading" hint="Hiragana, e.g. およぐ.">
          <Input
            lang="ja"
            value={reading}
            onChange={(event) => setReading(event.target.value)}
            maxLength={30}
            required
          />
        </Field>
        <Field label="Meaning">
          <Input
            value={meaning}
            onChange={(event) => setMeaning(event.target.value)}
            maxLength={200}
            required
          />
        </Field>
        <Field label="JLPT level">
          <Select
            value={jlptLevel}
            onChange={(event) => setJlptLevel(event.target.value as JlptLevel)}
          >
            {JLPT_LEVELS.map((level) => (
              <option key={level}>{level}</option>
            ))}
          </Select>
        </Field>
      </div>

      <label className="flex min-h-11 items-center gap-3">
        <input
          type="checkbox"
          checked={isCompound}
          onChange={(event) => setIsCompound(event.target.checked)}
          className="accent-primary size-5"
        />
        Compound verb (e.g. 勉強する, 持ってくる)
      </label>

      {isCompound ? (
        <Field label="Base verb" hint="The dictionary form and reading must end in the base verb.">
          <Select value={baseVerbId} onChange={(event) => setBaseVerbId(event.target.value)}>
            <option value="">Choose…</option>
            {baseCandidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.dictionaryForm} ({candidate.reading})
              </option>
            ))}
          </Select>
        </Field>
      ) : (
        <Field label="Verb class">
          <Select
            value={verbClass}
            onChange={(event) => setVerbClass(event.target.value as VerbClass)}
          >
            {VERB_CLASSES.map((value) => (
              <option key={value} value={value}>
                {VERB_CLASS_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <fieldset className="grid gap-1">
        <legend className="mb-1 text-sm font-medium">Excluded forms (never drilled)</legend>
        <div className="grid sm:grid-cols-2">
          {CONJUGATION_FORMS.map((form) => (
            <label key={form} className="flex min-h-10 items-center gap-3">
              <input
                type="checkbox"
                checked={excludedForms.includes(form)}
                onChange={(event) =>
                  setExcludedForms(
                    event.target.checked
                      ? [...excludedForms, form]
                      : excludedForms.filter((excluded) => excluded !== form),
                  )
                }
                className="accent-primary size-5"
              />
              {FORM_LABELS[form]}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex min-h-11 items-center gap-3">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
          className="accent-primary size-5"
        />
        Active (used in rounds)
      </label>

      <ErrorMessage error={error} />
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save verb'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
