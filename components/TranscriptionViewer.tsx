// components/TranscriptionViewer.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TranscriptionViewerProps {
  audioUrl: string | null;
}

export default function TranscriptionViewer({ audioUrl }: TranscriptionViewerProps) {
  const [transcription, setTranscription] = useState<string | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transcriptionId, setTranscriptionId] = useState<string | null>(null)

  const startTranscription = async () => {
    if (!audioUrl) {
      setError('No audio URL provided')
      return
    }

    setIsTranscribing(true)
    setError(null)

    try {
      const response = await fetch('/api/start-transcription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setTranscriptionId(data.id)
    } catch (error) {
      console.error('Failed to start transcription:', error)
      setError('Failed to start transcription')
      setIsTranscribing(false)
    }
  }

  useEffect(() => {
    const pollTranscriptionStatus = async () => {
      if (!transcriptionId) return

      try {
        const response = await fetch(`/api/transcription-status?id=${transcriptionId}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.status === 'completed') {
          setTranscription(data.text)
          setIsTranscribing(false)
          setTranscriptionId(null)
        } else if (data.status === 'error') {
          setError(data.error)
          setIsTranscribing(false)
          setTranscriptionId(null)
        }
        // If status is 'queued' or 'processing', we continue polling
      } catch (error) {
        console.error('Error checking transcription status:', error)
        setError('Failed to check transcription status')
        setIsTranscribing(false)
        setTranscriptionId(null)
      }
    }

    if (transcriptionId) {
      const intervalId = setInterval(pollTranscriptionStatus, 5000) // Poll every 5 seconds
      return () => clearInterval(intervalId)
    }
  }, [transcriptionId])

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Transcripción</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={startTranscription} disabled={isTranscribing || !audioUrl}>
          {isTranscribing ? 'Transcribiendo...' : 'Transcribir Audio'}
        </Button>
        {error && (
          <p className="mt-2 text-red-500">Error: {error}</p>
        )}
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