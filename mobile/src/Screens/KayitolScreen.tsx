import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Divider, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import config from '../../config';

type RootStackParamList = {
  Kayitol: { dietitian_id: string };
};

type KayitolRouteProp = RouteProp<RootStackParamList, 'Kayitol'>;

const KayitolScreen: React.FC = () => {
  const route = useRoute<KayitolRouteProp>();
  const navigation = useNavigation();
  const dietitianId = route.params?.dietitian_id;

  const [name, setName] = useState('');
  const [dietitianCode, setDietitianCode] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [dietitianName, setDietitianName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "").slice(0, 10);
    setPhone(digits);
  };

  const handleDietitianFetch = async (id: string) => {
    if (!id || id.length < 1) {
      setDietitianName('');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${config.apiUrl}/dietitian/getDietitianNameById?dietitian_id=${id}`
      );
      const data = await response.json();
      setDietitianName(typeof data === 'string' ? data : data.dietitian_name);
    } catch (error) {
      setDietitianName('Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !phone || !password) {
      console.log('Uyarı', 'Lütfen tüm alanları doldurun.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${config.apiUrl}/client/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: parseInt(phone),
            password: password,
            name: name,
            dietitian_id: parseInt(dietitianCode),
          })
        }
      );
      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('token', `Bearer ${data.token}`);
        navigation.navigate('AnaSayfa')
      } else {
        console.log('Hata', data.message || 'Kayıt başarısız.');
      }
    } catch (error) {
      console.log('Hata', 'Sunucuya bağlanılamadı.', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Kayıt Ol</Text>
      <TextInput
        label="İsim Soyisim"
        mode="outlined"
        value={name}
        onChangeText={setName}
        autoCapitalize="true"
        style={styles.input}
      />
      <Divider style={styles.divider} />
      <TextInput
        label="Telefon"
        mode="outlined"
        value={phone}
        onChangeText={handleChange}
        keyboardType="phone-pad"
        maxLength={10}
        placeholder="5xxxxxxxxx"
        left={<TextInput.Affix text="+90" />}
        style={styles.input}
      />
      <TextInput
        label="Şifre"
        mode="outlined"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Divider style={styles.divider} />
      <TextInput
        label="Diyetisyen Referans Kodu"
        mode="outlined"
        value={dietitianId}
        onChangeText={(text) => {
          setDietitianCode(text);
          handleDietitianFetch(text);
        }}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <Text style={styles.nameText}>Diyetisyen: {dietitianName}</Text>
      <Divider style={styles.divider} />
      {loading ? (
        <ActivityIndicator animating size="large" style={styles.loader} />
      ) : (
        <Button mode="contained" onPress={handleRegister} style={styles.button}>
          Kayıt Ol
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  header: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center'
  },
  input: {
    marginBottom: 16
  },
  button: {
    marginTop: 8
  },
  loader: {
    marginTop: 16
  },
  divider: {
    marginVertical: 12
  }
});

export default KayitolScreen;
