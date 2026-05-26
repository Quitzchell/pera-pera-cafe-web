import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { OnboardingProvider } from '@/context/onboarding/OnboardingProvider.tsx'
import { RequireNativeLanguage } from '@/routing/RequireNativeLanguage'
import { RequireTargetLanguage } from '@/routing/RequireTargetLanguage'
import { NativeLanguageSelect } from '@/pages/NativeLanguageSelect'
import { TargetLanguageSelect } from '@/pages/TargetLanguageSelect'
import { SessionCreation } from '@/pages/SessionCreation.tsx'
import { SessionRoute } from '@/routing/SessionRoute.tsx'
import { HostWaitingRoom } from '@/pages/HostWaitingRoom.tsx'

function App() {
  return (
    <OnboardingProvider>
      <BrowserRouter>
        <Routes>
          {/* Gameplay session */}
          <Route element={<SessionRoute />}>
            <Route path="/session/:sessionId" element={<HostWaitingRoom />} />
          </Route>
          {/* Onboarding */}
          <Route path="/" element={<NativeLanguageSelect />} />
          <Route element={<RequireNativeLanguage />}>
            <Route path="/target" element={<TargetLanguageSelect />} />
            <Route element={<RequireTargetLanguage />}>
              <Route path="/create-session" element={<SessionCreation />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </OnboardingProvider>
  )
}

export default App
