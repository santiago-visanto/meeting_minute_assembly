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
  const { audioUrl, speakersExpected } = await request.json();

  try {
    const transcript = await client.transcripts.create({
      audio_url: audioUrl,
      speaker_labels: true,
      speakers_expected: speakersExpected,
    });

    return NextResponse.json({ transcriptionId: transcript.id });
  } catch (error) {
    console.error('Error starting transcription:', error);
    return NextResponse.json({ error: 'Failed to start transcription' }, { status: 500 });
  }
}