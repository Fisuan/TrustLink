import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "./contexts/AuthContext";

// В реальном приложении использовать SecureStore
// import * as SecureStore from 'expo-secure-store';

const LoginScreen = () => {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Ошибка", "Пожалуйста, заполните все поля");
      return;
    }

    try {
      setLocalLoading(true);
      await login(email, password);
      
      // Переход на главный экран после успешного входа
      router.replace("/");
    } catch (error: any) {
      console.error("Ошибка входа:", error);
      Alert.alert("Ошибка входа", error.message || "Неверный email или пароль");
    } finally {
      setLocalLoading(false);
    }
  };

  // Функция для перехода в приложение без авторизации
  const handleSkipAuth = () => {
    router.replace("/");
  };

  // Отображаем индикатор загрузки, если идет глобальная загрузка или локальная
  const showLoading = isLoading || localLoading;

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Ionicons name="shield-checkmark" size={80} color="#007AFF" />
        <Text style={styles.title}>TrustLink</Text>
        <Text style={styles.subtitle}>Безопасность превыше всего</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!showLoading}
        />
        <TextInput
          style={styles.input}
          placeholder="Пароль"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!showLoading}
        />

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={showLoading}
        >
          {showLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Войти</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.registerButton} 
          onPress={() => router.push("/register")}
          disabled={showLoading}
        >
          <Text style={styles.registerButtonText}>Регистрация</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={handleSkipAuth}
          disabled={showLoading}
        >
          <Text style={styles.skipButtonText}>Продолжить без регистрации</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#000",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  formContainer: {
    width: "100%",
  },
  input: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  loginButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerButton: {
    backgroundColor: "transparent",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  registerButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  skipButton: {
    backgroundColor: "transparent",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  skipButtonText: {
    color: "#666",
    fontSize: 16,
  },
});

export default LoginScreen; 