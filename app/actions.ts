

'use server'

import { AssemblyAI } from 'assemblyai'
import "dotenv/config"

const apiKey = process.env.ASSEMBLYAI_API_KEY!
const client = new AssemblyAI({
  apiKey: apiKey,
})

export async function startTranscription(formData: FormData) {
  const file = formData.get('audio') as File
  const speakersExpected = formData.get('speakersExpected') as string

  if (!file) {
    throw new Error('No se ha proporcionado un archivo de audio.')
  }

  const data = {
    audio: await file.arrayBuffer(),
    speech_model: 'best' as any,
    speaker_labels: true,
    language_code: 'es',
    speakers_expected: parseInt(speakersExpected)
  }

  try {
    const transcript = await client.transcripts.transcribe(data)
    return transcript.id
  } catch (error) {
    console.error('Error al iniciar la transcripción:', error)
    throw new Error('Error al iniciar la transcripción. Por favor, intenta de nuevo.')
  }
}

export async function getTranscriptionStatus(transcriptId: string) {
  try {
    const transcript = await client.transcripts.get(transcriptId)
    if (transcript.status === 'completed') {
      return transcript.utterances || []
    } else if (transcript.status === 'error') {
      throw new Error('Error en la transcripción')
    } else {
      return null // Still processing
    }
  } catch (error) {
    console.error('Error al obtener el estado de la transcripción:', error)
    throw new Error('Error al obtener el estado de la transcripción. Por favor, intenta de nuevo.')
  }
}