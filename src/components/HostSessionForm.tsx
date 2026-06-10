import { useActionState } from 'react';

import { createSession } from '@/api/session';
import { Button } from '@/components/ui/button';
import type { CEFRLevel, Language } from '@/lib/language';
import type { HostedSession } from '@/types/session';

type HostSessionFormProps = {
  targetLanguage: Language;
  hostNativeLanguage: Language;
  hostProficiencyLevels: CEFRLevel[];
  onCreated: (result: HostedSession) => void;
};

type FormState = {
  error: string | null;
};

export function HostSessionForm({
  targetLanguage,
  hostNativeLanguage,
  hostProficiencyLevels,
  onCreated,
}: HostSessionFormProps) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const title = String(formData.get('title') ?? '').trim();
      const displayName = String(formData.get('displayName') ?? '').trim();

      if (!title || !displayName) {
        return { error: 'Please fill in all fields' };
      }

      try {
        const result = await createSession({
          title,
          targetLanguage,
          host: {
            displayName,
            nativeLanguage: hostNativeLanguage,
            proficiencyLevels: hostProficiencyLevels,
          },
        });
        onCreated(result);
        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Unknown error' };
      }
    },
    { error: null },
  );

  return (
    <form action={formAction} className="flex w-full max-w-xs flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">Session Title</span>
        <input
          type="text"
          name="title"
          required
          disabled={isPending}
          className="border-input bg-background focus-visible:ring-ring h-10 rounded-md border px-3 text-base focus-visible:ring-1"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">Your name</span>
        <input
          type="text"
          name="displayName"
          required
          disabled={isPending}
          className="border-input bg-background focus-visible:ring-ring h-10 rounded-md border px-3 text-base focus-visible:ring-1"
        />
      </label>

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? 'Creating...' : 'Continue'}
      </Button>

      {state.error && <p className="text-destructive text-sm">{state.error}</p>}
    </form>
  );
}
