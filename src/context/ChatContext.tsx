// ChatContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ChatMessage } from '../types/ChatMessage';
import { addDoc, collection, doc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface ChatContextValue {
  chatMessages: ChatMessage[];
  getChatMessages: (instanceId: string) => Promise<ChatMessage[]>;
  addChatMessage: (message: ChatMessage, instanceId: string) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const getChatMessages = async (instanceId: string) => {
    try {
      const chatInstanceRef = doc(db, 'chatMessages', instanceId);
      const messagesRef = collection(chatInstanceRef, 'messages');  
      const q = await query(messagesRef, orderBy("timestamp", "asc"));
      const querySnapshot = await getDocs(q);
      const messages: ChatMessage[] = [];
      querySnapshot.forEach((doc) => {
        messages.push(doc.data() as ChatMessage);
      });
      setChatMessages(messages);
      return messages;
    } catch (error) {
      console.log('Error getting chat messages: ', error);
      return [];
    }
  };

  const addChatMessage = async (message: ChatMessage, instanceId: string) => {
    try {
        const chatInstanceRef = doc(db, 'chatMessages', instanceId);
        const messagesRef = collection(chatInstanceRef, 'messages');
        const docRef = await addDoc(messagesRef, message);
        const docId = docRef.id;
        await setDoc(doc(db, "chatMessages", instanceId, "messages", docId), { id: docId }, { merge: true });
        setChatMessages((prevMessages) => [...prevMessages, message]);
    } catch (error) {
      console.log('Error adding chat message: ', error);
    }
  };

  const value: ChatContextValue = {
    chatMessages,
    getChatMessages,
    addChatMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
