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
  const [reflection, setReflection] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMinutes = async (existingReflection: string = '') => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-minutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, wordCount, minutes, reflection: existingReflection }),
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

  const handleMinutesChange = (field: keyof MeetingMinutes, value: any) => {
    if (minutes) {
      setMinutes({ ...minutes, [field]: value });
    }
  };

  const renderEditableList = (field: 'takeaways' | 'conclusions' | 'next_meeting') => {
    if (!minutes) return null;
    return (
      <div>
        {minutes[field].map((item, index) => (
          <Input
            key={index}
            value={item}
            onChange={(e) => {
              const newList = [...minutes[field]];
              newList[index] = e.target.value;
              handleMinutesChange(field, newList);
            }}
            className="mb-2"
          />
        ))}
        <Button
          onClick={() => handleMinutesChange(field, [...minutes[field], ''])}
          variant="outline"
          size="sm"
        >
          Add Item
        </Button>
      </div>
    );
  };

  return (
    <Card className="mt-6">
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
        <Button onClick={() => generateMinutes()} disabled={isGenerating}>
          {isGenerating ? 'Generando...' : 'Generar Acta'}
        </Button>
        
        {error && <p className="text-red-500 mt-2" role="alert">{error}</p>}
        
        {minutes && (
          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={minutes.title}
                onChange={(e) => handleMinutesChange('title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                value={minutes.date}
                onChange={(e) => handleMinutesChange('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="summary">Resumen</Label>
              <Textarea
                id="summary"
                value={minutes.summary}
                onChange={(e) => handleMinutesChange('summary', e.target.value)}
                rows={5}
              />
            </div>
            <div>
              <Label>Puntos Clave</Label>
              {renderEditableList('takeaways')}
            </div>
            <div>
              <Label>Conclusiones</Label>
              {renderEditableList('conclusions')}
            </div>
            <div>
              <Label>Próxima Reunión</Label>
              {renderEditableList('next_meeting')}
            </div>
            <div>
              <Label>Tareas</Label>
              {minutes.tasks.map((task, index) => (
                <div key={index} className="mb-2">
                  <Input
                    value={task.responsible}
                    onChange={(e) => {
                      const newTasks = [...minutes.tasks];
                      newTasks[index] = { ...task, responsible: e.target.value };
                      handleMinutesChange('tasks', newTasks);
                    }}
                    placeholder="Responsable"
                    className="mb-1"
                  />
                  <Input
                    value={task.date}
                    onChange={(e) => {
                      const newTasks = [...minutes.tasks];
                      newTasks[index] = { ...task, date: e.target.value };
                      handleMinutesChange('tasks', newTasks);
                    }}
                    placeholder="Fecha"
                    className="mb-1"
                  />
                  <Input
                    value={task.description}
                    onChange={(e) => {
                      const newTasks = [...minutes.tasks];
                      newTasks[index] = { ...task, description: e.target.value };
                      handleMinutesChange('tasks', newTasks);
                    }}
                    placeholder="Descripción"
                  />
                </div>
              ))}
              <Button
                onClick={() => handleMinutesChange('tasks', [...minutes.tasks, { responsible: '', date: '', description: '' }])}
                variant="outline"
                size="sm"
              >
                Add Task
              </Button>
            </div>
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
            <Button onClick={handleGenerateNewMinutes} disabled={isGenerating} className="mt-2">
              {isGenerating ? 'Generando...' : 'Generar Nueva Acta'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}