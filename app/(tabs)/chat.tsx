import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image, Modal } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";

// Типы для сообщений
interface Message {
  id: number;
  text: string;
  isUser: boolean; // true для пользователя, false для виртуального помощника
  timestamp?: string;
  media?: {
    uri: string;
    type: string;
  };
}

// Компонент верхней панели
function TopBar({ goBack }: { goBack: () => void }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.headerText}>Помощник NEPITCH</Text>
    </View>
  );
}

const ChatScreen = () => {
  const router = useRouter();
  const [text, setText] = useState("");
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [media, setMedia] = useState<{ uri: string, type: string } | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Пример сообщений для чата с помощником
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Здравствуйте! Я помощник TrustLink. Чем могу помочь?", isUser: false, timestamp: new Date().toISOString() },
  ]);

  // Загрузка геоданных при запуске
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        try {
          const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced
          });
          setLocation(currentLocation);
          
          const geocode = await Location.reverseGeocodeAsync({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude
          });
          
          if (geocode && geocode.length > 0) {
            const addressData = geocode[0];
            const formattedAddress = [
              addressData.street && addressData.streetNumber 
                ? `${addressData.street}, ${addressData.streetNumber}`
                : addressData.street || "",
              addressData.city || "",
              addressData.region || ""
            ].filter(Boolean).join(", ");
            
            setAddress(formattedAddress);
          }
        } catch (error) {
          console.error("Ошибка получения местоположения:", error);
        }
      }
    })();
  }, []);

  // Выбор изображения из галереи
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Ошибка", "Разрешите доступ к галерее для прикрепления фото.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        setMedia({ 
          uri: selectedAsset.uri, 
          type: selectedAsset.type || 'image'
        });
      }
    } catch (error) {
      console.error("Ошибка при выборе изображения:", error);
      Alert.alert("Ошибка", "Не удалось загрузить изображение.");
    }
  };

  // Удаление прикрепленного изображения
  const removeImage = () => {
    setMedia(null);
  };

  // Показать изображение в полноэкранном режиме
  const showFullImage = (uri: string) => {
    setSelectedImage(uri);
    setModalVisible(true);
  };

  // Простой обработчик сообщений для виртуального помощника
  const handleAssistantResponse = (userMessage: string, hasMedia: boolean) => {
    // Преобразуем к нижнему регистру для проверок
    const message = userMessage.toLowerCase();
    
    // Учитываем наличие изображения
    if (hasMedia) {
      return "Спасибо за изображение! Я получил ваше фото и проанализирую его.";
    }
    
    // Шаблоны для ответов
    if (message.includes("происшест") || message.includes("случи") || message.includes("проблем")) {
      return "Чтобы сообщить о происшествии, воспользуйтесь кнопкой 'Сообщить' в нижнем меню. Там вы сможете описать ситуацию и приложить фото.";
    } 
    else if (message.includes("экстренн") || message.includes("чп") || message.includes("срочн") || message.includes("помощ") || message.includes("sos")) {
      return "В экстренных ситуациях воспользуйтесь кнопкой SOS в нижнем меню. При вызове автоматически будет передано ваше местоположение.";
    }
    else if (message.includes("местоположени") || message.includes("где я") || message.includes("локац") || message.includes("адрес")) {
      return address 
        ? `Ваше текущее местоположение: ${address}`
        : "К сожалению, не удалось определить ваше местоположение. Убедитесь, что у приложения есть доступ к геолокации.";
    }
    else if (message.includes("привет") || message.includes("здравст") || message.includes("добрый")) {
      return "Здравствуйте! Чем могу помочь вам сегодня?";
    }
    else if (message.includes("спасиб") || message.includes("благодар")) {
      return "Всегда рад помочь! Если у вас возникнут еще вопросы, обращайтесь.";
    }
    else if (message.includes("фото") || message.includes("картин") || message.includes("изображ") || message.includes("снимок")) {
      return "Вы можете прикрепить фото к сообщению, нажав на иконку камеры рядом с полем ввода.";
    }
    else {
      return "Извините, я не совсем понимаю. Могу помочь с информацией о безопасности, экстренных ситуациях или сообщениях о происшествиях.";
    }
  };

  const handleSendMessage = () => {
    if (!text.trim() && !media) {
      return; // Ничего не отправляем, если нет ни текста, ни медиа
    }

    // Добавляем сообщение пользователя
    const userMessage: Message = {
      id: Date.now(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date().toISOString(),
      media: media || undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Очищаем поле ввода и медиа
    setText("");
    setMedia(null);
    
    // Генерируем ответ помощника после небольшой задержки
    setTimeout(() => {
      const assistantMessage: Message = {
        id: Date.now() + 1,
        text: handleAssistantResponse(userMessage.text, !!userMessage.media),
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.assistantMessage]}>
      {item.media && (
        <TouchableOpacity onPress={() => showFullImage(item.media!.uri)}>
          <Image 
            source={{ uri: item.media.uri }} 
            style={styles.messageImage} 
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}
      {item.text && (
        <Text style={[styles.messageText, item.isUser ? styles.userText : styles.assistantText]}>
          {item.text}
        </Text>
      )}
      {item.timestamp && (
        <Text style={[styles.timestampText, item.isUser ? styles.userTimestamp : styles.assistantTimestamp]}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TopBar goBack={() => router.back()} />
      
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id.toString()}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
      />

      {media && (
        <View style={styles.mediaPreviewContainer}>
          <Image source={{ uri: media.uri }} style={styles.mediaPreview} />
          <TouchableOpacity style={styles.removeMediaButton} onPress={removeImage}>
            <Ionicons name="close-circle" size={24} color="#E53935" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
          <Ionicons name="camera" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Введите сообщение..."
          multiline
        />
        
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            (!text.trim() && !media) && styles.sendButtonDisabled
          ]} 
          onPress={handleSendMessage}
          disabled={!text.trim() && !media}
        >
          <Ionicons 
            name="send" 
            size={24} 
            color={(text.trim() || media) ? "#007AFF" : "#C7C7C7"} 
          />
        </TouchableOpacity>
      </View>

      {/* Модальное окно для просмотра изображения */}
      <Modal 
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeModalButton} 
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close" size={30} color="#FFF" />
          </TouchableOpacity>
          
          {selectedImage && (
            <Image 
              source={{ uri: selectedImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
  messagesList: {
    flex: 1,
    padding: 15,
  },
  messagesContent: {
    paddingBottom: 10,
  },
  messageContainer: {
    maxWidth: "80%",
    marginVertical: 5,
    padding: 12,
    borderRadius: 15,
  },
  assistantMessage: {
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
    lineHeight: 22,
  },
  assistantText: {
    color: "#000",
  },
  userText: {
    color: "#FFF",
  },
  timestampText: {
    fontSize: 10,
    marginTop: 4,
  },
  assistantTimestamp: {
    color: "#999",
    textAlign: "right",
  },
  userTimestamp: {
    color: "#DDD",
    textAlign: "right",
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginBottom: 8,
  },
  mediaPreviewContainer: {
    padding: 10,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    alignItems: "center",
    position: "relative",
  },
  mediaPreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removeMediaButton: {
    position: "absolute",
    top: 5,
    right: "35%",
    backgroundColor: "#FFF",
    borderRadius: 12,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    alignItems: "center",
  },
  attachButton: {
    padding: 10,
    marginRight: 5,
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
    padding: 10,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "90%",
    height: "70%",
  },
  closeModalButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
});

export default ChatScreen; 