// app/api/transcribe/route.ts
import { NextResponse } from 'next/server'
import { AssemblyAI } from 'assemblyai'

// Asegúrate de que la API key esté configurada correctamente
const API_KEY = process.env.ASSEMBLYAI_API_KEY!
if (!API_KEY) {
  console.error("AssemblyAI API key is not set")
}

const client = new AssemblyAI({
  apiKey: API_KEY,
})

export async function POST() {
  try {
    // Obtener la URL del audio almacenada
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/set-audio-url`)
    if (!response.ok) {
      throw new Error(`Failed to fetch audio URL: ${response.statusText}`)
    }
    const { url: FILE_URL } = await response.json()

    if (!FILE_URL) {
      throw new Error('No audio URL found')
    }

    console.log("Transcribing audio from URL:", FILE_URL) // Log para debugging

    const data = {
      audio_url: FILE_URL,
      speech_model: 'best' as any, 
      speaker_labels: true,
      language_code: 'es',
    }

    const transcript = await client.transcripts.transcribe(data)

    if (!transcript || !transcript.text) {
      throw new Error('Transcription failed or returned empty')
    }

    console.log("Transcription successful") // Log para debugging

    return NextResponse.json({ transcription: transcript.text })
  } catch (error) {
    console.error('Transcription error:', error) // Log detallado del error
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}