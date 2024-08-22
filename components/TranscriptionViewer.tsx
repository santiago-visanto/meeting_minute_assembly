// components/TranscriptionViewer.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
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
  const [retryCount, setRetryCount] = useState(0)

  const startTranscription = async () => {
    if (!audioUrl) {
      setError('No audio URL provided')
      return
    }

    setIsTranscribing(true)
    setError(null)
    setRetryCount(0)

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
      setError('Failed to start transcription. Please try again.')
      setIsTranscribing(false)
    }
  }

  const checkTranscriptionStatus = useCallback(async () => {
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
        throw new Error(data.error)
      }
      // If status is 'queued' or 'processing', we continue polling
    } catch (error) {
      console.error('Error checking transcription status:', error)
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1)
      } else {
        setError('Failed to check transcription status. Please try again.')
        setIsTranscribing(false)
        setTranscriptionId(null)
      }
    }
  }, [transcriptionId, retryCount])

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (transcriptionId) {
      intervalId = setInterval(checkTranscriptionStatus, 5000) // Poll every 5 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [transcriptionId, checkTranscriptionStatus])

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
        {isTranscribing && !error && (
          <p className="mt-2">Transcripción en progreso... Por favor, espere.</p>
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