// app/api/transcribe/route.ts
import { NextResponse } from 'next/server'
import { AssemblyAI } from 'assemblyai'

const API_KEY = process.env.ASSEMBLYAI_API_KEY!
if (!API_KEY) {
  console.error("AssemblyAI API key is not set")
}

const client = new AssemblyAI({
  apiKey: API_KEY,
})

export async function POST(request: Request) {
  try {
    const { audioUrl } = await request.json()

    if (!audioUrl) {
      throw new Error('No audio URL provided')
    }

    console.log("Transcribing audio from URL:", audioUrl) // Log para debugging

    const data = {
      audio_url: audioUrl,
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