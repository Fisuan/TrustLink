import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "./contexts/AuthContext";

const RegisterScreen = () => {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: ""
  });
  const [localLoading, setLocalLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleRegister = async () => {
    // Валидация
    const { email, password, confirmPassword, firstName, lastName, phone } = formData;
    
    if (!email || !password || !confirmPassword || !firstName || !lastName || !phone) {
      Alert.alert("Ошибка", "Пожалуйста, заполните все поля");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Ошибка", "Пароли не совпадают");
      return;
    }

    try {
      setLocalLoading(true);
      
      // Подготовка данных для API
      const userData = {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone
      };
      
      await register(userData);
      
      Alert.alert(
        "Регистрация успешна", 
        "Вы успешно зарегистрировались. Теперь вы можете войти в систему.",
        [{ text: "OK", onPress: () => router.replace("/login") }]
      );
    } catch (error: any) {
      console.error("Ошибка регистрации:", error);
      Alert.alert("Ошибка регистрации", error.message || "Произошла ошибка при регистрации");
    } finally {
      setLocalLoading(false);
    }
  };

  // Отображаем индикатор загрузки, если идет глобальная загрузка или локальная
  const showLoading = isLoading || localLoading;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Ionicons name="shield-checkmark" size={60} color="#007AFF" />
          <Text style={styles.title}>Регистрация</Text>
          <Text style={styles.subtitle}>Создайте учетную запись TrustLink</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Имя"
            value={formData.firstName}
            onChangeText={(value) => handleInputChange("firstName", value)}
            editable={!showLoading}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Фамилия"
            value={formData.lastName}
            onChangeText={(value) => handleInputChange("lastName", value)}
            editable={!showLoading}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!showLoading}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Телефон"
            value={formData.phone}
            onChangeText={(value) => handleInputChange("phone", value)}
            keyboardType="phone-pad"
            editable={!showLoading}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Пароль"
            value={formData.password}
            onChangeText={(value) => handleInputChange("password", value)}
            secureTextEntry
            editable={!showLoading}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Подтверждение пароля"
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange("confirmPassword", value)}
            secureTextEntry
            editable={!showLoading}
          />

          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={handleRegister}
            disabled={showLoading}
          >
            {showLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Зарегистрироваться</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginLink} 
            onPress={() => router.push("/login")}
            disabled={showLoading}
          >
            <Text style={styles.loginLinkText}>Уже есть аккаунт? Войти</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
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
  registerButton: {
    backgroundColor: "#28A745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  registerButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginLink: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  loginLinkText: {
    color: "#007AFF",
    fontSize: 16,
  },
});

export default RegisterScreen; 