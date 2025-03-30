import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, ActivityIndicator, Image } from "react-native";
import { Link, useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadingInterval = setInterval(() => {
      setProgress(prevProgress => {
        const newProgress = prevProgress + (Math.random() * 15);
        if (newProgress >= 100) {
          clearInterval(loadingInterval);
          // Перенаправляем на главную после окончания анимации загрузки
          setTimeout(() => {
            router.replace('/(tabs)/home' as any);
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 400);

    return () => clearInterval(loadingInterval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TRUSTLINK</Text>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.subtitle}>Загрузка... {Math.round(progress)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 30,
    letterSpacing: 2,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  progressContainer: {
    width: '80%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  }
});