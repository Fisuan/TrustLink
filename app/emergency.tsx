import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Vibration, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";

const EmergencyScreen = () => {
  const router = useRouter();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Получение местоположения при загрузке компонента
  useEffect(() => {
    (async () => {
      setLoadingLocation(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Ошибка", "Разрешите доступ к геолокации для точного определения местоположения при экстренном вызове.");
        setLoadingLocation(false);
        return;
      }

      try {
        // Получаем текущие координаты
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        setLocation(currentLocation);
        
        // Пытаемся получить адрес
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
            addressData.district || "",
            addressData.city || "",
            addressData.region || ""
          ].filter(Boolean).join(", ");
          
          setAddress(formattedAddress);
        }
      } catch (error) {
        console.error("Ошибка получения местоположения:", error);
      } finally {
        setLoadingLocation(false);
      }
    })();
  }, []);

  const handleEmergencyCall = () => {
    const locationText = address 
      ? `\n\nВаше местоположение: ${address}`
      : location 
        ? `\n\nВаши координаты: ${location.coords.latitude}, ${location.coords.longitude}`
        : "\n\nМестоположение не определено";
    
    Alert.alert(
      "🚨 Экстренный вызов", 
      `Вы уверены, что хотите совершить экстренный вызов?${locationText}`, 
      [
        { text: "Отмена", style: "cancel" },
        { 
          text: "Экстренный вызов", 
          style: "destructive",
          onPress: () => {
            
           // console.log("Вызов отправлен", {
             // timestamp: new Date().toISOString(),
        //      location: location ? {
            //    latitude: location.coords.latitude,
              //  longitude: location.coords.longitude,
             //   accuracy: location.coords.accuracy,
           //   } : null,
             // address
           // }); 
            
            Alert.alert(
              "Вызов отправлен",
              "Экстренные службы оповещены. Ожидайте звонка оператора."
            );
          }
        },
      ]
    );
  };

  const handleSOSStart = () => {
    setCountdown(3);
    let timeLeft = 3;
    
    const timer = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);

      Vibration.vibrate(500); 

      if (timeLeft <= 0) {
        clearInterval(timer);
        handleEmergencyCall();
      }
    }, 1000);

    setLongPressTimer(timer);
  };

  const handleSOSEnd = () => {
    if (longPressTimer) {
      clearInterval(longPressTimer);
      setLongPressTimer(null);
      setCountdown(null);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.header}>Экстренный вызов</Text>

      {/* Информация о местоположении */}
      <View style={styles.locationContainer}>
        <MaterialIcons name="location-on" size={24} color="#E53935" />
        {loadingLocation ? (
          <View style={styles.locationLoadingContainer}>
            <ActivityIndicator size="small" color="#666" />
            <Text style={styles.locationText}>Определение местоположения...</Text>
          </View>
        ) : address ? (
          <Text style={styles.locationText}>Ваше местоположение: {address}</Text>
        ) : (
          <Text style={styles.locationTextError}>Не удалось определить местоположение</Text>
        )}
      </View>

      <View style={styles.sosContainer}>
        <TouchableOpacity
          style={styles.sosButton}
          onPressIn={handleSOSStart}
          onPressOut={handleSOSEnd}
        >
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
        <Text style={[styles.holdText, countdown !== null && { color: "red" }]}>
          {countdown !== null ? `Осталось: ${countdown} сек` : "Удерживайте 3 секунды для вызова SOS"}
        </Text>
      </View>

      <Text style={styles.infoText}>
        В случае опасности не паникуйте. При отправке экстренного вызова будет автоматически передано ваше местоположение.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 20,
    paddingTop: 50,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 54,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  locationLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
  },
  locationText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    marginLeft: 10,
  },
  locationTextError: {
    fontSize: 14,
    color: "#E53935",
    flex: 1,
    marginLeft: 10,
  },
  sosContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  sosButton: {
    width: 150,
    height: 150,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sosText: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "bold",
  },
  holdText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  infoText: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
    marginTop: 20,
    paddingHorizontal: 10,
    lineHeight: 24,
  },
});

export default EmergencyScreen;