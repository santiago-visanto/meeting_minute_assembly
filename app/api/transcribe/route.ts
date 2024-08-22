// app/api/transcribe/route.ts
import { NextResponse } from 'next/server'
import { AssemblyAI } from 'assemblyai'

const apiKey = process.env.ASSEMBLYAI_API_KEY!

const client = new AssemblyAI({
  apiKey: apiKey,
});

export async function POST() {
  try {
    // Aquí deberías obtener la URL del audio subido anteriormente
    const FILE_URL = 'URL_DEL_AUDIO_SUBIDO'

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