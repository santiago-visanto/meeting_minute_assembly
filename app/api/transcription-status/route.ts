// app/api/transcription-status/route.ts
import { NextResponse } from 'next/server'
import { AssemblyAI } from 'assemblyai'

const API_KEY = process.env.ASSEMBLYAI_API_KEY!
if (!API_KEY) {
  console.error("AssemblyAI API key is not set")
}

const client = new AssemblyAI({
  apiKey: API_KEY,
})


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'No transcription ID provided' }, { status: 400 })
  }

  try {
    const transcript = await client.transcripts.get(id)

    if (transcript.status === 'completed') {
      return NextResponse.json({ status: 'completed', text: transcript.text })
    } else if (transcript.status === 'error') {
      return NextResponse.json({ status: 'error', error: transcript.error })
    } else {
      return NextResponse.json({ status: transcript.status })
    }
  } catch (error) {
    console.error('Error checking transcription status:', error)
    return NextResponse.json({ error: 'Failed to check transcription status' }, { status: 500 })
  }
}