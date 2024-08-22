// components/TranscriptionViewer.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TranscriptionViewerProps {
  audioUrl: string | null;
}

export default function TranscriptionViewer({ audioUrl }: TranscriptionViewerProps) {
  const [transcription, setTranscription] = useState<string | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)

  const handleTranscribe = async () => {
    if (!audioUrl) {
      console.error('No audio URL provided')
      return
    }

    setIsTranscribing(true)
    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audioUrl }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
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
        <Button onClick={handleTranscribe} disabled={isTranscribing || !audioUrl}>
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