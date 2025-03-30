import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";

const ProfileScreen = () => {
  const router = useRouter();
  const { userData, logout, userToken } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Выход из аккаунта",
      "Вы уверены, что хотите выйти?",
      [
        { text: "Отмена", style: "cancel" },
        { 
          text: "Выйти", 
          onPress: () => {
            logout();
            router.replace("/login");
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleLogin = () => {
    router.push("/login");
  };

  // Если пользователь не авторизован, показываем гостевой профиль
  if (!userToken) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Профиль</Text>
        </View>

        <View style={styles.guestContainer}>
          <Ionicons name="person-outline" size={80} color="#999" />
          <Text style={styles.guestTitle}>Вы не авторизованы</Text>
          <Text style={styles.guestSubtitle}>Войдите в аккаунт, чтобы получить доступ ко всем функциям приложения</Text>
          
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Ionicons name="log-in-outline" size={20} color="#FFF" />
            <Text style={styles.loginButtonText}>Войти в аккаунт</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Загрузка профиля...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Профиль</Text>
      </View>

      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {userData.first_name?.charAt(0) || ''}
            {userData.last_name?.charAt(0) || ''}
          </Text>
        </View>
        <Text style={styles.name}>{userData.first_name} {userData.last_name}</Text>
        <Text style={styles.email}>{userData.email}</Text>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Личные данные</Text>
        
        <View style={styles.infoItem}>
          <Ionicons name="mail-outline" size={20} color="#007AFF" />
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{userData.email}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="person-outline" size={20} color="#007AFF" />
          <Text style={styles.infoLabel}>Имя:</Text>
          <Text style={styles.infoValue}>{userData.first_name}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="person-outline" size={20} color="#007AFF" />
          <Text style={styles.infoLabel}>Фамилия:</Text>
          <Text style={styles.infoValue}>{userData.last_name}</Text>
        </View>
        
        {userData.phone && (
          <View style={styles.infoItem}>
            <Ionicons name="call-outline" size={20} color="#007AFF" />
            <Text style={styles.infoLabel}>Телефон:</Text>
            <Text style={styles.infoValue}>{userData.phone}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.editButton} onPress={() => router.push('/edit-profile')}>
        <Ionicons name="create-outline" size={20} color="#FFF" />
        <Text style={styles.editButtonText}>Редактировать профиль</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FFF" />
        <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    marginRight: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  guestContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FFF',
    marginVertical: 20,
    marginHorizontal: 15,
    borderRadius: 10,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  guestSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  profileContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    marginVertical: 10,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  sectionContainer: {
    backgroundColor: '#FFF',
    padding: 15,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  infoLabel: {
    fontSize: 16,
    marginLeft: 10,
    color: '#666',
    width: 80,
  },
  infoValue: {
    fontSize: 16,
    flex: 1,
    color: '#333',
  },
  editButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ProfileScreen; 