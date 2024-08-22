import { NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';

const API_KEY = process.env.ASSEMBLYAI_API_KEY!
if (!API_KEY) {
  console.error("AssemblyAI API key is not set")
}

const client = new AssemblyAI({
  apiKey: API_KEY,
})


export async function POST(request: Request) {
  const { audioUrl } = await request.json();

  const data = {
    audio_url: audioUrl,
    speech_model: 'best' as any,
    speaker_labels: true,
    language_code: 'es',
  };

  const transcript = await client.transcripts.transcribe(data);

  return NextResponse.json({ transcript: transcript.text });
}