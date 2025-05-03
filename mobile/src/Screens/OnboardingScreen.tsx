import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Button } from 'react-native-paper';
import Swiper from 'react-native-swiper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }: Props) => {
  const onLastSlide = () => {
    navigation.replace('Login');
  };

  return (
    <Swiper loop={false} showsButtons={true} onIndexChanged={(index) => {
      if (index === 2) onLastSlide();
    }}>
      <View style={styles.slide}>
        <Text variant="headlineMedium">Diyetisyen Uygulamasına Hoş Geldin!</Text>
        <Text style={styles.description}>
          Bu uygulama senin için! Beslenmeni takip et, hedeflerine ulaşırken yanında olalım.
        </Text>
      </View>
      <View style={styles.slide}>
        <Text variant="headlineMedium">Diyetisyeninle Bağlantı Kur!</Text>
        <Text style={styles.description}>
          Diyetisyeninden aldığın bağlantı kodunu gir.
        </Text>
      </View>
      <View style={styles.slide}>

      </View>
    </Swiper>
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
    padding: 24,
  },
  image: {
    width: 260,
    height: 260,
    marginBottom: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    color: '#F57C00',
  },
  description: {
    textAlign: 'center',
    color: '#333',
    fontSize: 16,
    paddingHorizontal: 12,
  },
  button: {
    marginTop: 30,
  },
});

export default OnboardingScreen;
