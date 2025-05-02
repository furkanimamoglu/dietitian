import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Appbar, PaperProvider } from 'react-native-paper';

import HomeScreen from './src/Screens/HomeScreen';
import LoginScreen from './src/Screens/LoginScreen';
import OnboardingScreen from './src/Screens/OnboardingScreen';
import { customDarkTheme, customLightTheme } from './src/Theme/theme.ts';

export type RootStackParamList = {
  Home: undefined;
  Detail: { info: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const colorScheme = useColorScheme();
  const paperTheme = colorScheme === 'dark' ? customDarkTheme : customLightTheme;
  const navTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator initialRouteName="Onboarding">
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
