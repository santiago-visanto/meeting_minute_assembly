// components/TranscriptionViewer.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TranscriptionViewer() {
  const [transcription, setTranscription] = useState<string | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)

  const handleTranscribe = async () => {
    setIsTranscribing(true)
    try {
      const response = await fetch('/api/transcribe', { method: 'POST' })
      const data = await response.json()
      setTranscription(data.transcription)
    } catch (error) {
      console.error('Transcription failed:', error)
    } finally {
      setIsTranscribing(false)
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Transcripción</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleTranscribe} disabled={isTranscribing}>
          {isTranscribing ? 'Transcribiendo...' : 'Transcribir Audio'}
        </Button>
        {transcription && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Transcripción:</h3>
            <p>{transcription}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}