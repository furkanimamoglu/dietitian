import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config.js';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const response = await axios.post(`${config.apiUrl}/client/login`, {
        email: username,
        password: password
      });

      const token = response.data?.token;

      if (!token) {
        throw new Error('Token alınamadı.');
      }

      await AsyncStorage.setItem('token', `Bearer ${token}`);

      navigation.replace('AnaSayfa');
    } catch (error: any) {
      Alert.alert('Giriş Başarısız', error?.response?.data?.message || error.message || 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  const handleDietitianLogin = () => {
    console.log('Diyetisyen girişine yönlendir');
    // navigation.navigate('DietitianLogin');
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Giriş Yap</Text>

      <TextInput
        label="E-posta"
        value={username}
        onChangeText={setUsername}
        mode="outlined"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        label="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={secure}
        right={<TextInput.Icon icon={secure ? 'eye' : 'eye-off'} onPress={() => setSecure(!secure)} />}
        mode="outlined"
        style={styles.input}
      />

      <TouchableOpacity onPress={() => console.log('Şifre sıfırlama')} style={styles.forgotContainer}>
        <Text style={styles.forgotText}>Şifremi unuttum</Text>
      </TouchableOpacity>

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        disabled={loading}
        style={styles.loginButton}
      >
        Giriş Yap
      </Button>

      <Button mode="text" onPress={handleDietitianLogin} style={styles.dietitianButton}>
        Diyetisyen Girişi
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#F57C00',
  },
  input: {
    marginBottom: 16,
  },
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  forgotText: {
    color: '#F57C00',
    textDecorationLine: 'underline',
  },
  loginButton: {
    marginBottom: 12,
  },
  dietitianButton: {
    alignSelf: 'center',
    marginTop: 12,
  },
});

export default LoginScreen;
