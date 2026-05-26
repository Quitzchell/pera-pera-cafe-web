import { useSession } from '@/context/session/useSession.ts'
import { QRCodeSVG } from 'qrcode.react'

export function HostWaitingRoom() {
  const { sessionId, sessionTitle, participantId, targetLanguage } = useSession()

  const joinUrl = `${window.location.origin}/join/${sessionId}`

  return (
    <div className="flex min-h-dvh justify-center px-4 py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <h2 className="text-3xl font-semibold">{sessionTitle}</h2>

        <div className="border-input w-full max-w-64 rounded-md border bg-white p-4">
          <QRCodeSVG value={joinUrl} size={220} className="h-auto w-full" />
        </div>
      </div>

      <p className="text-muted-foreground">Waiting for participants…</p>
      <div className="text-muted-foreground flex flex-col items-center gap-1 text-sm">
        <span>Session ID: {sessionId}</span>
        <span>You are: {participantId}</span>
        <span>Target language: {targetLanguage}</span>
      </div>
    </div>
  )
}
