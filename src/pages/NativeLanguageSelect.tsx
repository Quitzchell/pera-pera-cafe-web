import { Button } from '@/components/ui/button'
import { LANGUAGES, type Language } from '@/lib/language.ts'
import { useSession } from '@/contexts/useSession.ts'
import { useNavigate } from 'react-router-dom'

export function NativeLanguageSelect() {
  const { setNativeLanguage } = useSession()
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
