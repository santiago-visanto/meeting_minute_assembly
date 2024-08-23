import { NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';

const API_KEY = process.env.ASSEMBLYAI_API_KEY!
if (!API_KEY) {
  console.error("AssemblyAI API key is not set")
}

const client = new AssemblyAI({
  apiKey: API_KEY,
})


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Transcription ID is required' }, { status: 400 });
  }

  try {
    const transcript = await client.transcripts.get(id);

    if (transcript.status === 'completed') {
      const utterances = transcript.utterances?.map(utterance => ({
        speaker: utterance.speaker,
        text: utterance.text,
      })) || [];

      return NextResponse.json({
        status: 'completed',
        utterances,
      });
    } else if (transcript.status === 'error') {
      return NextResponse.json({
        status: 'error',
        error: transcript.error,
      });
    } else {
      // Calculate progress based on the current status
      let progress = 0;
      switch (transcript.status) {
        case 'queued':
          progress = 0;
          break;
        case 'processing':
          progress = 50;
          break;
        default:
          progress = 25;
      }

      return NextResponse.json({
        status: 'processing',
        progress: progress,
      });
    }
  } catch (error) {
    console.error('Error checking transcription status:', error);
    return NextResponse.json({ error: 'Failed to check transcription status' }, { status: 500 });
  }
}
