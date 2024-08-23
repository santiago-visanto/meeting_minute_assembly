'use client';

import { useState } from 'react';
import AudioUpload from '@/components/AudioUpload';
import Transcription from '@/components/Transcription';
import MinutesGenerator from '@/components/MinutesGenerator';


export default function Home() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Audio Transcription and Minutes Generator</h1>
      <AudioUpload onUploadComplete={setAudioUrl} />
      {audioUrl && <Transcription audioUrl={audioUrl} onTranscriptionComplete={setTranscript} />}
      {transcript && <MinutesGenerator transcript={transcript} />}
    </main>
  );
}