// app/api/transcribe/route.ts
import { NextResponse } from 'next/server'
import { AssemblyAI } from 'assemblyai'

const apiKey = process.env.ASSEMBLYAI_API_KEY!;

const client = new AssemblyAI({
  apiKey: apiKey,
})

export async function POST() {
  try {
    // Obtener la URL del audio almacenada
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/set-audio-url`)
    const { url: FILE_URL } = await response.json()

    if (!FILE_URL) {
      throw new Error('No audio URL found')
    }

    const data = {
      audio_url: FILE_URL,
      speech_model: 'best' as any,
      speaker_labels: true,
      language_code: 'es',
    }

    const transcript = await client.transcripts.transcribe(data)

    return NextResponse.json({ transcription: transcript.text })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}