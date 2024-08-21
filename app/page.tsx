'use client'

import { useState, useRef, useEffect } from 'react'
import { uploadFile, startTranscription, getTranscriptionStatus } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function TranscribePage() {
  const [transcription, setTranscription] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [speakersExpected, setSpeakersExpected] = useState<string>("1")
  const [transcriptionId, setTranscriptionId] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setTranscription(null)
    setTranscriptionId(null)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const file = fileInputRef.current?.files?.[0]
      if (!file) {
        throw new Error('No se ha seleccionado ningún archivo.')
      }

      const formData = new FormData()
      formData.append('file', file)

      // Upload file to Vercel Blob Storage
      const fileUrl = await uploadFile(formData)

      // Start transcription
      const id = await startTranscription(fileUrl, speakersExpected)
      setTranscriptionId(id)
      setIsPolling(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => {
    if (isPolling && transcriptionId) {
      const pollInterval = setInterval(async () => {
        try {
          const result = await getTranscriptionStatus(transcriptionId)
          if (result) {
            setTranscription(result)
            setIsPolling(false)
            clearInterval(pollInterval)
          }
        } catch (err) {
          setError((err as Error).message)
          setIsPolling(false)
          clearInterval(pollInterval)
        }
      }, 5000) // Poll every 5 seconds

      return () => clearInterval(pollInterval)
    }
  }, [isPolling, transcriptionId])

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Transcribir Audio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-4">
              <Input
                type="file"
                name="audio"
                accept="audio/*"
                className="flex-grow"
                required
                ref={fileInputRef}
              />
              <Select 
                value={speakersExpected} 
                onValueChange={setSpeakersExpected}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Número de speakers" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'speaker' : 'speakers'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isUploading || isPolling} className="w-full">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo archivo...
                </>
              ) : isPolling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Transcribiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Transcribir
                </>
              )}
            </Button>
          </form>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-center">Subiendo archivo... {uploadProgress.toFixed(2)}%</p>
            </div>
          )}
          {isPolling && (
            <div className="text-center">
              <Loader2 className="inline-block h-8 w-8 animate-spin" />
              <p>Transcribiendo audio... Esto puede tomar unos minutos.</p>
            </div>
          )}
          {transcription && (
            <div className="mt-4 space-y-2">
              <h2 className="text-xl font-semibold">Transcripción:</h2>
              {transcription.map((utterance, index) => (
                <div key={index} className="bg-gray-100 p-2 rounded">
                  <span className="font-bold">Speaker {utterance.speaker}:</span> {utterance.text}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}