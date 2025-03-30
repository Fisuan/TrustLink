import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, registerUser, UserData } from '../../api';
// В реальном приложении использовать SecureStore
// import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
  isLoading: boolean;
  userToken: string | null;
  userData: UserData | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Для демо-целей храним токен в памяти
// В реальном приложении использовать SecureStore
let tokenStorage: string | null = null;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    // Загрузка токена при инициализации
    const bootstrapAsync = async () => {
      try {
        // В реальном приложении:
        // const token = await SecureStore.getItemAsync('userToken');
        const token = tokenStorage;
        setUserToken(token);
      } catch (e) {
        console.error('Failed to load token', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await loginUser(email, password);
      
      // В реальном приложении:
      // await SecureStore.setItemAsync('userToken', response.access_token);
      tokenStorage = response.access_token;
      
      setUserToken(response.access_token);
      setUserData(response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      await registerUser(userData);
      // После регистрации не выполняем автоматический вход
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // В реальном приложении:
    // SecureStore.deleteItemAsync('userToken');
    tokenStorage = null;
    
    setUserToken(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider value={{ isLoading, userToken, userData, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Экспорт компонента по умолчанию для Expo Router
export default AuthProvider; 