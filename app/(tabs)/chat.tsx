import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useChat, Message } from "../contexts/ChatContext";

// Для демонстрации используем хардкодный ID инцидента
// В реальном приложении это должно быть получено через навигацию или контекст
const DEMO_INCIDENT_ID = "1";

const ChatScreen = () => {
  const router = useRouter();
  const { messages, sendMessage, isConnected, isConnecting, error, connect, disconnect } = useChat();
  const [text, setText] = useState("");

  useEffect(() => {
    // Подключаемся к чату при монтировании компонента
    connect(DEMO_INCIDENT_ID);

    // Отключаемся при размонтировании
    return () => {
      disconnect();
    };
  }, []);

  // Обработка ошибок подключения
  useEffect(() => {
    if (error) {
      Alert.alert("Ошибка подключения", error);
    }
  }, [error]);

  const handleSendMessage = () => {
    if (text.trim()) {
      sendMessage(text);
      setText("");
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isOperator ? styles.operatorMessage : styles.userMessage]}>
      <Text style={[styles.messageText, item.isOperator ? styles.operatorText : styles.userText]}>
        {item.text}
      </Text>
      {item.timestamp && (
        <Text style={[styles.timestampText, item.isOperator ? styles.operatorTimestamp : styles.userTimestamp]}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      )}
    </View>
  );

  if (isConnecting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Подключение к чату...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Чат с оператором</Text>
        {isConnected && (
          <View style={styles.statusContainer}>
            <View style={styles.statusIndicator} />
            <Text style={styles.statusText}>В сети</Text>
          </View>
        )}
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id.toString()}
        style={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Введите сообщение..."
          multiline
          editable={isConnected}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !isConnected && styles.sendButtonDisabled]} 
          onPress={handleSendMessage}
          disabled={!isConnected || !text.trim()}
        >
          <Ionicons name="send" size={24} color={isConnected ? "#007AFF" : "#C7C7C7"} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    marginRight: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    color: "#4CAF50",
  },
  messagesList: {
    flex: 1,
    padding: 15,
  },
  messageContainer: {
    maxWidth: "80%",
    marginVertical: 5,
    padding: 12,
    borderRadius: 15,
  },
  operatorMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
  },
  messageText: {
    fontSize: 16,
  },
  operatorText: {
    color: "#000",
  },
  userText: {
    color: "#FFF",
  },
  timestampText: {
    fontSize: 10,
    marginTop: 4,
  },
  operatorTimestamp: {
    color: "#999",
    textAlign: "right",
  },
  userTimestamp: {
    color: "#DDD",
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  input: {
    flex: 1,
    marginRight: 10,
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    maxHeight: 100,
  },
  sendButton: {
    alignSelf: "flex-end",
    padding: 10,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatScreen; 