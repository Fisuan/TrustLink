import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from "expo-router";
import { getIncidents, createIncident } from '../../api';

// В реальном приложении использовать SecureStore
// import * as SecureStore from 'expo-secure-store';
// Пример для демонстрации, в реальном приложении хранить в SecureStore
const demoToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // Пример токена

const ApiExampleScreen = () => {
  const router = useRouter();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        // В реальном приложении:
        // const token = await SecureStore.getItemAsync('userToken');
        const token = demoToken; // Демо-токен
        
        if (!token) {
          // Перенаправить на экран логина
          router.replace("/login");
          return;
        }
        
        const incidentsData = await getIncidents(token);
        setIncidents(incidentsData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  const handleCreateIncident = async () => {
    try {
      // В реальном приложении:
      // const token = await SecureStore.getItemAsync('userToken');
      const token = demoToken; // Демо-токен
      
      if (!token) {
        router.replace("/login");
        return;
      }
      
      const newIncident = {
        title: 'Новый экстренный случай',
        description: 'Описание нового экстренного происшествия',
        location: 'ул. Независимости, 1',
        // Другие необходимые поля
      };
      
      const createdIncident = await createIncident(token, newIncident);
      setIncidents([createdIncident, ...incidents]);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setLoading(true)}
        >
          <Text style={styles.buttonText}>Повторить</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.backButton]} 
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Примеры работы с API</Text>
      
      <TouchableOpacity 
        style={[styles.button, styles.createButton]} 
        onPress={handleCreateIncident}
      >
        <Text style={styles.buttonText}>Создать новый инцидент</Text>
      </TouchableOpacity>
      
      <Text style={styles.sectionTitle}>Список инцидентов:</Text>
      
      {incidents.length === 0 ? (
        <Text style={styles.emptyMessage}>Нет доступных инцидентов</Text>
      ) : (
        <FlatList
          data={incidents}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.incidentCard}>
              <Text style={styles.incidentTitle}>{item.title}</Text>
              <Text style={styles.incidentDescription}>{item.description}</Text>
              <Text style={styles.incidentDetail}>Место: {item.location}</Text>
              <Text style={styles.incidentDetail}>Статус: {item.status}</Text>
            </View>
          )}
        />
      )}
      
      <TouchableOpacity 
        style={[styles.button, styles.backButton]} 
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>Назад</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  createButton: {
    backgroundColor: '#28A745',
  },
  backButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  incidentCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  incidentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  incidentDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  incidentDetail: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
    fontStyle: 'italic',
  },
});

export default ApiExampleScreen; 