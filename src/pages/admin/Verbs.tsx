import { useState } from 'react';

import { adminApi } from '@/api';
import type { Verb, VerbSaveResult } from '@/api/types';
import { ErrorState } from '@/components/ErrorState';
import { Loading } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { VerbForm } from '@/components/VerbForm';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { VERB_CLASS_LABELS } from '@/lib/labels';

type Editing = { verb: Verb | null } | null;

export function Verbs() {
  const [search, setSearch] = useState('');
  const query = useDebouncedValue(search.trim());
  const verbs = useApiQuery(() => adminApi.verbs(query), `verbs:${query}`);
  const allVerbs = useApiQuery(() => adminApi.verbs(), 'verbs');
  const [editing, setEditing] = useState<Editing>(null);
  const [saved, setSaved] = useState<VerbSaveResult | null>(null);

  function handleSaved(result: VerbSaveResult) {
    setSaved(result);
    setEditing(null);
    verbs.reload();
    allVerbs.reload();
  }

  const baseCandidates = (allVerbs.data ?? []).filter(
    (verb) => verb.baseVerbId === null && verb.id !== editing?.verb?.id,
  );

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Verbs</h1>
        <Button
          onClick={() => {
            setSaved(null);
            setEditing({ verb: null });
          }}
        >
          New verb
        </Button>
      </div>

      {saved && (
        <div role="status" className="grid gap-2">
          <p className="text-success">
            Saved <span lang="ja">{saved.verb.dictionaryForm}</span>.
          </p>
          {saved.warnings.length > 0 && (
            <div
              role="alert"
              className="border-warning-foreground/30 bg-warning text-warning-foreground rounded-xl border p-4"
            >
              <p className="font-semibold">Check this verb</p>
              <ul className="mt-1 list-disc pl-5">
                {saved.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {editing && (
        <Card>
          <VerbForm
            key={editing.verb?.id ?? 'new'}
            verb={editing.verb}
            baseCandidates={baseCandidates}
            onSaved={handleSaved}
            onCancel={() => setEditing(null)}
          />
        </Card>
      )}

      <Input
        type="search"
        placeholder="Search kanji, kana or meaning"
        aria-label="Search verbs"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {verbs.status === 'loading' && <Loading />}
      {verbs.status === 'error' && <ErrorState error={verbs.error} onRetry={verbs.reload} />}
      {verbs.status === 'success' &&
        (verbs.data.length === 0 ? (
          <p className="text-muted-foreground">No verbs found.</p>
        ) : (
          <ul className="grid gap-2">
            {verbs.data.map((verb) => (
              <li
                key={verb.id}
                className="bg-card flex items-center justify-between gap-3 rounded-xl border p-3"
              >
                <div className="min-w-0">
                  <p>
                    <span lang="ja" className="text-lg">
                      {verb.dictionaryForm}
                    </span>
                    <span lang="ja" className="text-muted-foreground ml-2">
                      {verb.reading}
                    </span>
                    {!verb.isActive && (
                      <span className="bg-muted text-muted-foreground ml-2 rounded-full px-2 text-sm">
                        Inactive
                      </span>
                    )}
                  </p>
                  <p className="text-muted-foreground truncate text-sm">
                    {verb.meaning} · {verb.jlptLevel} · {VERB_CLASS_LABELS[verb.verbClass]}
                    {verb.baseVerbId && ' · compound'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSaved(null);
                    setEditing({ verb });
                    window.scrollTo({ top: 0 });
                  }}
                >
                  Edit
                </Button>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}
