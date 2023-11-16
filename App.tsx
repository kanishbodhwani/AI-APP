import StackNavigator from "./StackNavigator";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { getData, storeData } from "./src/utils/asyncStorage";
import {signOut} from "./src/services/firebase"

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await storeData('@user', user);
      } else {
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    (async() => {
      const storedUser = await getData('@user');
      console.log(storedUser);
      if (storedUser) {
        setUser(storedUser);
      }
      setLoading(false);
    })(); 
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) return null;
  return <StackNavigator user={user} handleSignOut={handleSignOut} />;
}