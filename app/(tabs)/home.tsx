import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const HomeScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Безопасность</Text>

      {/* Основные кнопки */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buttonEmergency} onPress={() => router.push('/emergency' as any)}>
          <Ionicons name="alert-circle" size={30} color="#fff" />
          <Text style={styles.buttonText}>Экстренный вызов</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/report' as any)}>
          <MaterialIcons name="report-problem" size={30} color="#000" />
          <Text style={styles.buttonTextBlack}>Сообщить о происшествии</Text>
        </TouchableOpacity>
      </View>

      {/* Лента */}
      <View style={styles.newsFeed}>
        <Text style={styles.newsHeader}>Новости безопасности</Text>

        <ScrollView style={styles.newsScroll} showsVerticalScrollIndicator={false}>
          {[
            { title: "⚠ Внимание! Новые мошеннические схемы", text: "Будьте осторожны: участились случаи звонков от фальшивых сотрудников банков..." },
            { title: "🚨 Срочное предупреждение", text: "Сегодня в 17:30 зафиксировано ЧП в районе центра города..." },
            { title: "🏢 Новый участковый пункт полиции в Астане", text: "В районе Байконыр по ул. Янушкевича, 10 открылся УПП № 20...." },
          ].map((news, index) => (
            <View key={index} style={styles.newsItem}>
              <Text style={styles.newsTitle}>{news.title}</Text>
              <Text style={styles.newsText}>{news.text}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Кнопка */}
        <TouchableOpacity style={styles.moreNewsButton} onPress={() => router.push("/news")}>
          <Text style={styles.moreNewsText}>Больше новостей</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Стили
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 20,
    paddingTop: 50, // Отступ от верха без учета верхней панели
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
  newsScroll: {
    maxHeight: 500, 
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
  moreNewsButton: {
    backgroundColor: "#1976D2",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  moreNewsText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HomeScreen;