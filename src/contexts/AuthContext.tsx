import React, {createContext, useContext, useState, type ReactNode} from 'react';
import type {User, AppRole} from '@/types/models';
import {api} from '@/services/api';
import * as console from "node:console";

interface AuthContextType {
    user: User | null;
    role: AppRole;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    setUser: (u: User) => void;
}

const roleMap: Record<number, AppRole> = {3: 'admin', 2: 'educator', 1: 'parent'};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [user, setUserState] = useState<User | null>(null);
    const role: AppRole = user ? (roleMap[user.FK_RoleId ?? 3] ?? 'parent') : 'parent';

    const login = async (username: string, password: string) => {
        const found = await api.login(username, password);
        if (found) {
            setUserState(found);
            return true;
        }
        return false;
    };

    const logout = () => {
        setUserState(null);
    };

    return (
        <AuthContext.Provider value={{user, role, login, logout, setUser: setUserState}}>
            {children}
        </AuthContext.Provider>
    );
};
