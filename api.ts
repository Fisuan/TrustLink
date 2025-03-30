const USE_MOCK_API = false;

const API_BASE_URL = 'https://trustlink-backend-production.up.railway.app/api';
const WS_BASE_URL = 'wss://trustlink-backend-production.up.railway.app/api/ws';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserData;
}

export interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: string;
}

export interface IncidentData {
  id: number;
  title: string;
  description: string;
  location: string;
  status: string;
  created_at: string;
  user_id: number;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface CreateIncidentData {
  title: string;
  description: string;
  location: string;
  [key: string]: any;
}

export interface ChatMessage {
  id: number;
  content: string;
  sender_id: number;
  incident_id: number;
  created_at: string;
  sender_name?: string;
}

const MOCK_DATA = {
  users: [
    { 
      id: 1, 
      email: 'user@example.com', 
      first_name: 'Иван', 
      last_name: 'Иванов', 
      phone: '+7 (999) 123-45-67',
      role: 'user'
    }
  ],
  incidents: [
    { 
      id: 1, 
      title: 'Подозрительный человек', 
      description: 'Человек в черной одежде ходит вокруг здания', 
      location: 'ул. Пушкина, д. 10', 
      status: 'active', 
      created_at: '2025-03-30T09:00:00.000Z',
      user_id: 1
    },
    { 
      id: 2, 
      title: 'Сломанный замок', 
      description: 'Замок входной двери поврежден', 
      location: 'ул. Ленина, д. 15', 
      status: 'resolved', 
      created_at: '2025-03-29T14:30:00.000Z',
      user_id: 1
    }
  ],
  chatMessages: [
    {
      id: 1,
      content: 'Здравствуйте! Чем могу помочь?',
      sender_id: 2, // Оператор
      incident_id: 1,
      created_at: new Date().toISOString(),
      sender_name: 'Оператор'
    }
  ]
};

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  if (USE_MOCK_API) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = MOCK_DATA.users.find(u => u.email === email);
    if (!user || password !== 'password') {
      throw new Error('Неверный email или пароль');
    }
    
    return {
      access_token: 'mock-token-' + Date.now(),
      token_type: 'bearer',
      user
    };
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.detail || 'Login failed');
      } catch (e) {
        throw new Error('Login failed: ' + responseText);
      }
    }
    
    try {
      const data = JSON.parse(responseText);
      return data;
    } catch (e) {
      console.error('JSON parse error:', e);
      throw new Error('Failed to parse response: ' + responseText);
    }
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};

