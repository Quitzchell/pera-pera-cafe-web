import { Navigate, Outlet } from 'react-router-dom'
import { useOnboarding } from '@/features/onboarding/host/useOnboarding'

export function RequireTargetLanguage() {
  const { targetLanguage, proficiencyLevels } = useOnboarding()

  if (!targetLanguage || proficiencyLevels.length === 0) {
    return <Navigate to="/target" replace />
  }

  return <Outlet />
}
