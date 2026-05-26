import { Navigate, Outlet } from 'react-router-dom'
import { useOnboarding } from '@/context/onboarding/useOnboarding.ts'

export function RequireNativeLanguage() {
  const { nativeLanguage } = useOnboarding()

  if (!nativeLanguage) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
