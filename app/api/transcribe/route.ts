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

    console.log("Starting transcription for audio URL:", audioUrl)

    const transcript = await client.transcripts.transcribe({
      audio_url: audioUrl,
      language_code: 'es',
    })

    console.log("Transcription job created with ID:", transcript.id)

    return NextResponse.json({ id: transcript.id })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}