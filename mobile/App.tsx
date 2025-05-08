import React, { useEffect } from 'react';
import { useColorScheme, BackHandler } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  useNavigationContainerRef
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';

import config from './config';
import AnaSayfaScreen from './src/Screens/AnaSayfaScreen';
import LoginScreen from './src/Screens/LoginScreen';
import BeslenmeScreen from './src/Screens/BeslenmeScreen';
import ProfilScreen from './src/Screens/ProfilScreen';
import EgzersizScreen from './src/Screens/EgzersizScreen';
import TarifScreen from './src/Screens/TarifScreen';
import MesajScreen from './src/Screens/MesajScreen';
import RandevuScreen from './src/Screens/RandevuScreen';
import RaporScreen from './src/Screens/RaporScreen';
import OnboardingScreen from './src/Screens/OnboardingScreen';
import KayitolScreen from './src/Screens/KayitolScreen';
import { customDarkTheme, customLightTheme } from './src/Theme/theme';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Tarif: undefined;
  Egzersiz: undefined;
  Profil: undefined;
  Beslenme: undefined;
  Randevu: undefined;
  Rapor: undefined;
  AnaSayfa: undefined;
  Mesaj: undefined;
  Kayitol: { dietitian_id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking = {
  prefixes: [
    `${config.app_scheme}://`,
    config.base_url
  ],
  config: {
    screens: {
      Kayitol: 'register',
      Onboarding: 'onboarding',
      Login: 'login',
      Tarif: 'tarif',
      Egzersiz: 'egzersiz',
      Profil: 'profil',
      Beslenme: 'beslenme',
      Randevu: 'randevu',
      Rapor: 'rapor',
      AnaSayfa: 'anasayfa',
      Mesaj: 'mesaj'
    }
  }
};

const App = () => {
  const colorScheme = useColorScheme();
  const paperTheme = colorScheme === 'dark' ? customDarkTheme : customLightTheme;
  const navTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    const backAction = () => {
      if (navigationRef.isReady() && navigationRef.canGoBack()) {
        navigationRef.goBack();
        return true;
      }
      return false;
    };

    const backHandler =
      BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [navigationRef]);

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer
        ref={navigationRef}
        theme={navTheme}
        linking={linking}
      >
        <Stack.Navigator initialRouteName="Onboarding">
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Tarif"
            component={TarifScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Egzersiz"
            component={EgzersizScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Profil"
            component={ProfilScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Beslenme"
            component={BeslenmeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Randevu"
            component={RandevuScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Rapor"
            component={RaporScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AnaSayfa"
            component={AnaSayfaScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Mesaj"
            component={MesajScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Kayitol"
            component={KayitolScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
