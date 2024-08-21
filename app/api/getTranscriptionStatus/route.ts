import { NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';

const apiKey = process.env.ASSEMBLYAI_API_KEY!

const client = new AssemblyAI({
  apiKey: apiKey,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const transcriptionId = searchParams.get('transcriptionId');

  if (!transcriptionId) {
    return NextResponse.json({ error: 'No se ha proporcionado un ID de transcripción válido.' }, { status: 400 });
  }

  try {
    const transcript = await client.transcripts.get(transcriptionId);
    if (transcript.status === 'completed') {
      return NextResponse.json({ status: 'completed', utterances: transcript.utterances });
    } else if (transcript.status === 'error') {
      return NextResponse.json({ status: 'error', error: transcript.error });
    } else {
      return NextResponse.json({ status: 'processing' });
    }
  } catch (error) {
    console.error('Error al obtener el estado de la transcripción:', error);
    return NextResponse.json({ error: 'Error al obtener el estado de la transcripción' }, { status: 500 });
  }
}