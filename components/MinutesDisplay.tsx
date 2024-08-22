import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export function MinutesDisplay({ minutes }: { minutes: MeetingMinutes }) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{minutes.title || 'No Title Provided'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p><strong>Fecha:</strong> {minutes.date || 'No Date Provided'}</p>
        
        {minutes.attendees.length > 0 && (
          <section>
            <h3 className="font-semibold">Asistentes:</h3>
            <ul className="pl-4 list-disc">
              {minutes.attendees.map((attendee, index) => (
                <li key={index}>
                  {attendee.name || 'No Name'} - {attendee.position || 'No Position'} ({attendee.role || 'No Role'})
                </li>
              ))}
            </ul>
          </section>
        )}
        
        {minutes.summary && (
          <section>
            <h3 className="font-semibold">Resumen:</h3>
            <p>{minutes.summary}</p>
          </section>
        )}
        
        {minutes.takeaways.length > 0 && (
          <section>
            <h3 className="font-semibold">Puntos clave:</h3>
            <ul className="pl-4 list-disc">
              {minutes.takeaways.map((takeaway, index) => (
                <li key={index}>{takeaway}</li>
              ))}
            </ul>
          </section>
        )}
        
        {minutes.conclusions.length > 0 && (
          <section>
            <h3 className="font-semibold">Conclusiones:</h3>
            <ul className="pl-4 list-disc">
              {minutes.conclusions.map((conclusion, index) => (
                <li key={index}>{conclusion}</li>
              ))}
            </ul>
          </section>
        )}
        
        {minutes.next_meeting.length > 0 && (
          <section>
            <h3 className="font-semibold">Próxima reunión:</h3>
            <ul className="pl-4 list-disc">
              {minutes.next_meeting.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>
        )}
        
        {minutes.tasks.length > 0 && (
          <section>
            <h3 className="font-semibold">Tareas:</h3>
            <ul className="pl-4 list-disc">
              {minutes.tasks.map((task, index) => (
                <li key={index}>
                  {task.responsible || 'No Responsible'} - {task.description || 'No Description'} (Fecha: {task.date || 'No Date Provided'})
                </li>
              ))}
            </ul>
          </section>
        )}
        
        {minutes.message && (
          <p><strong>Mensaje adicional:</strong> {minutes.message}</p>
        )}
      </CardContent>
    </Card>
  );
}
