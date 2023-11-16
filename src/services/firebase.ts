import { removeData } from './../utils/asyncStorage';
import { removeSecure } from './../utils/secureStorage';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, db, provider, storage } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getDownloadURL, listAll, ref } from 'firebase/storage';

export const signupWithGoogle = async () => {
    signInWithPopup(auth, provider)
    .then(res => {
        if(res) {
            return res.user;
        } else {
            return null;
        }
    })
    .catch(err => {
        console.error(err);
    })
}

export const signUpWithEmail = async (email: string, password: string) => {
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        return res.user;
    } catch (err) {
        console.error(err);
    }
}

export const getUserByUsername = async (username: string) => {
    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    const user = querySnapshot.docs.map((doc) => doc.data());
    return user[0];
}

export const getUserProfilePicture = async (userId: string) => {
    try {
      const listRef = ref(storage, `profilePics/${userId}`);
      const list = await listAll(listRef);
      const downloadUrl = await getDownloadURL(list.items[0]);
      return downloadUrl;
    } catch (error) {
      console.error('Error retrieving profile picture:', error);
      return null;
    }
  };

export const loginWithEmail = async (email: string, password: string) => {
    try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        return res.user;
    } catch (err) {
        console.error(err);
    }
}

export const signOut = async () => {
    try {
        await auth.signOut();
        await removeData("@user");
        await removeSecure("refreshToken")
        await removeSecure("accessToken");
    } catch (err) {
        console.error(err);
    }
}
