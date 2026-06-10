import { useNavigate } from 'react-router-dom';

import { HostSessionForm } from '@/components/HostSessionForm';
import { useOnboarding } from '@/context/useOnboarding';
import { storeMembership } from '@/lib/sessionPersistence';

export function SessionCreation() {
  const { nativeLanguage, targetLanguage, proficiencyLevels } = useOnboarding();
  const navigate = useNavigate();

  if (!nativeLanguage || !targetLanguage || proficiencyLevels.length === 0) {
    return null;
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-12">
      <h1 className="text-3xl font-bold">Create a Session</h1>

      <HostSessionForm
        targetLanguage={targetLanguage}
        hostNativeLanguage={nativeLanguage}
        hostProficiencyLevels={proficiencyLevels}
        onCreated={({ session, participant }) => {
          storeMembership({
            sessionId: session.id,
            sessionTitle: session.title,
            participantId: participant.id,
            targetLanguage,
            languages: session.languages,
          });
          navigate(`/sessions/${session.id}`);
        }}
      />
    </div>
  );
}
