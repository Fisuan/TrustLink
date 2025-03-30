import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const HomeScreen = () => {
  const router = useRouter(); // Используем только expo-router

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <Text style={styles.header}>Безопасность</Text>

      {/* Основные кнопки */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buttonEmergency} onPress={() => router.push("/emergency")}>
          <Ionicons name="alert-circle" size={30} color="#fff" />
          <Text style={styles.buttonText}>Экстренный вызов</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/report")}>
          <MaterialIcons name="report-problem" size={30} color="#000" />
          <Text style={styles.buttonTextBlack}>Сообщить о происшествии</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/chat")}>
          <Ionicons name="chatbubbles" size={30} color="#000" />
          <Text style={styles.buttonTextBlack}>Чат с оператором</Text>
        </TouchableOpacity>
      </View>

      {/* Лента новостей */}
      <ScrollView style={styles.newsFeed} keyboardShouldPersistTaps="handled">
        <Text style={styles.newsHeader}>Новости безопасности</Text>
        <View style={styles.newsItem}>
          <Text style={styles.newsTitle}>⚠ Внимание! Новые мошеннические схемы</Text>
          <Text style={styles.newsText}>Будьте осторожны: участились случаи звонков от фальшивых сотрудников банков...</Text>
        </View>
        <View style={styles.newsItem}>
          <Text style={styles.newsTitle}>🚨 Срочное предупреждение</Text>
          <Text style={styles.newsText}>Сегодня в 17:30 зафиксировано ЧП в районе центра города...</Text>
        </View>
      </ScrollView>
    </View>
  );
};

// 🎨 Стили
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  buttonEmergency: {
    backgroundColor: "#E53935",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  buttonTextBlack: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  newsFeed: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 15,
  },
  newsHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  newsItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#E3F2FD",
    borderRadius: 5,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  newsText: {
    fontSize: 14,
    color: "#444",
  },
});

export default HomeScreen;
