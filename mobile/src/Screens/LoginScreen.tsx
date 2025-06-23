import React, {useEffect, useState, useRef} from 'react';
import {
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
    Image,
    Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Button, Card, Surface, Text, TextInput, useTheme} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config.js';
import {RootStackParamList} from '../App';
import LinearGradient from 'react-native-linear-gradient';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({navigation}: Props) => {
    const theme = useTheme();
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [secure, setSecure] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [showKVKKModal, setShowKVKKModal] = useState<boolean>(false);
    const [showUserAgreementModal, setShowUserAgreementModal] = useState<boolean>(false);

    const errorOpacity = useState(new Animated.Value(0))[0];
    const formTranslateY = useRef(new Animated.Value(30)).current;
    const formOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(formOpacity, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true
            }),
            Animated.timing(formTranslateY, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true
            }),
            Animated.timing(logoScale, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true
            })
        ]).start();
    }, []);

    useEffect(() => {
        if (errorMessage) {
            Animated.sequence([
                Animated.timing(errorOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                }),
                Animated.delay(5000),
                Animated.timing(errorOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true
                })
            ]).start(() => {
                setErrorMessage(null);
            });
        }
    }, [errorMessage, errorOpacity]);

    const handleChange = (text: string) => {
        const digits = text.replace(/[^0-9]/g, "").slice(0, 10);
        setPhone(digits);
    };

    const handleLogin = async () => {
        try {
            setLoading(true);
            setErrorMessage(null);

            const loginResponse = await axios.post(
                `${config[config.environment].apiUrl}/client/login`,
                {
                    phoneNumber: phone,
                    password: password,
                },
                {
                    headers: {'Content-Type': 'application/json'},
                    validateStatus: () => true,
                }
            );

            if (loginResponse.status !== 200) {
                if (loginResponse.status === 400) {
                    throw new Error(loginResponse.data.message);
                }
                throw new Error(loginResponse.data?.message || 'Giriş başarısız.');
            }

            const token = loginResponse.data.token;
            if (!token) {
                throw new Error('Giriş başarılı ancak token alınamadı.');
            }

            const bearerToken = `Bearer ${token}`;
            await AsyncStorage.setItem('token', bearerToken);
            const fcmToken = await AsyncStorage.getItem('fcmToken');

            if (fcmToken) {
                try {
                    await axios.put(
                        `${config[config.environment].apiUrl}/client/updateFCMToken`,
                        {
                            fcmToken: fcmToken
                        },
                        {
                            headers: {
                                Authorization: bearerToken,
                                'Content-Type': 'application/json',
                            },
                            validateStatus: () => true,
                        }
                    );
                } catch (error) {
                    console.log('FCM token güncellenirken hata:', error);
                }
            }

            const clientResponse = await axios.get(
                `${config[config.environment].apiUrl}/client/getClientInfo`,
                {
                    headers: {
                        Authorization: bearerToken,
                        'Content-Type': 'application/json',
                    },
                    validateStatus: () => true,
                }
            );

            if (clientResponse.status !== 200) {
                throw new Error(clientResponse.data?.message || 'Kullanıcı bilgileri alınamadı.');
            }

            const userStatus = clientResponse.data.status;

            if (userStatus === 'Aktif') {
                navigation.replace('AnaSayfa');
            } else if (userStatus === 'Pasif') {
                setErrorMessage('Hesabınız askıya alınmıştır. Lütfen yöneticinizle iletişime geçin.');
            } else {
                setErrorMessage('Hesap durumu belirlenemedi. Lütfen diyetisyeninizle iletişime geçin.');
            }

        } catch (error) {
            const errorMsg = error.message || 'Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.';
            setErrorMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const checkLoginMessage = async () => {
            try {
                const message = await AsyncStorage.getItem('loginMessage');
                if (message) {
                    setErrorMessage(message);
                    await AsyncStorage.removeItem('loginMessage');
                }
            } catch (error) {
                console.error('Hata mesajı kontrolünde hata:', error);
            }
        };

        checkLoginMessage();
    }, []);

    const ErrorMessage = () => {
        if (!errorMessage) return null;

        return (
            <Animated.View style={[styles.errorContainer, {opacity: errorOpacity}]}>
                <Surface style={styles.errorSurface}>
                    <Icon name="alert-circle" size={24} color="#D32F2F" style={styles.errorIcon}/>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                </Surface>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#FF6B00" barStyle="light-content"/>

            {/* Gradient Arka Plan */}
            <LinearGradient
                colors={['#FF8E53', '#FF6B00']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.gradient}
            />

            {/* Arka Plan Desen Efekti */}
            <View style={styles.patternOverlay} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollView}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo ve Başlık Bölümü */}
                    <Animated.View style={[styles.logoContainer, {transform: [{scale: logoScale}]}]}>
                        <View style={styles.logoCircle}>
                            <Icon name="leaf" size={60} color="#FFFFFF" style={styles.logo}/>
                        </View>
                        <Text variant="headlineLarge" style={styles.title}>Diyetia</Text>
                        <Text variant="bodyMedium" style={styles.subtitle}>Sağlıklı yaşam yolculuğunuz için</Text>
                    </Animated.View>

                    {/* Hata Mesajı */}
                    <ErrorMessage/>

                    {/* Form Kartı */}
                    <Animated.View
                        style={[
                            {opacity: formOpacity, transform: [{translateY: formTranslateY}]}
                        ]}
                    >
                        <Card style={styles.formCard}>
                            <Card.Content>
                                <Text style={styles.formTitle}>Hesabınıza Giriş Yapın</Text>

                                <TextInput
                                    label="Telefon"
                                    mode="outlined"
                                    value={phone}
                                    onChangeText={handleChange}
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    placeholder="5xxxxxxxxx"
                                    left={<TextInput.Affix text="+90"/>}
                                    style={styles.input}
                                    outlineColor="#DDD"
                                    activeOutlineColor="#FF6B00"
                                    textContentType="telephoneNumber"
                                    autoComplete="tel"
                                    theme={{ roundness: 12 }}
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
                                            color="#FF6B00"
                                        />
                                    }
                                    mode="outlined"
                                    style={styles.input}
                                    outlineColor="#DDD"
                                    activeOutlineColor="#FF6B00"
                                    textContentType="password"
                                    autoComplete="password"
                                    theme={{ roundness: 12 }}
                                />

                                <TouchableOpacity
                                    onPress={() => navigation.navigate('SifremiUnuttum', undefined)}
                                    style={styles.forgotContainer}
                                >
                                    <Text style={styles.forgotText}>Şifremi unuttum?</Text>
                                </TouchableOpacity>

                                <Button
                                    mode="contained"
                                    onPress={handleLogin}
                                    loading={loading}
                                    disabled={loading || !phone || !password}
                                    style={styles.loginButton}
                                    buttonColor="#FF6B00"
                                    contentStyle={styles.buttonContent}
                                    labelStyle={styles.buttonLabel}
                                >
                                    {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                                </Button>

                                <View style={styles.orContainer}>
                                    <View style={styles.divider}/>
                                    <Text style={styles.orText}>veya</Text>
                                    <View style={styles.divider}/>
                                </View>

                                {/* <Button
                                    mode="outlined"
                                    onPress={() => navigation.navigate('Kayitol', {})}
                                    style={styles.registerButton}
                                    textColor="#FF6B00"
                                    contentStyle={styles.buttonContent}
                                    labelStyle={styles.buttonLabel}
                                >
                                    Yeni Hesap Oluştur
                                </Button> */}

                                <Text style={styles.infoText}>
                                    Diyetisyeninizden size hesap oluşturmasını isteyebilirsiniz.
                                </Text>
                            </Card.Content>
                        </Card>
                    </Animated.View>

                    <View style={styles.footer}>
                        <View style={styles.legalLinksContainer}>
                            <TouchableOpacity onPress={() => setShowKVKKModal(true)}>
                                <Text style={styles.legalText}>Gizlilik Politikası</Text>
                            </TouchableOpacity>
                            <Text style={styles.legalSeparator}>•</Text>
                            <TouchableOpacity onPress={() => setShowUserAgreementModal(true)}>
                                <Text style={styles.legalText}>Kullanıcı Sözleşmesi</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.footerText}>© 2025 Diyetia.com</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* KVKK Aydınlatma Metni Modal'ı */}
            <Modal
                visible={showKVKKModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowKVKKModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Gizlilik Politikası</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalText}>
                                6698 sayılı Kişisel Verilerin Korunması Kanunu (“Kanun”) uyarınca, kişisel verilerinizin korunması
                                ve işlenmesi hususunda bilgilendirilmektesiniz. Diyetia olarak, kişisel verilerinizi koruma
                                ve gizliliğinizi sağlama konusuna büyük önem vermekteyiz.
                            </Text>
                            <Text style={styles.modalText}>
                                Kişisel verileriniz, sunduğumuz hizmetlerin daha iyi bir şekilde ifası, sizlere daha iyi
                                hizmet verebilmek amacıyla işlenmektedir. Kişisel verilerinizin işlenme amacı ve kapsamı
                                hakkında detaylı bilgiye sahip olmak için lütfen Aydınlatma Metni'mizi inceleyiniz.
                            </Text>
                        </ScrollView>
                        <Button
                            mode="contained"
                            onPress={() => setShowKVKKModal(false)}
                            style={styles.modalButton}
                            buttonColor="#FF6B00"
                            labelStyle={styles.buttonLabel}
                        >
                            Kapat
                        </Button>
                    </View>
                </View>
            </Modal>

            {/* Kullanıcı Sözleşmesi Modal'ı */}
            <Modal
                visible={showUserAgreementModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowUserAgreementModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Kullanıcı Sözleşmesi</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalText}>
                                İşbu kullanıcı sözleşmesi (“Sözleşme”), Diyetia uygulaması (“Uygulama”) ile
                                kullanıcı arasında akdedilmiştir. Uygulama’yı kullanarak işbu Sözleşme’yi kabul
                                ettiğinizi beyan etmektesiniz.
                            </Text>
                            <Text style={styles.modalText}>
                                Uygulama, kullanıcıların sağlıklı yaşam ve diyet süreçlerini yönetmelerine yardımcı
                                olmak amacıyla hazırlanmış bir mobil uygulamadır. Uygulama’nın sunduğu hizmetlerden
                                yararlanabilmek için öncelikle üye olmanız gerekmektedir.
                            </Text>
                            <Text style={styles.modalText}>
                                Üyelik işlemleri sırasında verdiğiniz kişisel verileriniz, yalnızca üyelik işlemlerinin
                                gerçekleştirilmesi ve Uygulama’nın sunduğu hizmetlerin ifası amacıyla kullanılacaktır.
                                Kişisel verilerinizin korunması ve işlenmesi hakkında detaylı bilgi için lütfen
                                Aydınlatma Metni'mizi inceleyiniz.
                            </Text>
                        </ScrollView>
                        <Button
                            mode="contained"
                            onPress={() => setShowUserAgreementModal(false)}
                            style={styles.modalButton}
                            buttonColor="#FF6B00"
                            labelStyle={styles.buttonLabel}
                        >
                            Kapat
                        </Button>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    gradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: height * 0.5,
    },
    patternOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: height * 0.5,
        backgroundColor: 'rgba(255,255,255,0.05)',
        opacity: 0.8
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        padding: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 36,
    },
    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.30,
        shadowRadius: 10,
        elevation: 8,
    },
    logo: {
        padding: 10,
    },
    title: {
        textAlign: 'center',
        color: '#ffffff',
        fontWeight: '700',
        marginBottom: 4,
        fontSize: 36,
        letterSpacing: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: {width: 0, height: 2},
        textShadowRadius: 3,
    },
    subtitle: {
        textAlign: 'center',
        color: '#ffffff',
        fontSize: 16,
        opacity: 0.9
    },
    formTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center'
    },
    errorContainer: {
        width: '100%',
        marginBottom: 20,
        alignItems: 'center',
    },
    errorSurface: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        borderRadius: 12,
        padding: 14,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: '#D32F2F',
        shadowColor: "#D32F2F",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    errorIcon: {
        marginRight: 10,
    },
    errorText: {
        flex: 1,
        color: '#D32F2F',
        fontSize: 14,
        fontWeight: '500'
    },
    formCard: {
        borderRadius: 20,
        elevation: 8,
        padding: 8,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        marginBottom: 16
    },
    input: {
        marginBottom: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        fontSize: 16,
    },
    forgotContainer: {
        alignItems: 'flex-end',
        marginBottom: 20,
        marginTop: -5
    },
    forgotText: {
        color: '#FF6B00',
        fontSize: 14,
        fontWeight: '500',
    },
    loginButton: {
        marginBottom: 5,
        borderRadius: 12,
        elevation: 3,
        shadowColor: "#FF6B00",
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        paddingVertical: 5
    },
    buttonContent: {
        height: 52,
        paddingVertical: 8,
        paddingHorizontal: 16
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
        lineHeight: 16
    },
    orContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    orText: {
        paddingHorizontal: 14,
        color: '#777',
        fontWeight: '500'
    },
    registerButton: {
        marginBottom: 16,
        borderRadius: 12,
        borderColor: '#FF6B00',
        borderWidth: 1.5,
    },
    footer: {
        marginTop: 5,
        alignItems: 'center',
    },
    footerText: {
        color: '#555',
        fontSize: 12,
        fontWeight: '500'
    },
    legalLinksContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    legalText: {
        color: '#FF6B00',
        fontSize: 14,
        fontWeight: '500',
    },
    legalSeparator: {
        color: '#777',
        fontSize: 14,
        fontWeight: '500',
        paddingHorizontal: 8,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
        textAlign: 'center',
        color: '#333',
    },
    modalText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#555',
        marginBottom: 16,
    },
    modalButton: {
        borderRadius: 12,
        paddingVertical: 10,
        elevation: 3,
    },
    infoText: {
        color: '#555',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 16,
        paddingHorizontal: 10,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEE',
        borderRadius: 12,
        padding: 12,
        marginTop: 8,
        elevation: 2,
    },
    infoIcon: {
        marginRight: 10,
    },
});

export default LoginScreen;

