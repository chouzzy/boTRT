//renderer\contexts\AuthContext.tsx
'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// Define a estrutura do objeto de usuário que esperamos do Auth0
interface User {
    name: string;
    picture: string;
    email: string;
}

// Define o que o nosso contexto irá fornecer
interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// O Provedor que irá envolver nossa aplicação
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Verificamos primeiro se o usuário está autenticado
                const authStatus = await window.ipc.isAuthenticated();
                setIsAuthenticated(authStatus);

                if (authStatus) {
                    // Se estiver autenticado, buscamos os dados do perfil
                    const userProfile = await window.ipc.getUserProfile();
                    setUser(userProfile);
                }
            } catch (error) {
                console.error("Erro ao buscar dados de autenticação:", error);
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook customizado para facilitar o uso do contexto
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}
