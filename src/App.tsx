import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { NativeLanguageSelect } from './pages/NativeLanguageSelect.tsx'
import { SessionProvider } from '@/contexts/SessionContext.tsx'
import { RequireNativeLanguage } from '@/routes/guards/RequireNativeLanguage.tsx'
import { TargetLanguageSelect } from '@/pages/TargetLanguageSelect.tsx'

function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<NativeLanguageSelect />} />
          <Route element={<RequireNativeLanguage />}>
            <Route path="/target" element={<TargetLanguageSelect />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  )
}

export default App
