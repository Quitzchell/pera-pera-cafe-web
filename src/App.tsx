import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { OnboardingProvider } from '@/context/OnboardingProvider';
import { JoinSession } from '@/pages/JoinSession';
import { NativeLanguageSelect } from '@/pages/NativeLanguageSelect';
import { SessionCreation } from '@/pages/SessionCreation';
import { SessionWaitingRoom } from '@/pages/SessionWaitingRoom';
import { TargetLanguageSelect } from '@/pages/TargetLanguageSelect';
import { RequireNativeLanguage } from '@/routing/RequireNativeLanguage';
import { RequireTargetLanguage } from '@/routing/RequireTargetLanguage';
import { SessionRoute } from '@/routing/SessionRoute';

export function App() {
  return (
    <OnboardingProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<NativeLanguageSelect />} />
          <Route element={<RequireNativeLanguage />}>
            <Route path="/targets" element={<TargetLanguageSelect />} />
            <Route element={<RequireTargetLanguage />}>
              <Route path="/sessions/new" element={<SessionCreation />} />
            </Route>
          </Route>

          <Route path="/join/:sessionId" element={<JoinSession />} />

          <Route path="/sessions/:sessionId" element={<SessionRoute />}>
            <Route index element={<SessionWaitingRoom />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </OnboardingProvider>
  );
}
