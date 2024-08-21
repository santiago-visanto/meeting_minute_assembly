'use server'

import { AssemblyAI } from 'assemblyai'
import { put } from '@vercel/blob'
import { revalidatePath } from 'next/cache'
import "dotenv/config"

const apiKey = process.env.ASSEMBLYAI_API_KEY!
const client = new AssemblyAI({
  apiKey: apiKey,
})

export async function uploadFile(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) {
    throw new Error('No se ha proporcionado un archivo de audio.')
  }

  try {
    const blob = await put(file.name, file, {
      access: 'public',
    })

    return blob.url
  } catch (error) {
    console.error('Error al subir el archivo:', error)
    throw new Error('Error al subir el archivo. Por favor, intenta de nuevo.')
  }
}

export async function startTranscription(fileUrl: string, speakersExpected: string) {
  const data = {
    audio_url: fileUrl,
    speech_model: 'best' as any,
    speaker_labels: true,
    language_code: 'es',
    speakers_expected: parseInt(speakersExpected)
  }

  try {
    const transcript = await client.transcripts.create(data)
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
      revalidatePath('/transcribe')
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