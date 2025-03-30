import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { connectToChat, ChatMessage } from '../../api';
import { useAuth } from './AuthContext';

export interface Message {
  id: number;
  text: string;
  isOperator: boolean;
  timestamp?: string;
}

interface ChatContextType {
  messages: Message[];
  sendMessage: (text: string) => void;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: (incidentId: string | number) => void;
  disconnect: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Гостевой токен для неавторизованных пользователей
const GUEST_TOKEN = 'guest-token-' + Date.now();

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { userToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [connection, setConnection] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIncidentId, setCurrentIncidentId] = useState<string | number | null>(null);

  // Обработчик входящих сообщений
  const handleIncomingMessage = (data: ChatMessage) => {
    const newMessage: Message = {
      id: data.id || Date.now(),
      text: data.content,
      isOperator: data.sender_id !== 0, // Предполагаем, что 0 - это наш ID клиента
      timestamp: data.created_at
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
  };

  // Подключение к чату
  const connect = (incidentId: string | number) => {
    // Используем токен пользователя, если он есть, иначе гостевой
    const token = userToken || GUEST_TOKEN;
    
    setIsConnecting(true);
    setError(null);
    setCurrentIncidentId(incidentId);

    try {
      // Отключаемся от предыдущего соединения, если оно есть
      if (connection) {
        connection.closeConnection();
      }
      
      // Устанавливаем новое соединение
      const newConnection = connectToChat(incidentId, token, handleIncomingMessage);
      setConnection(newConnection);
      setIsConnected(true);
      
      // Добавляем приветственное сообщение
      setMessages([{ 
        id: Date.now(), 
        text: "Здравствуйте! Чем могу помочь?", 
        isOperator: true,
        timestamp: new Date().toISOString()
      }]);
    } catch (err: any) {
      setError(err.message || 'Ошибка подключения к чату');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  // Отключение от чата
  const disconnect = () => {
    if (connection) {
      connection.closeConnection();
      setConnection(null);
      setIsConnected(false);
      setCurrentIncidentId(null);
    }
  };

  // Отправка сообщения
  const sendMessage = (text: string) => {
    if (!text.trim() || !connection || !isConnected) {
      return;
    }

    // Создаем локальное сообщение
    const newMessage: Message = {
      id: Date.now(),
      text,
      isOperator: false,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    // Отправляем через WebSocket
    connection.sendMessage(text);
  };

  // Отключаемся при размонтировании компонента
  useEffect(() => {
    return () => {
      if (connection) {
        connection.closeConnection();
      }
    };
  }, [connection]);

  // Переподключаемся при изменении токена
  useEffect(() => {
    if (currentIncidentId) {
      connect(currentIncidentId);
    }
  }, [userToken]);

  return (
    <ChatContext.Provider 
      value={{ 
        messages, 
        sendMessage, 
        isConnected, 
        isConnecting, 
        error, 
        connect, 
        disconnect 
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Экспорт компонента по умолчанию для Expo Router
export default ChatProvider; 