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
      language_code: 'es',  // Asegurarse de que el idioma esté configurado en español
    });

    return NextResponse.json({ transcriptionId: transcript.id });
  } catch (error) {
    console.error('Error al iniciar la transcripción:', error);
    return NextResponse.json({ error: 'No se pudo iniciar la transcripción' }, { status: 500 });
  }
}