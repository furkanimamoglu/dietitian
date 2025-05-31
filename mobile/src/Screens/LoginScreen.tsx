import React, {useState, useEffect} from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
    Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Button, Card, Text, TextInput, useTheme, Surface} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config.js';
import {RootStackParamList} from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({navigation}: Props) => {
    const theme = useTheme();
    const [clientInfo, setClientInfo] = useState({});
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [secure, setSecure] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const errorOpacity = useState(new Animated.Value(0))[0];

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
                // Clear message only after animation fades out
                setErrorMessage(null);
            });
        }
    }, [errorMessage, errorOpacity]); // Include errorOpacity in dependencies

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
                    headers: { 'Content-Type': 'application/json' },
                    validateStatus: () => true,
                }
            );

            console.log(loginResponse)

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


    // handleDietitianLogin is not used in the UI, but keeping it for completeness
    const handleDietitianLogin = () => {
        console.log('Diyetisyen girişine yönlendir');
        // You might want to add navigation logic here if a button existed
    };

    const ErrorMessage = () => {
        // errorMessage is cleared by the useEffect animation sequence
        // The component will render null when errorMessage is null
        if (!errorMessage) return null;

        return (
            <Animated.View style={[styles.errorContainer, { opacity: errorOpacity }]}>
                <Surface style={styles.errorSurface}>
                    <Icon name="alert-circle" size={24} color="#D32F2F" style={styles.errorIcon} />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                    {/* Optional: Remove close button if you want it to only disappear after the animation */}
                    {/* <TouchableOpacity onPress={() => setErrorMessage(null)} style={styles.closeButton}>
                        <Icon name="close" size={20} color="#666" />
                    </TouchableOpacity> */}
                </Surface>
            </Animated.View>
        );
    };


    return (
        <View style={styles.container}>
            {/* Changed StatusBar background to match theme/logo color for consistency */}
            <StatusBar backgroundColor="#F57C00" barStyle="light-content"/>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollView}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.logoContainer}>
                        <Icon name="leaf" size={80} color="#F57C00" style={styles.logo}/>
                        <Text variant="headlineMedium" style={styles.title}>Diyetia</Text>
                        <Text variant="bodyMedium" style={styles.subtitle}>Sağlıklı yaşam yolculuğunuz için</Text>
                    </View>

                    {/* Error Message Component */}
                    <ErrorMessage />

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
                                left={<TextInput.Affix text="+90"/>}
                                style={styles.input}
                                outlineColor="#DDD"
                                activeOutlineColor="#F57C00"
                                textContentType="telephoneNumber"
                                autoComplete="tel"
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
                                        color="#F57C00"
                                    />
                                }
                                mode="outlined"
                                style={styles.input}
                                outlineColor="#DDD"
                                activeOutlineColor="#F57C00"
                                textContentType="password"
                                autoComplete="password"
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
                                disabled={loading || !phone || !password} // Disable if fields are empty or loading
                                style={styles.loginButton}
                                buttonColor="#F57C00"
                                contentStyle={styles.buttonContent}
                                labelStyle={styles.buttonLabel}
                            >
                                Giriş Yap
                            </Button>

                            <View style={styles.orContainer}>
                                <View style={styles.divider}/>
                                <Text style={styles.orText}>veya</Text>
                                <View style={styles.divider}/>
                            </View>

                            <Button
                                mode="outlined"
                                onPress={() => navigation.navigate('Kayitol', {})}
                                style={styles.registerButton}
                                textColor="#F57C00"
                                contentStyle={styles.buttonContent}
                                labelStyle={styles.buttonLabel}
                            >
                                Hesap Oluştur
                            </Button>

                            {/* You might want a button for dietitian login here if needed */}
                            {/* <Button
                                mode="text"
                                onPress={handleDietitianLogin}
                                style={styles.dietitianButton}
                                textColor="#F57C00"
                            >
                                Diyetisyen Girişi
                            </Button> */}
                        </Card.Content>
                    </Card>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>© 2025 Diyetia.com</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff9f2', // Light creamy background
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        paddingBottom: 40, // Added padding bottom
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logo: {
        backgroundColor: 'rgba(245, 124, 0, 0.1)', // Lightened background for icon
        padding: 16,
        borderRadius: 50,
        marginBottom: 16,
        elevation: 2, // Added subtle elevation
    },
    title: {
        textAlign: 'center',
        color: '#F57C00', // Orange color
        fontWeight: '700',
        marginBottom: 4,
    },
    subtitle: {
        textAlign: 'center',
        color: '#777',
        marginBottom: 16,
    },
    errorContainer: {
        width: '100%',
        marginBottom: 16,
        alignItems: 'center',
        // Position absolute if you want it to overlay content,
        // but current placement within ScrollView is fine too.
        // position: 'absolute',
        // top: 20, // Adjust as needed
        // zIndex: 10,
        // paddingHorizontal: 24, // Ensure it aligns with scrollview padding
    },
     errorSurface: {
        width: '100%', // Take full width of container
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE', // Light red background
        borderRadius: 8,
        padding: 12,
        elevation: 1,
        borderLeftWidth: 4,
        borderLeftColor: '#D32F2F', // Darker red border
    },
    errorIcon: {
        marginRight: 10,
    },
    errorText: {
        flex: 1, // Allows text to wrap
        color: '#D32F2F', // Darker red text
        fontSize: 14,
    },
    closeButton: {
        padding: 4, // Make touch area easier
    },
    formCard: {
        borderRadius: 16,
        elevation: 4,
        padding: 8, // Added padding inside card
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    input: {
        marginBottom: 16,
        backgroundColor: '#fff', // Ensure white background
    },
    forgotContainer: {
        alignItems: 'flex-end',
        marginBottom: 20, // Increased margin
    },
    forgotText: {
        color: '#F57C00', // Orange color
        fontSize: 14,
    },
    loginButton: {
        marginBottom: 16,
        borderRadius: 8,
        elevation: 2,
    },
    buttonContent: {
        height: 48, // Set button height
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '600', // Semi-bold
    },
    orContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16, // Vertical margin
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd', // Light grey divider
    },
    orText: {
        paddingHorizontal: 10,
        color: '#777', // Grey text
    },
    registerButton: {
        marginBottom: 16, // Added margin bottom
        borderRadius: 8,
        borderColor: '#F57C00', // Orange border
        borderWidth: 1.5, // Slightly thicker border
    },
    dietitianButton: {
        alignSelf: 'center', // Center the button
        marginTop: 8,
    },
     footer: {
        marginTop: 24,
        alignItems: 'center',
    },
    footerText: {
        color: '#888', // Darker grey
        fontSize: 12,
    },
});

export default LoginScreen;