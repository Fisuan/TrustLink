const API_URL = 'https://trustlink-backend-production.up.railway.app'; 


export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
  });
  return response.json();
};

// Получение списка инцидентов
export const getIncidents = async (token) => {
  const response = await fetch(`${API_URL}/incidents`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  return response.json();
};

// Создание нового инцидента
export const createIncident = async (token, data) => {
  const response = await fetch(`${API_URL}/incidents`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

// Подключение к WebSocket чату
export const connectToChat = (incidentId, token) => {
  return new WebSocket(`wss://your-railway-domain.up.railway.app/api/ws/chat/${incidentId}?token=${token}`);
}; 