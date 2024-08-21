'use server'

import { AssemblyAI } from 'assemblyai'
import "dotenv/config"

export async function transcribeAudio(formData: FormData) {
  const file = formData.get('audio') as File
  const speakersExpected = formData.get('speakersExpected') as string

  if (!file) {
    throw new Error('No se ha proporcionado un archivo de audio.')
  }

  const apiKey = process.env.ASSEMBLYAI_API_KEY!
  const client = new AssemblyAI({
    apiKey: apiKey,
  })

  const data = {
    audio: await file.arrayBuffer(),
    speech_model: 'best' as any,
    speaker_labels: true,
    language_code: 'es',
    speakers_expected: parseInt(speakersExpected)
  }

  try {
    const transcript = await client.transcripts.transcribe(data)
    return transcript.utterances || []
  } catch (error) {
    console.error('Error en la transcripción:', error)
    throw new Error('Error al transcribir el audio. Por favor, intenta de nuevo.')
  }
}