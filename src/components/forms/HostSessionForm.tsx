import type { CEFRLevel, Language } from '@/lib/language.ts'
import { useState } from 'react'
import { useAsync } from '@/hooks/useAsync'
import { Button } from '@/components/ui/button'
import { createSession, type HostedSession } from '@/api/sessions.ts'

type HostTableFormProps = {
  targetLanguage: Language
  hostNativeLanguage: Language
  hostProficiencyLevels: CEFRLevel[]
  onCreated: (result: HostedSession) => void
}

export function HostSessionForm({
  targetLanguage,
  hostNativeLanguage,
  hostProficiencyLevels,
  onCreated,
}: HostTableFormProps) {
  const [title, setTitle] = useState<string>('')
  const [hostDisplayName, setHostDisplayName] = useState<string>('')
  const { loading, error, run } = useAsync(createSession)

  const canSubmit = !!title.trim() && !!hostDisplayName.trim()

  async function handleSubmit() {
    if (!canSubmit) return
    const result = await run({
      title: title.trim(),
      hostDisplayName: hostDisplayName.trim(),
      targetLanguage: targetLanguage,
      hostNativeLanguage: hostNativeLanguage,
      hostProficiencyLevels: hostProficiencyLevels,
    })
    if (result) onCreated(result)
  }

  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">Session title</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          className="border-input bg-background focus-visible:ring-ring h-10 rounded-md border px-3 text-base focus-visible:ring-1"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">Your name</span>
        <input
          type="text"
          value={hostDisplayName}
          onChange={(e) => setHostDisplayName(e.target.value)}
          disabled={loading}
          className="border-input bg-background focus-visible:ring-ring h-10 rounded-md border px-3 text-base focus-visible:ring-1"
        />
      </label>

      <Button size="lg" disabled={!canSubmit} onClick={handleSubmit}>
        {loading ? 'Creating...' : 'Continue'}
      </Button>
      {error && <p className="text-destructive text-sm">{error.message}</p>}
    </div>
  )
}
