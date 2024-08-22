'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MinutesDisplay } from "./MinutesDisplay";

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
    <Card className="mt-6">
      <CardHeader>
      <CardTitle>Generador de Actas</CardTitle>
        <CardDescription>Genera actas de reunión a partir de la transcripción de audio y agrega reflexiones personalizadas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <Label htmlFor="wordCount">Cantidad de palabras:</Label>
          <Input 
            id="wordCount" 
            type="number" 
            value={wordCount} 
            onChange={(e) => setWordCount(Number(e.target.value))} 
            className="max-w-xs"
          />
        </div>
        <Button onClick={generateMinutes} disabled={isGenerating} className="w-full">
          {isGenerating ? 'Generando actas...' : 'Generar Actas'}
        </Button>
        {minutes && <MinutesDisplay minutes={minutes} />}
        {reflection && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Reflexión generada:</h3>
            <Textarea 
              value={modifiedReflection} 
              onChange={(e) => setModifiedReflection(e.target.value)} 
              className="w-full"
              rows={4}
            />
            <Button onClick={handleModifyReflection} disabled={isReflecting} className="w-full">
              {isReflecting ? 'Generando nueva reflexión...' : 'Modificar Reflexión'}
            </Button>
          </div>
        )}
        <Button onClick={handleDownloadPDF} className="w-full mt-4">
          Descargar PDF
        </Button>
      </CardContent>
    </Card>
  );
}
