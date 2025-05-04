import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import config from '../../config';

// Navigation params tanımı
type RootStackParamList = {
  Kayitol: { dietitian_id: string };
};

type KayitolRouteProp = RouteProp<RootStackParamList, 'Kayitol'>;

const KayitolScreen: React.FC = () => {
  const route = useRoute<KayitolRouteProp>();
  const navigation = useNavigation();
  const dietitianId = route.params?.dietitian_id;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!dietitianId) {
      Alert.alert('Hata', 'Diyetisyen bilgisi bulunamadı.');
      return;
    }
    if (!name || !email || !password) {
      Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${config.base_url}/register?dietitian_id=${dietitianId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        }
      );
      const data = await response.json();
      if (response.ok) {
        // Kayıt başarılı, token alındıysa kaydet veya yönlendir
        // Örneğin giriş ekranına dön
        Alert.alert('Başarılı', 'Kayıt başarılı. Giriş yapabilirsiniz.', [
          { text: 'Tamam', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert('Hata', data.message || 'Kayıt başarısız.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Kayıt Ol</Text>
      <TextInput
        label="İsim"
        mode="outlined"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        label="Email"
        mode="outlined"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
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
  }
});

export default KayitolScreen;
