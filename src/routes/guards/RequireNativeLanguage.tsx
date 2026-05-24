import { useSession } from '@/contexts/useSession.ts'
import { Navigate, Outlet } from 'react-router-dom'

export function RequireNativeLanguage() {
  const { nativeLanguage } = useSession()

  if (!nativeLanguage) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
