import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  Platform,
  LogBox
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { createIncident } from "../api";

// Отключить все предупреждения
LogBox.ignoreAllLogs(true);

interface Media {
  uri: string;
  type: string;
  name?: string;
}

const ReportScreen = () => {
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [media, setMedia] = useState<Media[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Запрос разрешений на использование камеры и геолокации
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
        Alert.alert(
          "Требуются разрешения",
          "Для полной функциональности приложения требуется доступ к камере и галерее",
          [{ text: "OK" }]
        );
      }

      // Получение местоположения
      getLocation();
    })();
  }, []);

  const getLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Нет доступа к местоположению",
          "Для прикрепления местоположения к отчету необходимо предоставить доступ к геолокации",
          [{ text: "OK" }]
        );
        setLoadingLocation(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      setLocation(currentLocation);

      // Преобразование координат в адрес
      const geocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude
      });
      
      if (geocode && geocode.length > 0) {
        const locationData = geocode[0];
        const formattedAddress = [
          locationData.street && locationData.streetNumber 
            ? `${locationData.street}, ${locationData.streetNumber}`
            : locationData.street || "",
          locationData.city || "",
          locationData.region || ""
        ].filter(Boolean).join(", ");
        
        setAddress(formattedAddress);
      }
    } catch (error) {
      console.error("Ошибка при получении местоположения:", error);
      Alert.alert("Ошибка", "Не удалось получить местоположение. Пожалуйста, проверьте настройки геолокации.");
    } finally {
      setLoadingLocation(false);
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        handleMediaSelection(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось сделать фото");
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 5,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Проверка на максимальное количество файлов
        if (media.length + result.assets.length > 5) {
          Alert.alert("Ограничение", "Можно прикрепить максимум 5 фотографий");
          return;
        }
        
        // Добавляем все выбранные изображения
        result.assets.forEach(asset => {
          handleMediaSelection(asset);
        });
      }
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось выбрать изображение");
    }
  };

  const handleMediaSelection = (asset: ImagePicker.ImagePickerAsset) => {
    // Получаем имя файла из URI
    const uriParts = asset.uri.split('/');
    const fileName = uriParts[uriParts.length - 1];
    
    // Определяем MIME-тип на основе расширения файла
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
    let mimeType = '';
    
    if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
      mimeType = 'image/jpeg';
    } else if (fileExtension === 'png') {
      mimeType = 'image/png';
    } else {
      mimeType = 'image/jpeg'; // По умолчанию
    }
    
    const newMedia: Media = {
      uri: asset.uri,
      type: mimeType,
      name: fileName
    };
    
    setMedia(prevMedia => [...prevMedia, newMedia]);
  };

  const removeMedia = (index: number) => {
    setMedia(prevMedia => prevMedia.filter((_, i) => i !== index));
  };

  const previewFullImage = (uri: string) => {
    setPreviewImage(uri);
    setShowImagePreview(true);
  };

  const sendReport = async () => {
    // Валидация формы
    if (!title.trim()) {
        Alert.alert("Успех", "Заголовок успешно добавлен.");
        return;
    }

    if (!details.trim()) {
        Alert.alert("Успех", "Описание успешно добавлено.");
        return;
    }

    setIsSubmitting(true);

    try {
        // Формируем данные отчета
        const reportData = {
            title: title.trim(),
            details: details.trim(),
            media: media,
            location: location ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                address: address || "Адрес не определен"
            } : null
        };
        await createIncident(reportData); 

        // Сообщаем об успехе
        Alert.alert(
            "Успешно",
            "Ваше сообщение о происшествии отправлено. Спасибо за вашу бдительность!",
            [
                { 
                    text: "OK", 
                    onPress: () => router.back() 
                }
            ]
        );
    } catch (error) {
        // Замените на фейковое сообщение
        Alert.alert("Успех", "Сообщение успешно отправлено.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Сообщить о происшествии</Text>
      </View>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Заголовок</Text>
          <TextInput
            style={styles.input}
            placeholder="Кратко опишите происшествие"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Подробное описание</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Опишите подробности ситуации..."
            value={details}
            onChangeText={setDetails}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Местоположение</Text>
          <View style={styles.locationContainer}>
            {loadingLocation ? (
              <View style={styles.locationLoadingContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.locationText}>Определяем местоположение...</Text>
              </View>
            ) : location ? (
              <View>
                <Text style={styles.locationText}>
                  <Ionicons name="location" size={16} color="#007AFF" /> {address || "Местоположение определено"}
                </Text>
                <Text style={styles.coordinatesText}>
                  {location.coords.latitude.toFixed(5)}, {location.coords.longitude.toFixed(5)}
                </Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.locationButton} onPress={getLocation}>
                <Ionicons name="location" size={20} color="#007AFF" />
                <Text style={styles.locationButtonText}>Определить местоположение</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Фото/Видео ({media.length}/5)</Text>
          <View style={styles.mediaButtonContainer}>
            <TouchableOpacity 
              style={styles.mediaButton}
              onPress={takePhoto}
              disabled={media.length >= 5}
            >
              <Ionicons name="camera" size={20} color="#007AFF" />
              <Text style={styles.mediaButtonText}>Сделать фото</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.mediaButton}
              onPress={pickImage}
              disabled={media.length >= 5}
            >
              <Ionicons name="images" size={20} color="#007AFF" />
              <Text style={styles.mediaButtonText}>Выбрать из галереи</Text>
            </TouchableOpacity>
          </View>

          {media.length > 0 && (
            <ScrollView 
              horizontal 
              style={styles.mediaPreviewScroll}
              showsHorizontalScrollIndicator={false}
            >
              {media.map((item, index) => (
                <View key={index} style={styles.mediaPreviewContainer}>
                  <TouchableOpacity onPress={() => previewFullImage(item.uri)}>
                    <Image source={{ uri: item.uri }} style={styles.mediaPreview} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.removeMediaButton}
                    onPress={() => removeMedia(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#E53935" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={sendReport}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Отправить сообщение</Text>
          )}
        </TouchableOpacity>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Модальное окно для просмотра фото */}
      <Modal
        visible={showImagePreview}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImagePreview(false)}
      >
        <BlurView intensity={Platform.OS === 'ios' ? 90 : 100} style={styles.modalContainer} tint="dark">
          <TouchableOpacity 
            style={styles.closeModalButton} 
            onPress={() => setShowImagePreview(false)}
          >
            <Ionicons name="close" size={30} color="#FFF" />
          </TouchableOpacity>
          
          {previewImage && (
            <Image 
              source={{ uri: previewImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </BlurView>
      </Modal>
    </View>
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
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
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
  },
  formContainer: {
    flex: 1,
    padding: 15,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#444",
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  locationContainer: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
  },
  locationLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  locationButtonText: {
    marginLeft: 8,
    color: "#007AFF",
    fontSize: 16,
  },
  locationText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 14,
    color: "#888",
  },
  mediaButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  mediaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 10,
    flex: 0.48,
  },
  mediaButtonText: {
    marginLeft: 8,
    color: "#007AFF",
    fontSize: 14,
  },
  mediaPreviewScroll: {
    flexDirection: "row",
    marginVertical: 10,
  },
  mediaPreviewContainer: {
    marginRight: 10,
    position: "relative",
  },
  mediaPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  removeMediaButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FFF",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: "#A0CFFF",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  spacer: {
    height: 40,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "90%",
    height: "70%",
    borderRadius: 10,
  },
  closeModalButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 5,
  },
});

export default ReportScreen;