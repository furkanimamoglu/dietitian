import React from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import Swiper from 'react-native-swiper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }: Props) => {
  const goToLogin = () => {
    navigation.replace('Login');
  };

  return (
    <Swiper
      loop={false}
      showsButtons={false}
      dotStyle={styles.dot}
      activeDotStyle={styles.activeDot}
    >
      {/* Slide 1 */}
      <View style={styles.slide}>
        <Icon name="food-apple-outline" size={96} color="#F57C00" style={{ marginBottom: 24 }} />
        <Text style={styles.title}>Hoş Geldin!</Text>
        <Text style={styles.description}>
          Bu uygulama sayesinde beslenmeni kolayca takip edebilir, öğünlerini planlayabilir ve hedeflerine ulaşırken rehberlik alabilirsin.
        </Text>
      </View>

      {/* Slide 2 */}
      <View style={styles.slide}>
        <Icon name="qrcode-scan" size={96} color="#F57C00" style={{ marginBottom: 24 }} />
        <Text style={styles.title}>Diyetisyeninle Bağlantı Kur</Text>
        <Text style={styles.description}>
          Başlamak için diyetisyeninden QR kodunu al ve uygulamaya okut. Planın ve takibin otomatik olarak yüklenecek.
        </Text>
      </View>

      {/* Slide 3 */}
      <View style={styles.slide}>
        <Icon name="check-circle-outline" size={96} color="#F57C00" style={{ marginBottom: 24 }} />
        <Text style={styles.title}>Hazırsan Başlayalım!</Text>
        <Text style={styles.description}>
          Sağlıklı yaşama bir adım daha yaklaşmak için devam et.
        </Text>
        <Button mode="contained" onPress={goToLogin} style={styles.button}>
          Başla
        </Button>
      </View>
    </Swiper>
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    width,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F57C00',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 32,
    borderRadius: 20,
  },
  dot: {
    backgroundColor: '#FFE082',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: '#F57C00',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default OnboardingScreen;
