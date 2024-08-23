'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Attendee {
  name: string;
  position: string;
  role: string;
}

interface Task {
  responsible: string;
  date: string;
  description: string;
}

interface MeetingMinutes {
  title: string;
  date: string;
  attendees: Attendee[];
  summary: string;
  takeaways: string[];
  conclusions: string[];
  next_meeting: string[];
  tasks: Task[];
  message: string;
}

export default function MinutesGenerator({ transcript }: { transcript: string }) {
  const [wordCount, setWordCount] = useState(100);
  const [minutes, setMinutes] = useState<MeetingMinutes | null>(null);
  const [reflection, setReflection] = useState<MeetingMinutes | null>(null);
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
      setReflection(data);
    } catch (error) {
      console.error('Error generating reflection:', error);
    } finally {
      setIsReflecting(false);
    }
  };

  const handleModifyReflection = async () => {
    setIsReflecting(true);
    try {
      const response = await fetch('/api/generate-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes, reflection: modifiedReflection }),
      });
      const data = await response.json();
      setReflection(data);
    } catch (error) {
      console.error('Error generating new reflection:', error);
    } finally {
      setIsReflecting(false);
    }
  };

  const renderSection = (title: string, content: string | string[] | Task[], type: 'text' | 'list' | 'tasks') => (
    <div>
      <h4 className="text-lg font-semibold mb-2">{title}:</h4>
      {type === 'text' && <p className="whitespace-pre-line">{content as string}</p>}
      {type === 'list' && (
        <ul className="list-disc pl-5">
          {(content as string[]).map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
      {type === 'tasks' && (
        <ul className="list-disc pl-5">
          {(content as Task[]).map((task, index) => (
            <li key={index}>
              <strong>{task.responsible}</strong> - {task.description} (Fecha: {task.date})
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const renderMeetingData = (data: MeetingMinutes, title: string) => (
    <div className="mt-6 space-y-4">
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="text-sm text-gray-500">Fecha: {data.date}</p>
      
      {renderSection('Asistentes', data.attendees.map(a => `${a.name} - ${a.position} (${a.role})`), 'list')}
      {renderSection('Resumen', data.summary, 'text')}
      {renderSection('Puntos Clave', data.takeaways, 'list')}
      {renderSection('Conclusiones', data.conclusions, 'list')}
      {renderSection('Próxima Reunión', data.next_meeting, 'list')}
      {renderSection('Tareas', data.tasks, 'tasks')}
      
      <p className="italic text-gray-600">{data.message}</p>
    </div>
  );

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
        
        {minutes && renderMeetingData(minutes, minutes.title)}
        
        {reflection && (
          <>
            {renderMeetingData(reflection, "Crítica del Acta")}
            <div className="mt-4">
              <Textarea
                value={modifiedReflection}
                onChange={(e) => setModifiedReflection(e.target.value)}
                placeholder="Modifica la crítica aquí..."
                className="mt-2"
              />
              <Button onClick={handleModifyReflection} disabled={isReflecting} className="mt-2">
                {isReflecting ? 'Generando...' : 'Generar Nueva Crítica'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}