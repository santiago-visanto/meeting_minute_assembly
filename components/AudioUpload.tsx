'use client';

import { useState, useRef } from 'react';
import { upload } from '@vercel/blob/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function AudioUpload({ onUploadComplete }: { onUploadComplete: (url: string) => void }) {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUploading(true);

    if (!inputFileRef.current?.files) {
      toast({ title: "Error", description: "No file selected", variant: "destructive" });
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
      toast({ title: "Error", description: "Upload failed", variant: "destructive" });
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sube un archivo de audio</CardTitle>
        <CardDescription>Selecciona el audio.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            name="file" 
            ref={inputFileRef} 
            type="file" 
            accept="audio/mp3,audio/mp4,audio/ogg,audio/wav,audio/m4a"
            required 
          />
          <Button type="submit" disabled={isUploading} className="w-full">
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}