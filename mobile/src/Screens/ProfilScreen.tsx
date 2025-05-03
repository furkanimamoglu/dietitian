import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import Header from '../Components/Header';
import BottomNavbar from '../Components/BottomNavbar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Profil = ({ navigation }) => {
  const user = {
    name: 'Furkan İmamoğlu',
    phone: '+90 532 000 0000',
    avatar: 'https://i.pravatar.cc/150?img=3',
    dietitian: 'Dyt. Nur Seda'
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.labelText}>{user.phone}</Text>
          <Text style={styles.labelText}>Diyetisyeniniz: {user.dietitian}</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Button onPress={() => console.log('Profili Düzenle')} mode="outlined" style={styles.button}>Profili Düzenle</Button>
            <Button onPress={() => console.log('Şifreyi Değiştir')} mode="outlined" style={styles.button}>Şifreyi Değiştir</Button>
            <Button onPress={() => console.log('Ayarlar')} mode="outlined" style={styles.button}>Ayarlar</Button>
            <Button onPress={() => console.log('Çıkış yap')} mode="outlined" textColor="#d32f2f" style={styles.button} icon="logout">Çıkış Yap</Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <BottomNavbar navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { flex: 1, padding: 16 },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f57c00'
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4
  },
  labelText: {
    fontSize: 15,
    color: '#333',
    marginTop: 2
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: '#ffffff',
    paddingBottom: 12
  },
  button: {
    marginVertical: 6,
    borderRadius: 24
  }
});

export default Profil;
