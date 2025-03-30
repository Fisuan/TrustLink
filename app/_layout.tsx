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
    if (isLoading) return;

    const isInAuthGroup = segments[0] === "(tabs)";

    if (!userToken && isInAuthGroup) {
      // Разрешаем гостевой доступ
    } else if (userToken && (segments[0] === "login" || segments[0] === "register")) {
      // Перенаправляем только после полной загрузки
      setTimeout(() => {
        router.replace('/(tabs)/home' as any);
      }, 0);
    }
  }, [userToken, segments, isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: "Вход", headerShown: true }} />
      <Stack.Screen name="register" options={{ title: "Регистрация", headerShown: true }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="news" options={{ title: "Новости", headerShown: true }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="report" options={{ title: "Сообщить", headerShown: true }} />
      <Stack.Screen name="emergency" options={{ title: "SOS", headerShown: true }} />
      <Stack.Screen name="operator" options={{ title: "Интерфейс оператора", headerShown: false }} />
    </Stack>
  );
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