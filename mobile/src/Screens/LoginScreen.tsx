// src/screens/LoginScreen.tsx
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
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [secure, setSecure] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const errorOpacity = useState(new Animated.Value(0))[0];

    useEffect(() => {
        if (errorMessage) {
            // Animate error message appearance
            Animated.sequence([
                Animated.timing(errorOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                }),
                Animated.delay(5000), // Show error for 5 seconds
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
            
            // Handle config indexing safely
            const env = config.environment as keyof typeof config;
            if (typeof config[env] === 'object' && 'apiUrl' in config[env]) {
                const apiUrl = (config[env] as { apiUrl: string }).apiUrl;
                
                const response = await axios.post(`${apiUrl}/client/login`, {
                    phoneNumber: phone,
                    password: password,
                });
                
                const token = response.data?.token;
                if (!token) throw new Error('Token alınamadı.');
                await AsyncStorage.setItem('token', `Bearer ${token}`);
                navigation.replace('AnaSayfa');
            } else {
                throw new Error('API URL bulunamadı');
            }
        } catch (error: any) {
            const errorMsg = error?.response?.data?.message || 
                             error?.message || 
                             'Bilinmeyen hata oluştu';
            setErrorMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDietitianLogin = () => {
        console.log('Diyetisyen girişine yönlendir');
    };

    const ErrorMessage = () => {
        if (!errorMessage) return null;
        
        return (
            <Animated.View style={[styles.errorContainer, { opacity: errorOpacity }]}>
                <Surface style={styles.errorSurface}>
                    <Icon name="alert-circle" size={24} color="#D32F2F" style={styles.errorIcon} />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                    <TouchableOpacity onPress={() => setErrorMessage(null)} style={styles.closeButton}>
                        <Icon name="close" size={20} color="#666" />
                    </TouchableOpacity>
                </Surface>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
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
                                disabled={loading}
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
        backgroundColor: '#fff9f2',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        paddingBottom: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logo: {
        backgroundColor: 'rgba(245, 124, 0, 0.1)',
        padding: 16,
        borderRadius: 50,
        marginBottom: 16,
        elevation: 2,
    },
    title: {
        textAlign: 'center',
        color: '#F57C00',
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
    },
    errorSurface: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        borderRadius: 8,
        padding: 12,
        elevation: 1,
        borderLeftWidth: 4,
        borderLeftColor: '#D32F2F',
    },
    errorIcon: {
        marginRight: 10,
    },
    errorText: {
        flex: 1,
        color: '#D32F2F',
        fontSize: 14,
    },
    closeButton: {
        padding: 4,
    },
    formCard: {
        borderRadius: 16,
        elevation: 4,
        padding: 8,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    input: {
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    forgotContainer: {
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    forgotText: {
        color: '#F57C00',
        fontSize: 14,
    },
    loginButton: {
        marginBottom: 16,
        borderRadius: 8,
        elevation: 2,
    },
    buttonContent: {
        height: 48,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '600',
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
        paddingHorizontal: 10,
        color: '#777',
    },
    registerButton: {
        marginBottom: 16,
        borderRadius: 8,
        borderColor: '#F57C00',
        borderWidth: 1.5,
    },
    dietitianButton: {
        alignSelf: 'center',
        marginTop: 8,
    },
    footer: {
        marginTop: 24,
        alignItems: 'center',
    },
    footerText: {
        color: '#888',
        fontSize: 12,
    },
});

export default LoginScreen;
