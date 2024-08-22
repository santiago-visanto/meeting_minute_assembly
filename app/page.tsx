// app/page.tsx
'use client'

import { useState } from 'react'
import AudioUploader from '@/components/AudioUploader'
import TranscriptionViewer from '@/components/TranscriptionViewer'
import MinutesViewer from '@/components/MinutesViewer'

export default function Home() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Generador de Actas de Reunión</h1>
      <AudioUploader onUploadComplete={setAudioUrl} />
      <TranscriptionViewer audioUrl={audioUrl} />
      <MinutesViewer />
    </div>
  )
}