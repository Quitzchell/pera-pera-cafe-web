import { Navigate, Outlet } from 'react-router-dom';

import { useOnboarding } from '@/context/useOnboarding';

export function RequireTargetLanguage() {
  const { targetLanguage, proficiencyLevels } = useOnboarding();

  if (!targetLanguage || proficiencyLevels.length === 0) {
    return <Navigate to="/targets" replace />;
  }

  return <Outlet />;
}
