import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface NewsItem {
  title: string;
  text: string;
}

const newsData: NewsItem[] = [
  {
    title: "⚠ Внимание! Новые мошеннические схемы",
    text: `В последнее время участились случаи телефонного мошенничества, когда злоумышленники представляются сотрудниками банков. Они звонят клиентам, сообщая о подозрительных операциях, блокировке карты или необходимости срочного перевода средств для "защиты счета". Под давлением жертвы переводят деньги на подставные счета или сообщают мошенникам конфиденциальные данные.
    \nЧтобы избежать обмана, помните:
    - Банки никогда не запрашивают пароли, PIN-коды и CVC-коды по телефону.
    - Не совершайте переводы по просьбе незнакомцев.
    - Если звонящий представляется сотрудником банка, прекратите разговор и перезвоните в банк по официальному номеру.
    \nБудьте бдительны и берегите свои финансы!`,
  },
  {
    title: "🚨 Срочное предупреждение",
    text: `Сегодня в 17:30 зафиксировано ЧП в районе центра города. По предварительной информации, произошел инцидент, требующий повышенной бдительности граждан. На месте работают экстренные службы, проводится расследование.
    \nЖителей и гостей города просят:
    - Избегать района происшествия до окончания работ спецслужб.
    - Не распространять неподтвержденную информацию.
    - Следить за официальными сообщениями властей.
    \nБудьте осторожны и следуйте рекомендациям экстренных служб!`,
  },
  {
    title: "🏢 Новый участковый пункт полиции в Астане",
    text: `В районе Байконыр по улице Янушкевича, 10 открылся новый участковый пункт полиции № 20. В церемонии открытия приняли участие начальник департамента полиции Астаны Марат Тулебаев и аким района Талгат Рахманберди.
    \nПо словам Марата Тулебаева, новые участковые пункты помогают полиции оперативно реагировать на обращения граждан и укреплять доверие населения.
    \nУПП № 20 охватывает территорию с детскими садами, жилыми комплексами и университетом. Его площадь — 75 м², в нем оборудованы кабинеты инспекторов, комната приема граждан и помещение для дежурных сотрудников. Здесь работают пять полицейских, обеспечивающих порядок и безопасность района.`,
  },
];

const NewsFeed: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.header}>Новости безопасности</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {newsData.map((item, index) => (
          <View key={index} style={styles.newsCard}>
            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.newsText}>{item.text}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingTop: 50,
    paddingHorizontal: 15,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 15,
    padding: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  newsCard: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  newsText: {
    fontSize: 14,
    color: "#444",
  },
});

export default NewsFeed;
