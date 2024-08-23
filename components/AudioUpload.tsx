'use client';

import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { upload } from '@vercel/blob/client';

export default function AudioUpload({ onUploadComplete }: { onUploadComplete: (url: string) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUploading(true);
    setError(null);

    if (!inputFileRef.current?.files) {
      setError('No file selected');
      setIsUploading(false);
      return;
    }

    const file = inputFileRef.current.files[0];

    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      onUploadComplete(newBlob.url);
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[50vh]">
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-12">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Audio Transcription</h1>
            <p className="text-muted-foreground">Upload an audio file and get a transcript.</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Upload Audio</CardTitle>
              <CardDescription>Supported formats: mp3, m4a, mp4, OGG</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                  type="file" 
                  id="audio-file" 
                  ref={inputFileRef}
                  accept="audio/mp3,audio/wav,audio/m4a,audio/ogg"
                  required
                />
                <Button type="submit" className="w-full" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Transcribe'}
                </Button>
              </form>
              {error && <p className="text-red-500 mt-2" role="alert">{error}</p>}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}