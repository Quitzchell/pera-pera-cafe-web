import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { OnboardingProvider } from '@/features/onboarding/host/OnboardingProvider'
import { RequireNativeLanguage } from '@/features/onboarding/host/RequireNativeLanguage'
import { RequireTargetLanguage } from '@/features/onboarding/host/RequireTargetLanguage'
import { NativeLanguageSelect } from '@/features/onboarding/host/NativeLanguageSelect'
import { TargetLanguageSelect } from '@/features/onboarding/host/TargetLanguageSelect'
import { SessionProvider } from '@/features/session/SessionProvider'
import { SessionCreation } from '@/features/session/SessionCreation'

function App() {
  return (
    <OnboardingProvider>
      <SessionProvider>
        <BrowserRouter>
          <Routes>
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
      </SessionProvider>
    </OnboardingProvider>
  )
}

export default App
