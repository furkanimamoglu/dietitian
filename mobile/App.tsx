import React, {useEffect, useState} from 'react';
import {BackHandler, ActivityIndicator, View, Platform, Linking, Alert, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {DefaultTheme, NavigationContainer, useNavigationContainerRef} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {PaperProvider, Modal, Portal, Card, Title, Paragraph, Button} from 'react-native-paper';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

import config from './config';
import AnaSayfaScreen from './src/Screens/AnaSayfaScreen';
import LoginScreen from './src/Screens/LoginScreen';
import BeslenmeScreen from './src/Screens/BeslenmeScreen';
import ProfilScreen from './src/Screens/ProfilScreen';
import OdemeScreen from './src/Screens/OdemeScreen';
import EgzersizScreen from './src/Screens/EgzersizScreen';
import TarifScreen from './src/Screens/TarifScreen';
import MesajScreen from './src/Screens/MesajScreen';
import RandevuScreen from './src/Screens/RandevuScreen';
import RaporScreen from './src/Screens/RaporScreen';
import OnboardingScreen from './src/Screens/OnboardingScreen';
import KayitolScreen from './src/Screens/KayitolScreen';
import SifremiUnuttumScreen from './src/Screens/SifremiUnuttumScreen';
import {customLightTheme} from './src/Theme/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    Odeme: undefined;
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
            SifremiUnuttum: 'sifremiunuttum',
            Odeme: 'odeme'
        }
    }
};

