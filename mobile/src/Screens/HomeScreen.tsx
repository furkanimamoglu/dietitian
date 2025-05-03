import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import Header from '../Components/Header';

 type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <Header navigation={navigation} />

      <ScrollView style={styles.content}>
        <View style={styles.greetingBox}>
          <Text style={styles.welcomeText}>Hoş geldin!</Text>
          <Text style={styles.dietitianText}>👩‍⚕️ Diyetisyen: Diyetisyen Nur Seda</Text>
        </View>

        <Card style={styles.card}>
          <Card.Title title="Sağlık Durumun" titleStyle={styles.cardTitle} />
          <Card.Content>
            <View style={styles.healthStats}>
              <View style={styles.healthStatItem}>
                <Text style={styles.healthStatValue}>📏 70 kg</Text>
                <Text style={styles.healthStatLabel}>Ağırlık</Text>
              </View>
              <View style={styles.healthStatItem}>
                <Text style={styles.healthStatValue}>💪 %40</Text>
                <Text style={styles.healthStatLabel}>Kas Oranı</Text>
              </View>
              <View style={styles.healthStatItem}>
                <Text style={styles.healthStatValue}>🧈 %20</Text>
                <Text style={styles.healthStatLabel}>Yağ Oranı</Text>
              </View>
              <View style={styles.healthStatItem}>
                <Text style={styles.healthStatValue}>💧 %60</Text>
                <Text style={styles.healthStatLabel}>Su Oranı</Text>
              </View>
            </View>
            <Button mode="outlined" style={styles.detailsButton}>Detayları Görüntüle</Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Günlük Diyet Programı 🍽️" titleStyle={styles.cardTitle} />
          <Card.Content>
            <Text>• 08:00 Kahvaltı</Text>
            <Text>• 13:00 Öğle Yemeği</Text>
            <Text>• 19:00 Akşam Yemeği</Text>
            <Button mode="contained" style={styles.button} onPress={() => navigation.navigate('DailyDiet')}>
              Diyetimi Gör
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.cardBlue}>
          <Card.Title title="Su Tüketimi 💧" titleStyle={styles.cardTitle} />
          <Card.Content style={{ alignItems: 'center' }}>
            <View style={styles.waterProgressContainer}>
              <View style={styles.waterProgressCircle}>
                <Text style={styles.waterPercent}>60%</Text>
              </View>
            </View>
            <Text style={styles.waterAmount}>1.5L / 2.5L</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Egzersizler 💪" titleStyle={styles.cardTitle} />
          <Card.Content>
            <Text>• 09:00 Kardiyo - 15 dk</Text>
            <Text>• 18:00 Yoga - 20 dk</Text>
            <Button mode="contained" style={styles.button} onPress={() => navigation.navigate('DailyExercise')}>
              Egzersizleri Gör
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={styles.bottomNavbar}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.navItem}>
          <Text style={styles.navText}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log('+ Menu')} style={styles.navCenterButton}>
          <Text style={styles.plusText}>➕</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profil')} style={styles.navItem}>
          <Text style={styles.navText}>👤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { flex: 1 },
  greetingBox: { alignItems: 'center', paddingVertical: 24 },
  welcomeText: { fontSize: 20, fontWeight: 'bold', color: '#2e7d32' },
  dietitianText: { fontSize: 14, color: '#555', marginTop: 4 },
  card: { marginHorizontal: 16, marginBottom: 20, elevation: 4, borderRadius: 12 },
  cardBlue: { marginHorizontal: 16, marginBottom: 20, elevation: 4, borderRadius: 12, backgroundColor: '#f0f8ff' },
  cardTitle: { fontWeight: 'bold' },
  button: { marginTop: 12, borderRadius: 20 },
  detailsButton: { marginTop: 16 },
  healthStats: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  healthStatItem: { alignItems: 'center' },
  healthStatValue: { fontSize: 16, fontWeight: 'bold' },
  healthStatLabel: { color: '#388e3c' },
  waterProgressContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8
  },
  waterProgressCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#bbdefb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#64b5f6'
  },
  waterPercent: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2'
  },
  waterAmount: {
    marginTop: 10,
    fontSize: 16,
    color: '#0d47a1',
    fontWeight: '600'
  },
  bottomNavbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 70,
    backgroundColor: '#f57c00',
    paddingHorizontal: 40,
    borderTopWidth: 1,
    borderTopColor: '#e65100',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
    elevation: 8
  },
  navItem: {
    alignItems: 'center'
  },
  navText: {
    fontSize: 24,
    color: '#ffffff'
  },
  navCenterButton: {
    backgroundColor: '#ffffff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 10
  },
  plusText: {
    fontSize: 32,
    color: '#f57c00'
  }
});

export default HomeScreen;
