import { Timestamp } from 'firebase/firestore';
export interface Goal {
  id: string;
  title: string;
  description: string;
  dueDate: Timestamp;
  status: string;
  category: string;
  progress: number;
  reminder: Reminder;
  createdAt: Timestamp;
  userId: string;
}

interface Reminder {
  date: Timestamp;
  description: string;
}
