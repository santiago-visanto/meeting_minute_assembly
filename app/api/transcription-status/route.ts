// app/api/transcription-status/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'No transcription ID provided' }, { status: 400 })
  }

  try {
    // Aquí deberías buscar el estado real de la transcripción
    // Por ahora, simularemos un proceso de transcripción
    const status = await getTranscriptionStatus(id)

    return NextResponse.json(status)
  } catch (error) {
    console.error('Error checking transcription status:', error)
    return NextResponse.json({ error: 'Failed to check transcription status' }, { status: 500 })
  }
}

async function getTranscriptionStatus(id: string) {
  // Simular un proceso de transcripción
  // En una implementación real, consultarías a AssemblyAI o tu base de datos
  const AssemblyAI = (await import('assemblyai')).AssemblyAI

  const API_KEY = process.env.ASSEMBLYAI_API_KEY!
  if (!API_KEY) {
    console.error("AssemblyAI API key is not set")
  }
  
  const client = new AssemblyAI({
    apiKey: API_KEY,
  })
  

  // Aquí deberías obtener el ID real de AssemblyAI asociado con tu transcriptionId
  // Por ahora, usaremos el mismo ID
  const transcript = await client.transcripts.get(id)

  if (transcript.status === 'completed') {
    return { status: 'completed', text: transcript.text }
  } else if (transcript.status === 'error') {
    return { status: 'error', error: transcript.error }
  } else {
    return { status: transcript.status }
  }
}