export const registerUser = async (userData: RegisterData): Promise<UserData> => {
  if (USE_MOCK_API) {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Проверка, что пользователь с таким email не существует
    if (MOCK_DATA.users.some(u => u.email === userData.email)) {
      throw new Error('Пользователь с таким email уже существует');
    }
    
    const newUser = {
      id: MOCK_DATA.users.length + 1,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      role: 'user'
    };
    
    const userWithPhone = {
      ...newUser,
      phone: userData.phone || '' 
    };
    MOCK_DATA.users.push(userWithPhone);
    return userWithPhone;
  }
  
  try {
    const response = await fetch(`${'https://trustlink-backend-production.up.railway.app'}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.detail || 'Registration failed');
      } catch (e) {
        throw new Error('Registration failed: ' + responseText);
      }
    }
    
    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error('JSON parse error:', e);
      throw new Error('Failed to parse response: ' + responseText);
    }
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};

export const getIncidents = async (token: string): Promise<IncidentData[]> => {
  if (USE_MOCK_API) {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 800));
    return MOCK_DATA.incidents;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/incidents/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.detail || 'Failed to get incidents');
      } catch (e) {
        throw new Error('Failed to get incidents: ' + responseText);
      }
    }
    
    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error('JSON parse error:', e);
      throw new Error('Failed to parse incidents: ' + responseText);
    }
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};

export const createIncident = async (token: string, incidentData: CreateIncidentData): Promise<IncidentData> => {
  if (USE_MOCK_API) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newIncident: IncidentData = {
      id: MOCK_DATA.incidents.length + 1,
      title: incidentData.title,
      description: incidentData.description,
      location: incidentData.location,
      status: 'active',
      created_at: new Date().toISOString(),
      user_id: 1
    };
    
    MOCK_DATA.incidents.push(newIncident);
    return newIncident;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/incidents/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(incidentData),
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.detail || 'Failed to create incident');
      } catch (e) {
        throw new Error('Failed to create incident: ' + responseText);
      }
    }
    
    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error('JSON parse error:', e);
      throw new Error('Failed to parse response: ' + responseText);
    }
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};

interface ChatConnection {
  sendMessage: (message: string) => void;
  closeConnection: () => void;
}

// WebSocket для чата
export const connectToChat = (
  incidentId: string | number, 
  token: string, 
  onMessage: (data: ChatMessage) => void
): ChatConnection => {
  if (USE_MOCK_API) {
    // Имитация WebSocket соединения
    console.log('Мок WebSocket соединение установлено');
    
    // Отправляем начальное сообщение
    setTimeout(() => {
      onMessage({
        id: 1,
        content: 'Здравствуйте! Чем могу помочь?',
        sender_id: 2, // Оператор
        incident_id: Number(incidentId),
        created_at: new Date().toISOString(),
        sender_name: 'Оператор'
      });
    }, 1000);
    
    return {
      sendMessage: (message: string) => {
        console.log('Мок отправка сообщения:', message);
        
        // Имитация ответа оператора через 1-2 секунды
        setTimeout(() => {
          onMessage({
            id: Date.now(),
            content: `Спасибо за ваше сообщение! Мы получили: "${message}"`,
            sender_id: 2, // Оператор
            incident_id: Number(incidentId),
            created_at: new Date().toISOString(),
            sender_name: 'Оператор'
          });
        }, 1000 + Math.random() * 1000);
      },
      closeConnection: () => {
        console.log('Мок WebSocket соединение закрыто');
      }
    };
  }
  
  try {
    const socket = new WebSocket(`${WS_BASE_URL}/chat/${incidentId}?token=${token}`);
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as ChatMessage;
        onMessage(data);
      } catch (e) {
        console.error('Error parsing WebSocket message:', e, event.data);
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
    
    return {
      sendMessage: (message: string) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ message }));
        }
      },
      closeConnection: () => {
        socket.close();
      },
    };
  } catch (error) {
    console.error('WebSocket connection error:', error);
    throw error;
  }
};

// ======== Operator API ========

/**
 * Функция логина оператора
 */
export async function loginOperator(email: string, password: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/operator/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Ошибка парсинга JSON:', responseText);
      throw new Error(`Некорректный ответ сервера: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(data.detail || 'Ошибка входа');
    }

    return data;
  } catch (error) {
    console.error('Ошибка при логине оператора:', error);
    throw error;
  }
}

/**
 * Получение всех инцидентов для оператора
 */
export async function getOperatorIncidents(token: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/operator/incidents?token=${token}`);
    
    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Ошибка парсинга JSON:', responseText);
      throw new Error(`Некорректный ответ сервера: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(data.detail || 'Ошибка получения инцидентов');
    }

    return data;
  } catch (error) {
    console.error('Ошибка при получении инцидентов:', error);
    throw error;
  }
}

/**
 * Получение сообщений для конкретного инцидента
 */
export async function getOperatorIncidentMessages(token: string, incidentId: string | number): Promise<any[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/chat/operator/incidents/${incidentId}/messages?token=${token}`
    );
    
    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Ошибка парсинга JSON:', responseText);
      throw new Error(`Некорректный ответ сервера: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(data.detail || 'Ошибка получения сообщений');
    }

    return data;
  } catch (error) {
    console.error('Ошибка при получении сообщений:', error);
    throw error;
  }
}

/**
 * Отправка сообщения от имени оператора
 */
export async function sendOperatorMessage(
  token: string, 
  incidentId: string | number, 
  message: string, 
  operatorName: string = 'Оператор'
): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/operator/send-message?token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        incident_id: incidentId,
        message: message,
        operator_name: operatorName,
      }),
    });
    
    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Ошибка парсинга JSON:', responseText);
      throw new Error(`Некорректный ответ сервера: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(data.detail || 'Ошибка отправки сообщения');
    }

    return data;
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    throw error;
  }
} 