import { useActionState, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchSession, joinSession } from '@/api/session';
import { Button } from '@/components/ui/button';
import {
  type CEFRLevel,
  type JLPTLevel,
  labelForLanguage,
  type Language,
  LANGUAGES,
  levelsForLanguage,
  targetFromPair,
  toCEFRLevels,
} from '@/lib/language';
import { storeMembership } from '@/lib/sessionPersistence';
import type { Session } from '@/types/session';

type InputLevel = CEFRLevel | JLPTLevel;

type FetchResult =
  | { status: 'loading' }
  | { status: 'loaded'; session: Session }
  | { status: 'error'; error: Error };

type FormState = { error: string | null };

export function JoinSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [fetchState, setFetchState] = useState<FetchResult>({ status: 'loading' });
  const [nativeLanguage, setNativeLanguage] = useState<Language | null>(null);
  const [selectedLevels, setSelectedLevels] = useState<InputLevel[]>([]);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    fetchSession(sessionId)
      .then((session) => {
        if (!cancelled) setFetchState({ status: 'loaded', session });
      })
      .catch((err) => {
        if (cancelled) return;
        setFetchState({
          status: 'error',
          error: err instanceof Error ? err : new Error(String(err)),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const [submitState, formAction, isPending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      if (fetchState.status !== 'loaded' || !sessionId) {
        return { error: 'Session not ready' };
      }
      if (!nativeLanguage) return { error: 'Pick your native language' };
      if (selectedLevels.length === 0) return { error: 'Pick at least one level' };

      const displayName = String(formData.get('displayName') ?? '').trim();
      if (!displayName) return { error: 'Enter your name' };

      const derivedTarget = targetFromPair(fetchState.session.languages, nativeLanguage);
      if (!derivedTarget) return { error: 'Invalid native language' };

      try {
        const participant = await joinSession(sessionId, {
          displayName,
          nativeLanguage,
          proficiencyLevels: toCEFRLevels(derivedTarget, selectedLevels),
        });

        storeMembership({
          sessionId: fetchState.session.id,
          sessionTitle: fetchState.session.title,
          participantId: participant.id,
          targetLanguage: derivedTarget,
          languages: fetchState.session.languages,
        });

        navigate(`/sessions/${fetchState.session.id}`);
        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Failed to join' };
      }
    },
    { error: null },
  );

  if (fetchState.status === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-muted-foreground">Loading sessions...</p>
      </div>
    );
  }

  if (fetchState.status === 'error') {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <p className="text-destructive text-center">
          Couldn't load session: {fetchState.error.message}
        </p>
      </div>
    );
  }

  const { session } = fetchState;
  const derivedTarget = nativeLanguage ? targetFromPair(session.languages, nativeLanguage) : null;
  const availableNativeLanguages = LANGUAGES.filter((l) => session.languages.includes(l.code));
  const levels = derivedTarget ? levelsForLanguage(derivedTarget) : [];

  function toggleLevel(level: InputLevel) {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level],
    );
  }

  return (
    <form
      action={formAction}
      className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-12"
    >
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold">Join {session.title}</h1>
        <p className="text-muted-foreground text-sm">
          {session.languages.map(labelForLanguage).join(' ↔ ')}
        </p>
      </div>

      <label className="flex w-full max-w-xs flex-col gap-2">
        <span className="text-sm font-medium">Your name</span>
        <input
          type="text"
          name="displayName"
          required
          disabled={isPending}
          className="border-input bg-background focus-visible:ring-ring h-10 rounded-md border px-3 text-base focus-visible:ring-1"
        />
      </label>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <span className="text-sm font-medium">Your native language</span>
        <div className="flex flex-col gap-2">
          {availableNativeLanguages.map((language) => (
            <Button
              key={language.code}
              type="button"
              size="lg"
              variant={nativeLanguage === language.code ? 'default' : 'outline'}
              onClick={() => {
                setNativeLanguage(language.code);
                setSelectedLevels([]);
              }}
            >
              {language.label}
            </Button>
          ))}
        </div>
      </div>

      {nativeLanguage && (
        <div className="flex w-full max-w-xs flex-col gap-3">
          <span className="text-sm font-medium">
            Your level(s) in {labelForLanguage(derivedTarget)}
          </span>
          <div className="grid grid-cols-3 gap-3">
            {levels.map((level) => (
              <Button
                key={level}
                type="button"
                size="lg"
                variant={selectedLevels.includes(level) ? 'default' : 'outline'}
                onClick={() => toggleLevel(level)}
              >
                {level}
              </Button>
            ))}
          </div>
        </div>
      )}

      <Button type="submit" size="lg" className="w-full max-w-xs" disabled={isPending}>
        {isPending ? 'Joining...' : 'Join session'}
      </Button>

      {submitState.error && <p className="text-destructive text-sm">{submitState.error}</p>}
    </form>
  );
}
