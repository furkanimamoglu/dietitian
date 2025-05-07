// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config.js';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleChange = (text: string) => {
      const digits = text.replace(/[^0-9]/g, "").slice(0, 10);
      setPhone(digits);
    };

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${config.apiUrl}/client/login`, {
        phoneNumber: phone,
        password: password,
      });
      const token = response.data?.token;
      if (!token) throw new Error('Token alınamadı.');
      await AsyncStorage.setItem('token', `Bearer ${token}`);
      navigation.replace('AnaSayfa');
    } catch (error: any) {
      Alert.alert(
        'Giriş Başarısız',
        error?.response?.data?.message || error.message || 'Bilinmeyen hata'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDietitianLogin = () => {
    console.log('Diyetisyen girişine yönlendir');
  };

  return (
    <View style={styles.container}>
      <Icon name="leaf" size={100} color="#F57C00" style={styles.logo} />
      <Text variant="headlineMedium" style={styles.title}>Diyetisyen Uygulaması</Text>
      <Card style={styles.formCard}>
        <Card.Content>
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
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secure}
            right={
              <TextInput.Icon
                icon={secure ? 'eye' : 'eye-off'}
                onPress={() => setSecure(!secure)}
              />
            }
            mode="outlined"
            style={styles.input}
          />

          {/*
            <TouchableOpacity
              onPress={() => console.log('Şifre sıfırlama')}
              style={styles.forgotContainer}
            >
              <Text style={styles.forgotText}>Şifremi unuttum?</Text>
            </TouchableOpacity>
          */}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
          >
            Giriş Yap
          </Button>

          {/*
          <Button
            mode="text"
            onPress={handleDietitianLogin}
            style={styles.dietitianButton}
          >
            Diyetisyen Girişi
          </Button>
          */}
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff9f2',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#F57C00',
    fontWeight: '700'
  },
  formCard: {
    borderRadius: 16,
    elevation: 4,
    padding: 16,
    backgroundColor: '#FFFFFF'
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
    borderRadius: 25,
    paddingVertical: 4
  },
  dietitianButton: {
    alignSelf: 'center',
    marginTop: 8,
    color: '#1976D2'
  },
});

export default LoginScreen;
