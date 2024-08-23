'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlusIcon, MinusIcon } from 'lucide-react'

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
  const [reflection, setReflection] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([{ name: '', position: '', role: '' }]);

  const generateMinutes = async (existingReflection: string = '') => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-minutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, wordCount, minutes, reflection: existingReflection, attendees }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate minutes');
      }
      setMinutes(data.minutes);
      setReflection(data.reflection);
    } catch (error) {
      console.error('Error generating minutes:', error);
      setError('Failed to generate minutes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateNewMinutes = () => {
    generateMinutes(reflection);
  };

  const renderList = (items: string[] | undefined) => {
    if (!Array.isArray(items) || items.length === 0) {
      return <p>No items available.</p>;
    }
    return (
      <ul className="list-disc pl-5">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  };

  const handleAttendeeChange = (index: number, field: keyof Attendee, value: string) => {
    const newAttendees = [...attendees];
    newAttendees[index][field] = value;
    setAttendees(newAttendees);
  };

  const addAttendee = () => {
    setAttendees([...attendees, { name: '', position: '', role: '' }]);
  };

  const removeAttendee = (index: number) => {
    const newAttendees = attendees.filter((_, i) => i !== index);
    setAttendees(newAttendees);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Generador de Acta de Reunión</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="wordCount">Número de palabras del acta</Label>
            <div className="flex items-center mt-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setWordCount(Math.max(50, wordCount - 50))}
                aria-label="Decrease word count"
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
              <Input
                id="wordCount"
                type="number"
                min="50"
                max="500"
                value={wordCount}
                onChange={(e) => setWordCount(Math.max(50, Math.min(500, parseInt(e.target.value) || 50)))}
                className="mx-2 text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setWordCount(Math.min(500, wordCount + 50))}
                aria-label="Increase word count"
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label>Asistentes</Label>
            {attendees.map((attendee, index) => (
              <div key={index} className="mt-2 space-y-2">
                <Input
                  placeholder="Nombre"
                  value={attendee.name}
                  onChange={(e) => handleAttendeeChange(index, 'name', e.target.value)}
                />
                <Input
                  placeholder="Posición"
                  value={attendee.position}
                  onChange={(e) => handleAttendeeChange(index, 'position', e.target.value)}
                />
                <Input
                  placeholder="Rol"
                  value={attendee.role}
                  onChange={(e) => handleAttendeeChange(index, 'role', e.target.value)}
                />
                <Button type="button" variant="destructive" onClick={() => removeAttendee(index)}>
                  Eliminar Asistente
                </Button>
              </div>
            ))}
            <Button type="button" onClick={addAttendee} className="mt-2">
              Agregar Asistente
            </Button>
          </div>

          <Button onClick={() => generateMinutes()} disabled={isGenerating} className="w-full">
            {isGenerating ? 'Generando...' : 'Generar Acta'}
          </Button>
        </div>
        
        {error && <p className="text-red-500 mt-2" role="alert">{error}</p>}
        
        {minutes && (
          <div className="mt-6 space-y-4">
            <h3 className="text-2xl font-bold">{minutes.title || 'Acta de Reunión'}</h3>
            <p className="text-sm text-gray-500">Fecha: {minutes.date || 'No especificada'}</p>
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Asistentes:</h4>
              {Array.isArray(minutes.attendees) && minutes.attendees.length > 0 ? (
                <ul className="list-disc pl-5">
                  {minutes.attendees.map((attendee, index) => (
                    <li key={index}>
                      {attendee.name || 'Nombre no especificado'} - 
                      {attendee.position || 'Posición no especificada'} 
                      ({attendee.role || 'Rol no especificado'})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No se especificaron asistentes.</p>
              )}
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Resumen:</h4>
              <p className="whitespace-pre-line">{minutes.summary || 'No se proporcionó resumen.'}</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Puntos Clave:</h4>
              {renderList(minutes.takeaways)}
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Conclusiones:</h4>
              {renderList(minutes.conclusions)}
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Próxima Reunión:</h4>
              {renderList(minutes.next_meeting)}
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Tareas:</h4>
              {Array.isArray(minutes.tasks) && minutes.tasks.length > 0 ? (
                <ul className="list-disc pl-5">
                  {minutes.tasks.map((task, index) => (
                    <li key={index}>
                      <strong>{task.responsible || 'Responsable no especificado'}</strong> - 
                      {task.description || 'Descripción no especificada'} 
                      (Fecha: {task.date || 'No especificada'})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No se especificaron tareas.</p>
              )}
            </div>
            
            <p className="italic text-gray-600">{minutes.message || 'No se proporcionó mensaje adicional.'}</p>
          </div>
        )}
        
        {minutes && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Crítica y Sugerencias:</h3>
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Edita la crítica y sugerencias aquí..."
              className="mt-2 h-40"
            />
            <Button onClick={handleGenerateNewMinutes} disabled={isGenerating} className="mt-2 w-full">
              {isGenerating ? 'Generando...' : 'Generar Nueva Acta'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}