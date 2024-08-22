// components/AudioUploader.tsx
'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { upload } from '@vercel/blob/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AudioUploaderProps {
  onUploadComplete: (url: string) => void;
}

export default function AudioUploader({ onUploadComplete }: AudioUploaderProps) {
  const [blob, setBlob] = useState<{ url: string } | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const inputFileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsUploading(true)

    try {
      if (!inputFileRef.current?.files) {
        throw new Error('No file selected')
      }

      const file = inputFileRef.current.files[0]

      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      })

      setBlob(newBlob)
      onUploadComplete(newBlob.url) // Pasar la URL al componente padre
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Subir Audio de la Reunión</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload}>
          <Input
            ref={inputFileRef}
            type="file"
            accept="audio/*"
            required
            className="mb-2"
          />
          <Button type="submit" disabled={isUploading}>
            {isUploading ? 'Subiendo...' : 'Subir Audio'}
          </Button>
        </form>
        {blob && (
          <div className="mt-4">
            Audio subido: <a href={blob.url}>{blob.url}</a>
          </div>
        )}
      </CardContent>
    </Card>
  )
}