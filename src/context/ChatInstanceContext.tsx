import React, { createContext, useState, useContext, ReactNode } from 'react';
import {ChatInstance} from '../types/ChatInstance';
import { addDoc, collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '../../firebase';

interface ChatInstanceContextValue {
  chatInstances: ChatInstance[];
  getChatInstances: (uid) => Promise<ChatInstance[]>;
  addChatInstance: (instance: ChatInstance, navigation: any) => void;
  updateChatInstance: (instanceId: string, date: Date) => void;
}

const ChatInstanceContext = createContext<ChatInstanceContextValue | undefined>(undefined);

export const useChatInstanceContext = () => {
  const context = useContext(ChatInstanceContext);
  if (!context) {
    throw new Error('useChatInstanceContext must be used within a ChatInstanceProvider');
  }
  return context;
};

interface ChatInstanceProviderProps {
  children: ReactNode;
}

export const ChatInstanceProvider: React.FC<ChatInstanceProviderProps> = ({ children }) => {
  const [chatInstances, setChatInstances] = useState<ChatInstance[]>([]);

  const getChatInstances = async (uid) => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "chatInstances"), where("userId", "==", uid))
      );
      const chatInstances: ChatInstance[] = [];
      querySnapshot.forEach((doc) => {
        chatInstances.push(doc.data() as ChatInstance);
      });
      setChatInstances(chatInstances);
      return chatInstances;
    } catch (err) {
      console.log('Error getting chat instances: ', err);
    }
  };

  const addChatInstance = async (instance: ChatInstance, navigation: any) => {
    try {
        const docRef = await addDoc(collection(db, "chatInstances"), instance);
        const docId = docRef.id;
        setDoc(doc(db, "chatInstances", docId), { id: docId }, { merge: true }).then(() => {
          setChatInstances((prevInstances) => [...prevInstances, instance]);
          navigation.navigate("Chat", { id: docId });
        });
    } catch (err) {
        console.log('Error adding chat instance: ', err);
    }
  };

  const updateChatInstance = async (instanceId, date) => {
    try {
      const docRef = doc(db, "chatInstances", instanceId);
      await setDoc(docRef, {updatedAt: date}, { merge: true });
      setChatInstances((prevInstances) => {
        const chat = prevInstances.find((prevInstance) => prevInstance.id === instanceId);
        if (chat) {
          chat.updatedAt = date;
        }
        return prevInstances;
      });
    } catch (err) {
      console.log('Error updating chat instance: ', err);
    }
  };

  const value: ChatInstanceContextValue = {
    chatInstances,
    getChatInstances,
    addChatInstance,
    updateChatInstance
  };

  return <ChatInstanceContext.Provider value={value}>{children}</ChatInstanceContext.Provider>;
};