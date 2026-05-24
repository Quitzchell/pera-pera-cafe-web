import { useSession } from '@/contexts/useSession.ts'
import { useNavigate } from 'react-router-dom'
import { HostSessionForm } from '@/components/forms/HostSessionForm.tsx'

export function SessionCreation() {
  const { nativeLanguage, targetLanguage, proficiencyLevels } = useSession()
  const navigate = useNavigate()
  const { setSession } = useSession()

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
          navigate(`/sessions/${session.id}`)
        }}
      />
    </div>
  )
}
