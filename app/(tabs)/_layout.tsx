import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import { Tabs } from "expo-router";
import { Platform, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useAuth } from "../contexts/AuthContext";

const Stack = createStackNavigator();

export default function TabLayout() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: Platform.OS === "ios", 
        ...TransitionPresets.SlideFromRightIOS,
      }}
    >
      <Stack.Screen name="tabs" component={TabsLayout} />
    </Stack.Navigator>
  );
}

function TabsLayout() {
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E8E',
          headerShown: false,
        }}
      >
        <Tabs.Screen 
          name="home" 
          options={{ 
            title: "Главная",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen 
          name="emergency" 
          options={{ 
            title: "SOS",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="alert-circle" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen 
          name="report" 
          options={{ 
            title: "Сообщить",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-text" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen 
          name="profile" 
          options={{ 
            title: "Профиль",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  }
});