import React, { useEffect } from 'react';
import { Slot, Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';

// Компонент для проверки аутентификации и перенаправления
function RootLayoutNav() {
  const { userToken, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Отключаем принудительный редирект при отсутствии токена,
    // чтобы приложение работало без бэкенда
    
    // Редиректим только если пользователь залогинен и находится на странице логина или регистрации
    if (!isLoading && userToken) {
      const isAuthPage = segments[0] === 'login' || segments[0] === 'register';
      if (isAuthPage) {
        router.replace('/');
      }
    }
  }, [userToken, segments, isLoading]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ChatProvider>
        <RootLayoutNav />
      </ChatProvider>
    </AuthProvider>
  );
} 