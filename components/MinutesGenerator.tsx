'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MinutesDisplay } from "./MinutesDisplay"

interface MeetingMinutes {
  title: string;
  date: string;
  attendees: { name: string; position: string; role: string; }[];
  summary: string;
  takeaways: string[];
  conclusions: string[];
  next_meeting: string[];
  tasks: { responsible: string; date: string; description: string; }[];
  message: string;
}

export default function MinutesGenerator({ transcript }: { transcript: string }) {
  const [wordCount, setWordCount] = useState(100);
  const [minutes, setMinutes] = useState<MeetingMinutes | null>(null);
  const [reflection, setReflection] = useState('');
  const [modifiedReflection, setModifiedReflection] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReflecting, setIsReflecting] = useState(false);

  const generateMinutes = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-minutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, wordCount }),
      });
      const data = await response.json();
      setMinutes(data);
      generateReflection(data);
    } catch (error) {
      console.error('Error generating minutes:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateReflection = async (minutesData: MeetingMinutes) => {
    setIsReflecting(true);
    try {
      const response = await fetch('/api/generate-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes: minutesData }),
      });
      const data = await response.json();
      setReflection(data.reflection);
      setModifiedReflection(data.reflection);
    } catch (error) {
      console.error('Error generating reflection:', error);
    } finally {
      setIsReflecting(false);
    }
  };

  const handleModifyReflection = async () => {
    setIsReflecting(true);
    try {
      const response = await fetch('/api/generate-minutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, wordCount, reflection: modifiedReflection }),
      });
      const data = await response.json();
      setMinutes(data);
      generateReflection(data);
    } catch (error) {
      console.error('Error generating new minutes:', error);
    } finally {
      setIsReflecting(false);
    }
  };

  const handleDownloadPDF = () => {
    // Implementar la lógica para descargar el PDF
    console.log("Descargando PDF...");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generador de Acta de Reunión</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label htmlFor="wordCount">Número de palabras del acta</Label>
          <Input
            id="wordCount"
            type="number"
            min="50"
            max="500"
            value={wordCount}
            onChange={(e) => setWordCount(Math.max(50, Math.min(500, parseInt(e.target.value) || 50)))}
            className="mt-1"
          />
        </div>
        <Button onClick={generateMinutes} disabled={isGenerating}>
          {isGenerating ? 'Generando...' : 'Generar Acta'}
        </Button>
        
        {minutes && <MinutesDisplay minutes={minutes} />}
        
        {reflection && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Crítica del Acta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">{reflection}</p>
              <Textarea
                value={modifiedReflection}
                onChange={(e) => setModifiedReflection(e.target.value)}
                placeholder="Modifica la crítica aquí..."
                className="mt-2"
              />
              <Button onClick={handleModifyReflection} disabled={isReflecting} className="mt-2">
                {isReflecting ? 'Generando...' : 'Generar Nueva Acta con Cambios'}
              </Button>
              {(modifiedReflection.trim().toLowerCase() === 'ninguna' || 
                modifiedReflection.trim().toLowerCase() === 'none' || 
                modifiedReflection.trim() === '') && (
                <Button onClick={handleDownloadPDF} className="mt-2 ml-2">
                  Descargar Acta Aprobada (PDF)
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}