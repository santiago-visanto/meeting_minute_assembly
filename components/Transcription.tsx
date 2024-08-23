'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface Utterance {
  speaker: string;
  text: string;
}

interface TranscriptionProps {
  audioUrl: string;
  onTranscriptionComplete: (transcript: string) => void;
}

export default function Transcription({ audioUrl, onTranscriptionComplete }: TranscriptionProps) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [utterances, setUtterances] = useState<Utterance[]>([]);
  const [progress, setProgress] = useState(0);
  const [speakersExpected, setSpeakersExpected] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [transcriptionId, setTranscriptionId] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkTranscriptionStatus = async () => {
      if (!transcriptionId) return;

      try {
        const response = await fetch(`/api/check-transcription-status?id=${transcriptionId}`);
        const data = await response.json();

        if (data.status === 'completed') {
          setIsTranscribing(false);
          setProgress(100);
          setUtterances(data.utterances);
          const fullTranscript = data.utterances.map((u: Utterance) => `${u.speaker}: ${u.text}`).join('\n');
          onTranscriptionComplete(fullTranscript);
          clearInterval(intervalId);
        } else if (data.status === 'error') {
          setError(data.error || 'An error occurred during transcription');
          setIsTranscribing(false);
          clearInterval(intervalId);
        } else {
          setProgress(data.progress || 0);
        }
      } catch (error) {
        console.error('Error checking transcription status:', error);
        setError('Failed to check transcription status');
        setIsTranscribing(false);
        clearInterval(intervalId);
      }
    };

    if (isTranscribing && transcriptionId) {
      intervalId = setInterval(checkTranscriptionStatus, 5000); // Check every 5 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTranscribing, transcriptionId, onTranscriptionComplete]);

  const handleTranscribe = async () => {
    setIsTranscribing(true);
    setProgress(0);
    setUtterances([]);
    setError(null);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl, speakersExpected }),
      });

      if (!response.ok) {
        throw new Error('Transcription request failed');
      }

      const data = await response.json();
      setTranscriptionId(data.transcriptionId);
    } catch (error) {
      console.error('Transcription error:', error);
      setError('Failed to start transcription. Please try again.');
      setIsTranscribing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transcription</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label htmlFor="speakers">Expected Number of Speakers</Label>
          <Input
            id="speakers"
            type="number"
            min="1"
            max="10"
            value={speakersExpected}
            onChange={(e) => setSpeakersExpected(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
            className="mt-1"
          />
        </div>
        <Button onClick={handleTranscribe} disabled={isTranscribing}>
          {isTranscribing ? 'Transcribing...' : 'Start Transcription'}
        </Button>
        {isTranscribing && (
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
            <p className="text-center mt-2">{progress}% complete</p>
          </div>
        )}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
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