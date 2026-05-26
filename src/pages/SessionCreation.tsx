import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '@/context/onboarding/useOnboarding.ts'
import { HostSessionForm } from '@/components/HostSessionForm.tsx'
import { storeHostSession } from '@/shared/lib/sessionPersistence'

export function SessionCreation() {
  const { nativeLanguage, targetLanguage, proficiencyLevels } = useOnboarding()
  const navigate = useNavigate()

  if (!targetLanguage || !nativeLanguage || proficiencyLevels.length === 0) {
    return null
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-12">
      <h2 className="text-3xl font-semibold">Create a Session</h2>

      <HostSessionForm
        targetLanguage={targetLanguage}
        hostNativeLanguage={nativeLanguage}
        hostProficiencyLevels={proficiencyLevels}
        onCreated={({ session, participant }) => {
          storeHostSession({
            sessionId: session.id,
            sessionTitle: session.title,
            participantId: participant.id,
            targetLanguage,
          })
          navigate(`/session/${session.id}`)
        }}
      />
    </div>
  )
}
