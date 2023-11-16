import { FieldValue, Timestamp } from "firebase/firestore";

export interface ChatMessage {
  id: string;
  instanceId: string;
  sender: string; // 'user' or 'bot'
  text: string;
  timestamp: FieldValue;
}