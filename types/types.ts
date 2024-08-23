export interface Attendee {
    name: string;
    position: string;
    role: string;
  }
  
  export interface Task {
    responsible: string;
    date: string;
    description: string;
  }
  
  export interface Minutes {
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
  
  export type MeetingMinutes = Minutes;
  export type ReflectionMinutes = Minutes;