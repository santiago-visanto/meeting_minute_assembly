// app/api/start-transcription/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { audioUrl } = await request.json()

    if (!audioUrl) {
      return NextResponse.json({ error: 'No audio URL provided' }, { status: 400 })
    }

    // Generar un ID único para esta transcripción
    const transcriptionId = Date.now().toString()

    // Iniciar el proceso de transcripción en segundo plano
    startTranscriptionProcess(audioUrl, transcriptionId)

    return NextResponse.json({ id: transcriptionId })
  } catch (error) {
    console.error('Error starting transcription:', error)
    return NextResponse.json({ error: 'Failed to start transcription' }, { status: 500 })
  }
}

async function startTranscriptionProcess(audioUrl: string, transcriptionId: string) {
  const AssemblyAI = (await import('assemblyai')).AssemblyAI


const API_KEY = process.env.ASSEMBLYAI_API_KEY!
if (!API_KEY) {
  console.error("AssemblyAI API key is not set")
}

const client = new AssemblyAI({
  apiKey: API_KEY,
})


  try {
    const transcript = await client.transcripts.transcribe({
      audio_url: audioUrl,
      language_code: 'es',
    })

    // Aquí podrías almacenar el ID real de AssemblyAI junto con tu transcriptionId
    // Por ejemplo, en una base de datos o un almacenamiento en caché
    console.log(`Transcription started: ${transcriptionId} - AssemblyAI ID: ${transcript.id}`)
  } catch (error) {
    console.error(`Error in background transcription process: ${error}`)
  }
}