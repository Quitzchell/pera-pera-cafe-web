import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { LANGUAGES, type Language } from '@/shared/lib/language'
import { useOnboarding } from '@/features/onboarding/host/useOnboarding'

export function NativeLanguageSelect() {
  const { setNativeLanguage } = useOnboarding()
  const navigate = useNavigate()

  function handleSelect(language: Language) {
    setNativeLanguage(language)
    navigate('/target')
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4">
      <h2 className="text-3xl font-semibold">What is your native language?</h2>
      <div className="flex w-full max-w-xs flex-col gap-4">
        {LANGUAGES.map((language) => (
          <Button key={language.code} size="lg" onClick={() => handleSelect(language.code)}>
            {language.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
