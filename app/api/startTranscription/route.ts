import { NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';

const apiKey = process.env.ASSEMBLYAI_API_KEY!

const client = new AssemblyAI({
  apiKey: apiKey,
});

export async function POST(request: Request) {
  const { fileUrl, speakersExpected } = await request.json();

  if (!fileUrl) {
    return NextResponse.json({ error: 'No se ha proporcionado una URL de archivo válida.' }, { status: 400 });
  }

  const data = {
    audio_url: fileUrl,
    speech_model: 'best' as any,
    speaker_labels: true,
    language_code: 'es',
    speakers_expected: parseInt(speakersExpected)
  };

  try {
    const transcript = await client.transcripts.create(data);
    return NextResponse.json({ transcriptionId: transcript.id });
  } catch (error) {
    console.error('Error al iniciar la transcripción:', error);
    return NextResponse.json({ error: 'Error al iniciar la transcripción' }, { status: 500 });
  }
}