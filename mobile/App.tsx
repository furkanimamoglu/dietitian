import React, {useEffect} from 'react';
import {BackHandler, SafeAreaView} from 'react-native';
import {DefaultTheme, NavigationContainer, useNavigationContainerRef} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {PaperProvider} from 'react-native-paper';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

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
import SifremiUnuttumScreen from './src/Screens/SifremiUnuttumScreen';
import {customLightTheme} from './src/Theme/theme';

import messaging from '@react-native-firebase/messaging';

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
    SifremiUnuttum: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking = {
    prefixes: [
        `${config[config.environment].app_scheme}://`,
        config[config.environment].apiUrl
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
            Mesaj: 'mesaj',
            SifremiUnuttum: 'sifremiunuttum'
        }
    }
};

const App = () => {
    const paperTheme = customLightTheme;
    const navTheme = DefaultTheme;

    const navigationRef = useNavigationContainerRef();

    // Notifee için bildirim kanalı oluşturma
    useEffect(() => {
        createNotificationChannel();

        // Notifee olaylarını dinleme
        return notifee.onForegroundEvent(({ type, detail }) => {
            switch (type) {
                case EventType.DISMISSED:
                    console.log('Kullanıcı bildirimi kapadı');
                    break;
                case EventType.PRESS:
                    console.log('Kullanıcı bildirime tıkladı', detail.notification);
                    break;
            }
        });
    }, []);

    // Bildirim kanalı oluşturma fonksiyonu
    async function createNotificationChannel() {
        await notifee.createChannel({
            id: 'default',
            name: 'Varsayılan Kanal',
            lights: true,
            vibration: true,
            importance: AndroidImportance.HIGH,
        });
    }

    // Bildirim gösterme fonksiyonu
    async function showNotification(title, body, data = {}) {
        await notifee.displayNotification({
            title,
            body,
            data,
            android: {
                channelId: 'default',
                smallIcon: 'ic_launcher',
                importance: AndroidImportance.HIGH,
                pressAction: {
                    id: 'default',
                },
            },
        });
    }

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

    useEffect(() => {
        requestUserPermission();

        // Uygulama açıkken gelen bildirimler (ön plan bildirimleri)
        const unsubscribe = messaging().onMessage(async remoteMessage => {
            const title = remoteMessage.notification?.title || 'Yeni Bildirim';
            const body = remoteMessage.notification?.body || '';

            // Alert yerine Notifee kullanarak bildirim gösterme
            await showNotification(title, body, remoteMessage.data || {});
        });

        // Handle background state tap
        messaging().onNotificationOpenedApp(remoteMessage => {
            console.log('Notification opened from background state:', remoteMessage.notification);
        });

        // Handle quit state tap
        messaging().getInitialNotification().then(remoteMessage => {
            if (remoteMessage) {
                console.log('Notification caused app to open from quit state:', remoteMessage.notification);
            }
        });

        return unsubscribe;
    }, []);

    const requestUserPermission = async () => {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('Notification permission status:', authStatus);
            getFcmToken();
        }
    };

    const getFcmToken = async () => {
        try {
            const fcmToken = await messaging().getToken();
            if (fcmToken) {
                console.log('FCM Token:', fcmToken);
                // You can store this token in your backend/database
            } else {
                console.log('Failed to get FCM token');
            }
        } catch (error) {
            console.error('Error fetching FCM token:', error);
        }
    };

    return (
        <PaperProvider theme={paperTheme}>
            <SafeAreaView style={{flex: 1}}>
                <NavigationContainer
                    ref={navigationRef}
                    theme={navTheme}
                    linking={linking}
                >
                    <Stack.Navigator initialRouteName="Onboarding">
                        <Stack.Screen
                            name="Onboarding"
                            component={OnboardingScreen}
                            options={{headerShown: false}}
                        />
                        <Stack.Screen
                            name="Login"
                            component={LoginScreen}
                            options={{headerShown: false}}
                        />
                        <Stack.Screen
                            name="Tarif"
                            component={TarifScreen}
                            options={{headerShown: false}}
                        />
                        <Stack.Screen
                            name="Egzersiz"
                            component={EgzersizScreen}
                            options={{headerShown: false}}
                        />
                        <Stack.Screen
                            name="Profil"
                            component={ProfilScreen}
                            options={{headerShown: false}}
                        />
                        <Stack.Screen
                            name="Beslenme"
                            component={BeslenmeScreen}
                            options={{headerShown: false}}
                        />
                        <Stack.Screen
                            name="Randevu"
                            component={RandevuScreen}
                            options={{headerShown: false}}
                        />
                        <Stack.Screen
                            name="Rapor"
                            component={RaporScreen}
                            options={{headerShown: false}}
                        />
                        <Stack.Screen
                            name="AnaSayfa"
                            component={AnaSayfaScreen}
                            options={{headerShown: false}}
                        />
                        <Stack.Screen
                            name="Mesaj"
                            component={MesajScreen}
                            options={{headerShown: false}}
                        />
                        <Stack.Screen
                            name="Kayitol"
                            component={KayitolScreen}
                            options={{headerShown: false}}
                        />
                        <Stack.Screen
                            name="SifremiUnuttum"
                            component={SifremiUnuttumScreen}
                            options={{headerShown: false}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </SafeAreaView>
        </PaperProvider>
    );
};

export default App;
