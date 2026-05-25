import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '@/features/onboarding/host/useOnboarding'
import { useSession } from '@/features/session/useSession'
import { HostSessionForm } from '@/features/session/HostSessionForm'

export function SessionCreation() {
  const { nativeLanguage, targetLanguage, proficiencyLevels } = useOnboarding()
  const { setSession, sessionId, sessionTitle, participantId } = useSession()
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
          setSession(session.id, session.title, participant.id)
          console.log(`returned from nest: ${sessionId}, ${sessionTitle}, ${participantId}`)
          navigate(`/sessions/${session.id}`)
        }}
      />
    </div>
  )
}
