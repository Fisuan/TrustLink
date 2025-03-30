import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "./contexts/AuthContext";

// Интерфейс для подсказок по валидации
interface FieldErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

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
  const [errors, setErrors] = useState<FieldErrors>({});
  const [localLoading, setLocalLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Сбрасываем ошибку при изменении поля
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: undefined
      });
    }
  };

  const validateForm = (): boolean => {
    const { email, password, confirmPassword, firstName, lastName, phone } = formData;
    const newErrors: FieldErrors = {};
    let isValid = true;
    
    if (!email) {
      newErrors.email = "Введите электронную почту";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Некорректный формат email";
      isValid = false;
    }
    
    if (!password) {
      newErrors.password = "Введите пароль";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Пароль должен содержать минимум 6 символов";
      isValid = false;
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Подтвердите пароль";
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
      isValid = false;
    }
    
    if (!firstName) {
      newErrors.firstName = "Введите имя";
      isValid = false;
    }
    
    if (!lastName) {
      newErrors.lastName = "Введите фамилию";
      isValid = false;
    }
    
    if (!phone) {
      newErrors.phone = "Введите номер телефона";
      isValid = false;
    } else if (!/^\+?[0-9\s\-\(\)]{10,15}$/.test(phone)) {
      newErrors.phone = "Некорректный формат телефона";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    // Валидация формы
    if (!validateForm()) {
      return;
    }

    try {
      setLocalLoading(true);
      
      // Подготовка данных для API
      const userData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone
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
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, errors.firstName && styles.inputError]}
              placeholder="Имя"
              value={formData.firstName}
              onChangeText={(value) => handleInputChange("firstName", value)}
              editable={!showLoading}
            />
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, errors.lastName && styles.inputError]}
              placeholder="Фамилия"
              value={formData.lastName}
              onChangeText={(value) => handleInputChange("lastName", value)}
              editable={!showLoading}
            />
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Email"
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!showLoading}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="Телефон"
              value={formData.phone}
              onChangeText={(value) => handleInputChange("phone", value)}
              keyboardType="phone-pad"
              editable={!showLoading}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Пароль"
              value={formData.password}
              onChangeText={(value) => handleInputChange("password", value)}
              secureTextEntry
              editable={!showLoading}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              placeholder="Подтверждение пароля"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange("confirmPassword", value)}
              secureTextEntry
              editable={!showLoading}
            />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>

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
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  inputError: {
    borderColor: "#E53935",
    borderWidth: 1,
  },
  errorText: {
    color: "#E53935",
    fontSize: 14,
    marginTop: 5,
    marginLeft: 5,
    fontWeight: "500",
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