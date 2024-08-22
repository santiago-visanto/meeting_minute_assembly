'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Utterance {
  speaker: string;
  text: string;
}

export default function Transcription({ audioUrl }: { audioUrl: string }) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [utterances, setUtterances] = useState<Utterance[]>([]);
  const [progress, setProgress] = useState(0);

  const handleTranscribe = async () => {
    setIsTranscribing(true);
    setProgress(0);
    setUtterances([]);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl }),
      });

      if (!response.ok) throw new Error('Transcription failed');

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setUtterances(data.utterances);
    } catch (error) {
      console.error('Transcription error:', error);
    } finally {
      setIsTranscribing(false);
      setProgress(100);
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
        {utterances.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Transcript:</h3>
            {utterances.map((utterance, index) => (
              <div key={index} className="mb-2">
                <span className="font-semibold">{utterance.speaker}: </span>
                <span>{utterance.text}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}