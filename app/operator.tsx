import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginOperator, getOperatorIncidents, getOperatorIncidentMessages, sendOperatorMessage } from '../api';
import { useAuth } from './contexts/AuthContext';

interface Message {
  id: string | number;
  content: string;
  sender_id: string | number;
  sender_name: string;
  sender_role?: string;
  sent_at: string;
  is_read: boolean;
}

interface Incident {
  id: string | number;
  title: string;
  description: string;
  status: string;
  user_id: string | number;
  created_at: string;
  updated_at?: string;
  location?: string;
  has_unread_messages?: boolean;
}

const OperatorScreen = () => {
  const router = useRouter();
  const { userToken } = useAuth();
  const [operatorToken, setOperatorToken] = useState<string | null>(null);
  const [operatorName, setOperatorName] = useState('Оператор');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const webSocketRef = useRef<WebSocket | null>(null);
  
  // Проверка сохраненного токена при загрузке
  useEffect(() => {
    const checkToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('operator_token');
        const savedName = await AsyncStorage.getItem('operator_name');
        
        if (savedToken) {
          setOperatorToken(savedToken);
          if (savedName) setOperatorName(savedName);
          fetchIncidents(savedToken);
        }
      } catch (e) {
        console.error('Ошибка при получении токена:', e);
      }
    };
    
    checkToken();
  }, []);
  
  // Получение списка инцидентов
  const fetchIncidents = async (token: string | null = operatorToken) => {
    if (!token) return;
    
    setRefreshing(true);
    try {
      const data = await getOperatorIncidents(token);
      setIncidents(data);
    } catch (e) {
      console.error('Ошибка при получении инцидентов:', e);
      Alert.alert('Ошибка', 'Не удалось загрузить список инцидентов');
    } finally {
      setRefreshing(false);
    }
  };
  
  // Получение сообщений для инцидента
  const fetchMessages = async (incidentId: string | number) => {
    if (!operatorToken) return;
    
    setLoading(true);
    try {
      const data = await getOperatorIncidentMessages(operatorToken, incidentId);
      setMessages(data);
    } catch (e) {
      console.error('Ошибка при получении сообщений:', e);
      Alert.alert('Ошибка', 'Не удалось загрузить сообщения для инцидента');
    } finally {
      setLoading(false);
    }
  };
  
  // Обработчик для выбора инцидента
  const handleSelectIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    fetchMessages(incident.id);
    setupWebSocket(incident.id);
  };
  
  // Настройка WebSocket для выбранного инцидента
  const setupWebSocket = (incidentId: string | number) => {
    // Закрываем предыдущее соединение если было
    if (webSocketRef.current) {
      webSocketRef.current.close();
    }
    
    const wsUrl = `wss://trustlink-backend-production.up.railway.app/api/ws/chat/${incidentId}?token=${operatorToken}`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket подключен');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Получено сообщение:', data);
        
        if (data.type === 'new_message') {
          // Добавляем новое сообщение в список
          setMessages(prevMessages => [
            ...prevMessages, 
            {
              id: data.data.id,
              content: data.data.content,
              sender_id: data.data.sender_id,
              sender_name: data.data.sender_name || 'Пользователь',
              sent_at: data.data.sent_at,
              is_read: data.data.is_read
            }
          ]);
        }
      } catch (error) {
        console.error('Ошибка при обработке сообщения WebSocket:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('Ошибка WebSocket:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket соединение закрыто');
    };
    
    webSocketRef.current = ws;
  };
  
  // Обработчик для входа
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Введите email и пароль');
      return;
    }
    
    setLoading(true);
    try {
      const data = await loginOperator(email, password);
      setOperatorToken(data.access_token);
      setOperatorName(data.name || 'Оператор');
      
      // Сохраняем в AsyncStorage
      await AsyncStorage.setItem('operator_token', data.access_token);
      if (data.name) {
        await AsyncStorage.setItem('operator_name', data.name);
      }
      
      fetchIncidents(data.access_token);
    } catch (e) {
      console.error('Ошибка при входе:', e);
      Alert.alert('Ошибка входа', e instanceof Error ? e.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };
  
  // Обработчик для выхода
  const handleLogout = async () => {
    if (webSocketRef.current) {
      webSocketRef.current.close();
    }
    
    try {
      await AsyncStorage.removeItem('operator_token');
      await AsyncStorage.removeItem('operator_name');
    } catch (e) {
      console.error('Ошибка при удалении токена:', e);
    }
    
    setOperatorToken(null);
    setSelectedIncident(null);
    setIncidents([]);
    setMessages([]);
  };
  
  // Отправка сообщения
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedIncident || !operatorToken) return;
    
    try {
      await sendOperatorMessage(
        operatorToken, 
        selectedIncident.id, 
        newMessage, 
        operatorName
      );
      setNewMessage('');
    } catch (e) {
      console.error('Ошибка при отправке сообщения:', e);
      Alert.alert('Ошибка', 'Не удалось отправить сообщение');
    }
  };
  
  // Если нет токена оператора, показываем экран входа
  if (!operatorToken) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Интерфейс оператора', headerShown: true }} />
        <View style={styles.loginContainer}>
          <Text style={styles.title}>Вход для оператора</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Введите ваш email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Пароль</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Введите ваш пароль"
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.button, styles.loginButton, (loading || !email || !password) && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={loading || !email || !password}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Войти</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
            <Text style={styles.backButtonText}>Вернуться в приложение</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // Если инцидент не выбран, показываем список инцидентов
  if (!selectedIncident) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{ 
            title: 'Список инцидентов', 
            headerRight: () => (
              <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
                <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
              </TouchableOpacity>
            )
          }} 
        />
        
        {refreshing ? (
          <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />
        ) : (
          <>
            <FlatList
              data={incidents}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.incidentCard}
                  onPress={() => handleSelectIncident(item)}
                >
                  <View style={styles.incidentHeader}>
                    <Text style={styles.incidentTitle}>#{item.id}: {item.title}</Text>
                    <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                      <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.incidentDescription} numberOfLines={2}>{item.description}</Text>
                  
                  <View style={styles.incidentFooter}>
                    <Text style={styles.incidentDate}>
                      {new Date(item.created_at).toLocaleString()}
                    </Text>
                    {item.has_unread_messages && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>Новые сообщения</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Нет активных инцидентов</Text>
                </View>
              }
              contentContainerStyle={styles.listContent}
              onRefresh={() => fetchIncidents()}
              refreshing={refreshing}
            />
            
            <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
              <Text style={styles.backButtonText}>Вернуться в приложение</Text>
            </TouchableOpacity>
          </>
        )}
      </SafeAreaView>
    );
  }
  
  // Экран чата для выбранного инцидента
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: `Инцидент #${selectedIncident.id}`,
          headerRight: () => (
            <TouchableOpacity onPress={() => setSelectedIncident(null)} style={styles.headerButton}>
              <Ionicons name="chevron-back" size={24} color="#007AFF" />
              <Text style={styles.headerButtonText}>Назад</Text>
            </TouchableOpacity>
          )
        }} 
      />
      
      <View style={styles.incidentInfo}>
        <Text style={styles.incidentInfoTitle}>{selectedIncident.title}</Text>
        <Text style={styles.incidentInfoDescription}>{selectedIncident.description}</Text>
        <View style={[styles.statusBadge, getStatusStyle(selectedIncident.status)]}>
          <Text style={styles.statusText}>{selectedIncident.status}</Text>
        </View>
      </View>
      
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[
              styles.messageContainer,
              item.sender_role === 'responder' ? styles.operatorMessage : styles.userMessage
            ]}>
              <Text style={styles.messageSender}>{item.sender_name}</Text>
              <Text style={styles.messageContent}>{item.content}</Text>
              <Text style={styles.messageTime}>
                {new Date(item.sent_at).toLocaleTimeString()}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.messagesContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Нет сообщений</Text>
            </View>
          }
          inverted={false}
        />
      )}
      
      <View style={styles.inputRow}>
        <TextInput
          style={styles.messageInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Введите сообщение..."
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !newMessage.trim() && styles.disabledButton]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <Ionicons name="send" size={24} color={newMessage.trim() ? "#007AFF" : "#C7C7CC"} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Вспомогательная функция для определения стиля статуса
const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'активный':
      return styles.statusActive;
    case 'pending':
    case 'в обработке':
      return styles.statusPending;
    case 'closed':
    case 'закрыт':
      return styles.statusClosed;
    default:
      return styles.statusDefault;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loginContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  loginButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  backButton: {
    padding: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerButtonText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 5,
  },
  listContent: {
    padding: 15,
  },
  incidentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  incidentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusActive: {
    backgroundColor: '#4CAF50',
  },
  statusPending: {
    backgroundColor: '#FFC107',
  },
  statusClosed: {
    backgroundColor: '#9E9E9E',
  },
  statusDefault: {
    backgroundColor: '#E0E0E0',
  },
  incidentDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  incidentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  incidentDate: {
    fontSize: 12,
    color: '#999',
  },
  unreadBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incidentInfo: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  incidentInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  incidentInfoDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  messagesContent: {
    padding: 15,
    flexGrow: 1,
  },
  messageContainer: {
    borderRadius: 10,
    padding: 12,
    maxWidth: '80%',
    marginBottom: 10,
  },
  userMessage: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start',
  },
  operatorMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  messageSender: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  messageContent: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 5,
    color: '#999',
  },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
});

export default OperatorScreen; 