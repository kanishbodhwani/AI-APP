import { createContext } from 'react';
import { User } from '../types/User';

interface UserContextValue {
    user: User | null;
}

const userContextDefaultValues: UserContextValue = {
    user: null
}

export const UserContext = createContext<UserContextValue>(userContextDefaultValues);

export default UserContext;