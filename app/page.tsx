'use client';

import { useState } from 'react';
import AudioUpload from '@/components/AudioUpload';
import Transcription from '@/components/Transcription';

export default function Home() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Audio Transcription App</h1>
      <AudioUpload onUploadComplete={setAudioUrl} />
      {audioUrl && <Transcription audioUrl={audioUrl} />}
    </main>
  );
}