// components/MinutesViewer.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MeetingMinutes {
  title: string
  date: string
  attendees: { name: string; position: string; role: string }[]
  summary: string
  takeaways: string[]
  conclusions: string[]
  next_meeting: string[]
  tasks: { responsible: string; date: string; description: string }[]
  message: string
}

export default function MinutesViewer() {
  const [minutes, setMinutes] = useState<MeetingMinutes | null>(null)
  const [reflection, setReflection] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateMinutes = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-minutes', { method: 'POST' })
      const data = await response.json()
      setMinutes(data.minutes)
      setReflection(data.reflection)
    } catch (error) {
      console.error('Minutes generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReflectionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReflection(e.target.value)
  }

  const handleUpdateReflection = async () => {
    try {
      const response = await fetch('/api/update-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reflection }),
      })
      const data = await response.json()
      setReflection(data.updatedReflection)
    } catch (error) {
      console.error('Reflection update failed:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acta de Reunión y Crítica</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGenerateMinutes} disabled={isGenerating}>
          {isGenerating ? 'Generando...' : 'Generar Acta y Crítica'}
        </Button>
        {minutes && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Acta de Reunión:</h3>
            <pre>{JSON.stringify(minutes, null, 2)}</pre>
          </div>
        )}
        {reflection && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Crítica al Acta:</h3>
            <Textarea
              value={reflection}
              onChange={handleReflectionChange}
              rows={5}
              className="mb-2"
            />
            <Button onClick={handleUpdateReflection}>Actualizar Crítica</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}