const App = () => {
    const paperTheme = customLightTheme;
    const navTheme = DefaultTheme;
    const [isLoading, setIsLoading] = useState(true);
    const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Onboarding');
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    const navigationRef = useNavigationContainerRef();

    useEffect(() => {
        const checkUserSession = async () => {
            try {
                await checkAppVersion();

                const token = await AsyncStorage.getItem('token');
                if (token) {
                    console.log('Token bulundu, hesap durumu kontrol ediliyor...');

                    try {
                        const response = await fetch(
                            `${config[config.environment].apiUrl}/client/getClientInfo`,
                            {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': token
                                }
                            }
                        );

                        const data = await response.json();

                        if (response.ok) {
                            const userStatus = data.status;

                            if (userStatus === 'Aktif') {
                                console.log('Hesap aktif, ana sayfaya yönlendiriliyor');
                                setInitialRoute('AnaSayfa');
                            } else if (userStatus === 'Pasif') {
                                console.log('Hesap pasif durumda, giriş sayfasına yönlendiriliyor');
                                await AsyncStorage.setItem('loginMessage', 'Hesabınız askıya alınmıştır. Lütfen yöneticinizle iletişime geçin.');
                                setInitialRoute('Login');
                            } else {
                                console.log('Hesap durumu belirlenemedi, giriş sayfasına yönlendiriliyor');
                                await AsyncStorage.setItem('loginMessage', 'Hesabınızın durumu belirlenemedi. Lütfen tekrar giriş yapın.');
                                setInitialRoute('Login');
                            }
                        } else {
                            console.log('Kullanıcı bilgisi alınamadı:', data.message);
                            setInitialRoute('Login');
                        }
                    } catch (error) {
                        console.error('Hesap durumu kontrolünde hata:', error);
                        setInitialRoute('Login');
                    }
                } else {
                    console.log('Token bulunamadı, giriş gerekiyor');
                    setInitialRoute('Onboarding');
                }
            } catch (error) {
                console.error('Token kontrolü sırasında hata:', error);
                setInitialRoute('Onboarding');
            } finally {
                setIsLoading(false);
            }
        };

        checkUserSession();
    }, []);

    // Version kontrolü fonksiyonu
    const checkAppVersion = async () => {
        try {
            const response = await fetch(`${config[config.environment].apiUrl}/version`);
            const data = await response.json();

            if (response.ok) {
                const serverVersion = data.version;
                const currentVersion = config.version;

                console.log('Current version:', currentVersion);
                console.log('Server version:', serverVersion);

                if (serverVersion !== currentVersion) {
                    console.log('Version mismatch detected, showing update modal');
                    setShowUpdateModal(true);
                }
            } else {
                console.log('Version check failed:', data.message);
            }
        } catch (error) {
            console.error('Version kontrolünde hata:', error);
        }
    };

    // Notifee için bildirim kanalı oluşturma
    useEffect(() => {
        if (Platform.OS === 'android') {
            createNotificationChannel();
        }
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
        if (Platform.OS === 'android') {
            await notifee.createChannel({
                id: 'default',
                name: 'Varsayılan Kanal',
                lights: true,
                vibration: true,
                importance: AndroidImportance.HIGH,
            });
        }
    }

    // Bildirim gösterme fonksiyonu
    async function showNotification(title, body, data = {}) {
        await notifee.displayNotification({
            title,
            body,
            data,
            android: Platform.OS === 'android' ? {
                channelId: 'default',
                smallIcon: 'ic_launcher',
                importance: AndroidImportance.HIGH,
                pressAction: {
                    id: 'default',
                },
            } : undefined,
        });
    }

    useEffect(() => {
        if (Platform.OS === 'android') {
            const backAction = () => {
                // Güncelleme modalı açıkken geri tuşunu devre dışı bırak
                if (showUpdateModal) {
                    return true;
                }

                if (navigationRef.isReady() && navigationRef.canGoBack()) {
                    navigationRef.goBack();
                    return true;
                }
                return false;
            };
            const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
            return () => backHandler.remove();
        }
    }, [navigationRef, showUpdateModal]);

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
                await AsyncStorage.setItem('fcmToken', fcmToken);
            } else {
                console.log('Failed to get FCM token');
            }
        } catch (error) {
            console.error('Error fetching FCM token:', error);
        }
    };

    const handleUpdateApp = () => {
        // Gerçek uygulama package id'sini kullanın
        const storeUrl = Platform.OS === 'android'
            ? 'https://play.google.com/store/apps/details?id=com.diyetia'
            : 'itms-apps://itunes.apple.com/app/id1234567890';

        Linking.canOpenURL(storeUrl)
            .then(supported => {
                if (supported) {
                    return Linking.openURL(storeUrl);
                } else {
                    // Fallback URL'ler
                    const fallbackUrl = Platform.OS === 'android'
                        ? 'https://play.google.com/store/apps/details?id=com.diyetia'
                        : 'https://apps.apple.com/app/id1234567890';
                    return Linking.openURL(fallbackUrl);
                }
            })
            .catch(err => {
                console.error('Store açılırken hata oluştu:', err);
                Alert.alert(
                    'Hata',
                    'Uygulama mağazası açılamadı. Lütfen manuel olarak güncelleyin.',
                    [{ text: 'Tamam' }]
                );
            });
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <PaperProvider theme={paperTheme}>
            <SafeAreaView style={{flex: 1}}>
                <NavigationContainer
                    ref={navigationRef}
                    theme={navTheme}
                    linking={linking}
                >
                    <Stack.Navigator initialRouteName={initialRoute}>
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
                        <Stack.Screen
                            name="Odeme"
                            component={OdemeScreen}
                            options={{headerShown: false}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>

                <Portal>
                    <Modal
                        visible={showUpdateModal}
                        dismissable={false}
                        contentContainerStyle={styles.modalContainer}
                    >
                        <Card style={{ elevation: 0 }}>
                            <Card.Content style={styles.modalContent}>
                                <Title style={styles.modalTitle}>
                                    🚀 Güncelleme Mevcut
                                </Title>
                                <Paragraph style={styles.modalDescription}>
                                    Uygulamanın yeni bir sürümü mevcut! En son özellikler ve iyileştirmeler için lütfen uygulamanızı güncelleyiniz.
                                </Paragraph>
                                <Paragraph style={styles.modalSubtext}>
                                    Bu güncelleme zorunludur ve devam etmek için gereklidir.
                                </Paragraph>
                            </Card.Content>
                            <Card.Actions style={styles.modalActions}>
                                <Button
                                    mode="contained"
                                    onPress={handleUpdateApp}
                                    style={styles.updateButton}
                                    labelStyle={styles.updateButtonLabel}
                                >
                                    Şimdi Güncelle
                                </Button>
                            </Card.Actions>
                        </Card>
                    </Modal>
                </Portal>
            </SafeAreaView>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 30,
        margin: 20,
        borderRadius: 15,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalContent: {
        alignItems: 'center',
        paddingVertical: 20
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold' as 'bold',
        color: '#2E7D32',
        marginBottom: 15,
        textAlign: 'center' as 'center'
    },
    modalDescription: {
        fontSize: 16,
        textAlign: 'center' as 'center',
        lineHeight: 24,
        color: '#424242',
        marginBottom: 20
    },
    modalSubtext: {
        fontSize: 14,
        textAlign: 'center' as 'center',
        color: '#757575',
        fontStyle: 'italic' as 'italic'
    },
    modalActions: {
        justifyContent: 'center' as 'center',
        paddingTop: 10
    },
    updateButton: {
        backgroundColor: '#2E7D32',
        paddingHorizontal: 30,
        paddingVertical: 8,
        borderRadius: 25
    },
    updateButtonLabel: {
        fontSize: 16,
        fontWeight: 'bold' as 'bold',
        color: 'white'
    }
});

export default App;
