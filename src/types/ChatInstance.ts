import { FieldValue, Timestamp } from "firebase/firestore";

export interface ChatInstance {
  id: string;
  name: string;
  createdBy: string;
  userId: string;
  details: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}