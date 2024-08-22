// app/api/start-transcription/route.ts
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
      return NextResponse.json({ error: 'No audio URL provided' }, { status: 400 })
    }

    const transcript = await client.transcripts.create({
      audio_url: audioUrl,
      language_code: 'es',
    })

    return NextResponse.json({ id: transcript.id })
  } catch (error) {
    console.error('Error starting transcription:', error)
    return NextResponse.json({ error: 'Failed to start transcription' }, { status: 500 })
  }
}