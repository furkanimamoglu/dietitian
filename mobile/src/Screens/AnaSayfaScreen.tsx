import React from 'react';
import { View, StyleSheet, ScrollView, Text as RNText } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import Header from '../Components/Header';
import BottomNavbar from '../Components/BottomNavbar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'AnaSayfa'>;

const AnaSayfa = ({ navigation }: Props) => {
  const healthData = {
    weight: '70 kg',
    muscleRate: '%40',
    fatRate: '%20',
    waterRate: '%60',
    waterAmount: '1.5L / 2.5L'
  };

  const danisanAdi = 'Furkan'; // Danışan adı
  const waterPercentage = parseInt(healthData.waterRate.replace('%', ''));

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />

      <ScrollView style={styles.content}>
        <View style={styles.greetingBox}>
          <Text style={styles.welcomeText}>Hoş geldin, {danisanAdi}!</Text>
          <Text style={styles.subText}>Bugün harika görünüyorsun 🌞</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.healthStats}>
              <View style={styles.healthStatItem}>
                <Text style={styles.healthStatValue}><Icon name="human-male-height" size={16} color="#6d4c41" /> {healthData.weight}</Text>
                <Text style={styles.healthStatLabel}>Ağırlık</Text>
              </View>
              <View style={styles.healthStatItem}>
                <Text style={styles.healthStatValue}><Icon name="arm-flex" size={16} color="#388e3c" /> {healthData.muscleRate}</Text>
                <Text style={styles.healthStatLabel}>Kas Oranı</Text>
              </View>
              <View style={styles.healthStatItem}>
                <Text style={styles.healthStatValue}><Icon name="scale" size={16} color="#f57c00" /> {healthData.fatRate}</Text>
                <Text style={styles.healthStatLabel}>Yağ Oranı</Text>
              </View>
              <View style={styles.healthStatItem}>
                <Text style={styles.healthStatValue}><Icon name="water-percent" size={16} color="#0288d1" /> {healthData.waterRate}</Text>
                <Text style={styles.healthStatLabel}>Su Oranı</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title
            title="Günlük Diyet Programı"
            titleStyle={styles.cardTitle}
            left={() => <Icon name="food" size={24} style={styles.iconDiet} />}
          />
          <Card.Content>
            <Text>• 08:00 Kahvaltı 🥣</Text>
            <Text>• 13:00 Öğle Yemeği 🍛</Text>
            <Text>• 19:00 Akşam Yemeği 🍲</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title
            title="Günlük Egzersiz Planı"
            titleStyle={styles.cardTitle}
            left={() => <Icon name="dumbbell" size={24} style={styles.iconExercise} />}
          />
          <Card.Content>
            <Text>• 09:00 Kardiyo - 15 dk 🏃‍♂️</Text>
            <Text>• 18:00 Yoga - 20 dk 🧘‍♀️</Text>
          </Card.Content>
        </Card>

        <Card style={styles.cardBlue}>
          <Card.Title
            title="Su Tüketimi"
            titleStyle={styles.cardTitle}
            left={() => <Icon name="cup-water" size={24} style={styles.iconWater} />}
          />
          <Card.Content style={{ alignItems: 'center' }}>
            <View style={styles.waterGlassOuter}>
              <View style={styles.waterGlass}>
                <View style={[styles.waterGlassEmpty]} />
                <View style={[styles.waterFill, { height: `${waterPercentage}%` }]} />
              </View>
              <RNText style={styles.waterGlassText}>{waterPercentage}%</RNText>
            </View>
            <Text style={styles.waterAmount}>{healthData.waterAmount}</Text>
          </Card.Content>
        </Card>
      </ScrollView>

      <BottomNavbar navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f7' },
  content: { flex: 1 },
  greetingBox: { alignItems: 'center', paddingVertical: 24, backgroundColor: '#ffffff', marginBottom: 8 },
  welcomeText: { fontSize: 22, fontWeight: 'bold', color: '#2e7d32', marginTop: 12 },
  subText: { fontSize: 14, color: '#555', marginTop: 4 },
  card: { marginHorizontal: 16, marginBottom: 20, elevation: 4, borderRadius: 16, backgroundColor: '#ffffff' },
  cardBlue: { marginHorizontal: 16, marginBottom: 20, elevation: 4, borderRadius: 16, backgroundColor: '#e3f2fd' },
  cardTitle: { fontWeight: 'bold', fontSize: 18 },
  iconStats: { marginLeft: 16, color: '#c2185b' },
  iconDiet: { marginLeft: 16, color: '#8d6e63' },
  iconWater: { marginLeft: 16, color: '#0288d1' },
  iconExercise: { marginLeft: 16, color: '#fbc02d' },
  healthStats: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 12 },
  healthStatItem: { alignItems: 'center' },
  healthStatValue: { fontSize: 16, fontWeight: 'bold', color: '#424242' },
  healthStatLabel: { color: '#616161' },
  waterGlassOuter: {
    width: 70,
    height: 130,
    borderWidth: 2,
    borderColor: '#64b5f6',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: '#e0f7fa',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative'
  },
  waterGlass: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
  },
  waterGlassEmpty: {
    flex: 1,
    backgroundColor: '#e0f7fa',
  },
  waterFill: {
    backgroundColor: '#4fc3f7',
    width: '100%',
  },
  waterGlassText: {
    position: 'absolute',
    top: 8,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  waterAmount: {
    marginTop: 10,
    fontSize: 16,
    color: '#0d47a1',
    fontWeight: '600'
  }
});

export default AnaSayfa;
