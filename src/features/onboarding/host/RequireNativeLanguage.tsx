import { Navigate, Outlet } from 'react-router-dom'
import { useOnboarding } from '@/features/onboarding/host/useOnboarding'

export function RequireNativeLanguage() {
  const { nativeLanguage } = useOnboarding()

  if (!nativeLanguage) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
