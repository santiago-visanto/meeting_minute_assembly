'use client'

import { useState } from 'react'
import { AssemblyAI } from 'assemblyai'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload } from "lucide-react"

export default function TranscribePage() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [transcription, setTranscription] = useState<any[] | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [speakersExpected, setSpeakersExpected] = useState<string>("1")

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setAudioFile(event.target.files[0])
      setError(null)
    }
  }

  const handleTranscribe = async () => {
    if (audioFile) {
      setIsTranscribing(true)
      setError(null)
      setTranscription(null)

      const client = new AssemblyAI({
        apiKey: '9f43594f7bb5449998c9a765b6f0fd28',
      })

      const data = {
        audio: audioFile,
        speech_model: 'best' as any,
        speaker_labels: true,
        language_code: 'es',
        speakers_expected: parseInt(speakersExpected)
      }

      try {
        const transcript = await client.transcripts.transcribe(data)
        setTranscription(transcript.utterances || [])
      } catch (err) {
        setError('Error al transcribir el audio. Por favor, intenta de nuevo.')
      } finally {
        setIsTranscribing(false)
      }
    } else {
      setError('Por favor, selecciona un archivo de audio primero.')
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Transcribir Audio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Input
              type="file"
              onChange={handleFileUpload}
              accept="audio/*"
              className="flex-grow"
            />
            <Select value={speakersExpected} onValueChange={setSpeakersExpected}>
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
          <Button 
            onClick={handleTranscribe} 
            disabled={!audioFile || isTranscribing}
            className="w-full"
          >
            {isTranscribing ? (
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
          {error && <p className="text-red-500 text-center">{error}</p>}
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