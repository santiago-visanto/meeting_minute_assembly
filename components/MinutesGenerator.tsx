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

interface ReflectionMinutes {
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
  const [reflection, setReflection] = useState<ReflectionMinutes | null>(null);
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
      setReflection(data.reflection);
    } catch (error) {
      console.error('Error generating new reflection:', error);
    } finally {
      setIsReflecting(false);
    }
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
        
        {minutes && (
          <div className="mt-6 space-y-4">
            <h3 className="text-2xl font-bold">{minutes.title}</h3>
            <p className="text-sm text-gray-500">Fecha: {minutes.date}</p>
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Asistentes:</h4>
              <ul className="list-disc pl-5">
                {minutes.attendees.map((attendee, index) => (
                  <li key={index}>
                    {attendee.name} - {attendee.position} ({attendee.role})
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Resumen:</h4>
              <p className="whitespace-pre-line">{minutes.summary}</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Puntos Clave:</h4>
              <ul className="list-disc pl-5">
                {minutes.takeaways.map((takeaway, index) => (
                  <li key={index}>{takeaway}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Conclusiones:</h4>
              <ul className="list-disc pl-5">
                {minutes.conclusions.map((conclusion, index) => (
                  <li key={index}>{conclusion}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Próxima Reunión:</h4>
              <ul className="list-disc pl-5">
                {minutes.next_meeting.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Tareas:</h4>
              <ul className="list-disc pl-5">
                {minutes.tasks.map((task, index) => (
                  <li key={index}>
                    <strong>{task.responsible}</strong> - {task.description} (Fecha: {task.date})
                  </li>
                ))}
              </ul>
            </div>
            
            <p className="italic text-gray-600">{minutes.message}</p>
          </div>
        )}
        
        {reflection && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Crítica del Acta:</h3>
            <h3 className="text-2xl font-bold">{reflection.title}</h3>
            <p className="text-sm text-gray-500">Fecha: {reflection.date}</p>
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Asistentes:</h4>
              <ul className="list-disc pl-5">
                {reflection.attendees.map((attendee, index) => (
                  <li key={index}>
                    {attendee.name} - {attendee.position} ({attendee.role})
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Resumen:</h4>
              <p className="whitespace-pre-line">{reflection.summary}</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Puntos Clave:</h4>
              <ul className="list-disc pl-5">
                {reflection.takeaways.map((takeaway, index) => (
                  <li key={index}>{takeaway}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Conclusiones:</h4>
              <ul className="list-disc pl-5">
                {reflection.conclusions.map((conclusion, index) => (
                  <li key={index}>{conclusion}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Próxima Reunión:</h4>
              <ul className="list-disc pl-5">
                {reflection.next_meeting.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Tareas:</h4>
              <ul className="list-disc pl-5">
                {reflection.tasks.map((task, index) => (
                  <li key={index}>
                    <strong>{task.responsible}</strong> - {task.description} (Fecha: {task.date})
                  </li>
                ))}
              </ul>
            </div>
            
            <p className="italic text-gray-600">{reflection.message}</p>
        
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
        )}
      </CardContent>
    </Card>
  );
}