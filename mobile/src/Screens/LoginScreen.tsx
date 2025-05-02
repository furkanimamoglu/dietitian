import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App'; // Eğer AppNavigator içindeyse oradan

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);

  const handleLogin = () => {
    console.log('Giriş Yapıldı:', username, password);
    navigation.replace('Home'); // replace: geri gelinmesin
  };

  const handleDietitianLogin = () => {
    console.log('Diyetisyen girişine yönlendir');
    // navigation.navigate('DietitianLogin') olabilir
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Giriş Yap</Text>

      <TextInput
        label="Kullanıcı Adı"
        value={username}
        onChangeText={setUsername}
        mode="outlined"
        style={styles.input}
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

      <Button mode="contained" onPress={handleLogin} style={styles.loginButton}>
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
