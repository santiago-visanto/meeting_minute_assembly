'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function Transcription({ audioUrl }: { audioUrl: string }) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleTranscribe = async () => {
    setIsTranscribing(true);
    setProgress(0);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl }),
      });

      if (!response.ok) throw new Error('Transcription failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const data = JSON.parse(chunk);

        if (data.progress) {
          setProgress(data.progress);
        } else if (data.transcript) {
          setTranscript(data.transcript);
        }
      }
    } catch (error) {
      console.error('Transcription error:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transcription</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleTranscribe} disabled={isTranscribing}>
          {isTranscribing ? 'Transcribing...' : 'Start Transcription'}
        </Button>
        {isTranscribing && <Progress value={progress} className="mt-2" />}
        {transcript && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Transcript:</h3>
            <p>{transcript}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}