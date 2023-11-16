import React, { createContext, useState, useContext, ReactNode } from 'react';
import {Goal} from '../types/Goal';
import { addDoc, collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '../../firebase';

interface GoalContextValue {
  goals: Goal[];
  getGoals: (uid) => Promise<Goal[]>;
  addGoal: (goal: Goal, navigation: any) => Promise<void>;
  updateGoalProgress: (goalId: string, progress: number) => void;
}

const GoalContext = createContext<GoalContextValue | undefined>(undefined);

export const useGoalContext = () => {
  const context = useContext(GoalContext);
  if (!context) {
    throw new Error('useGoalContext must be used within a GoalProvider');
  }
  return context;
};

interface GoalProviderProps {
    children: ReactNode;
}

export const GoalProvider: React.FC<GoalProviderProps> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>([]);

  const getGoals = async (uid) => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "goals"), where("userId", "==", uid))
      );
      const goals: Goal[] = [];
      querySnapshot.forEach((doc) => {
        goals.push(doc.data() as Goal);
      });
      setGoals(goals);
      return goals;
    } catch (err) {
      console.log('Error getting chat instances: ', err);
    }
  };

  const addGoal = async (instance: Goal, navigation: any) => {
    try {
        const docRef = await addDoc(collection(db, "goals"), instance);
        const docId = docRef.id;
        setDoc(doc(db, "goals", docId), { id: docId }, { merge: true }).then(() => {
          setGoals((prevInstances) => [...prevInstances, instance]);
          navigation.navigate("Goals", { id: docId });
        });
    } catch (err) {
        console.log('Error adding chat instance: ', err);
    }
  };

  const updateGoalProgress = async (goalId: string, progress: number) => {
    try {
        await setDoc(doc(db, "goals", goalId), {progress: progress}, { merge: true });
        setGoals((prevInstances) => {
          const goal = prevInstances.find((prevInstance) => prevInstance.id === goalId);
          if (goal) {
            goal.progress = progress; 
          }
          return prevInstances;
        });
    } catch (err) {
        console.log('Error adding chat instance: ', err);
    }
  };

  const value: GoalContextValue = {
    goals,
    getGoals,
    addGoal,
    updateGoalProgress
  };

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>;
};