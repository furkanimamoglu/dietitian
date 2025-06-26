import React, {useEffect, useState, useRef} from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
    Animated,
    Dimensions
} from 'react-native';
import {ActivityIndicator, Button, Card, RadioButton, Text, TextInput, useTheme, Surface} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import config from '../../config';
import LinearGradient from 'react-native-linear-gradient';

type RootStackParamList = {
    Kayitol: { dietitian_id: string };
    AnaSayfa: undefined;
};

type KayitolRouteProp = RouteProp<RootStackParamList, 'Kayitol'>;

const {width: windowWidth} = Dimensions.get('window');

const KayitolScreen: React.FC = () => {
    const theme = useTheme();
    const route = useRoute<KayitolRouteProp>();
    const navigation = useNavigation<any>();
    const dietitianId = route.params?.dietitian_id || '';

    const [name, setName] = useState('');
    const [dietitianCode, setDietitianCode] = useState(dietitianId);
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [mail, setMail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [securePassword, setSecurePassword] = useState(true);
    const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);

    const [nameError, setNameError] = useState('');
    const [mailError, setMailError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [dietitianCodeError, setDietitianCodeError] = useState('');
    const [genderError, setGenderError] = useState('');
    const [ageError, setAgeError] = useState('');

    const [dietitianName, setDietitianName] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingDietitian, setFetchingDietitian] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const errorOpacity = useState(new Animated.Value(0))[0];
    const formTranslateY = useRef(new Animated.Value(30)).current;
    const formOpacity = useRef(new Animated.Value(0)).current;
    const headerScale = useRef(new Animated.Value(0.8)).current;
    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const checkUserToken = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (token) {
                    navigation.replace('AnaSayfa');
                }
            } catch (error) {
                console.error('Token kontrolü sırasında hata:', error);
            }
        };

        checkUserToken();
    }, [navigation]);

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
            Animated.timing(headerScale, {
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

    useEffect(() => {
        if (dietitianId) {
            handleDietitianFetch(dietitianId);
        }
    }, [dietitianId]);

    const handleChange = (text: string) => {
        const digits = text.replace(/[^0-9]/g, "").slice(0, 10);
        setPhone(digits);
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleDietitianFetch = async (id: string) => {
        if (!id || id.length < 1) {
            setDietitianName('');
            return;
        }
        setFetchingDietitian(true);
        try {
            const response = await fetch(
                `${config[config.environment].apiUrl}/dietitian/getDietitianNameById?dietitian_id=${id}`
            );
            const data = await response.json();
            setDietitianName(typeof data === 'string' ? data : data.dietitian_name);
        } catch (error) {
            setDietitianName('');
            Alert.alert('Hata', 'Diyetisyen bulunamadı');
        } finally {
            setFetchingDietitian(false);
        }
    };

    const validateForm = () => {
        let isValid = true;

        setNameError('');
        setPhoneError('');
        setMailError('');
        setPasswordError('');
        setConfirmPasswordError('');
        setDietitianCodeError('');
        setGenderError('');
        setAgeError('');

        if (!name.trim()) {
            setNameError('Lütfen isminizi girin');
            isValid = false;
        }

        if (phone.length < 10) {
            setPhoneError('Lütfen geçerli bir telefon numarası girin');
            isValid = false;
        }

        if (!gender) {
            setGenderError('Lütfen cinsiyet seçin');
            isValid = false;
        }

        if (!mail) {
            setMailError('Lütfen mail adresinizi girin');
            isValid = false;
        }

        if (password.length < 6) {
            setPasswordError('Şifre en az 6 karakter olmalıdır');
            isValid = false;
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError('Şifreler eşleşmiyor');
            isValid = false;
        }

        if (!dietitianCode) {
            setDietitianCodeError('Lütfen diyetisyen kodunu girin');
            isValid = false;
        }

        if (!age) {
            setAgeError('Lütfen yaşınızı girin');
            isValid = false;
        } else if (isNaN(Number(age)) || Number(age) <= 0) {
            setAgeError('Geçerli bir yaş girin');
            isValid = false;
        }

        return isValid;
    };

    const handleRegister = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `${config[config.environment].apiUrl}/client/register`,
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        phoneNumber: parseInt(phone),
                        email: mail,
                        password: password,
                        name: name,
                        gender: gender,
                        dietitian_id: parseInt(dietitianCode),
                        age: parseInt(age),
                    })
                }
            );
            const data = await response.json();
            if (response.ok) {
                await AsyncStorage.setItem('token', `Bearer ${data.token}`);
                await navigation.navigate('AnaSayfa');
            } else {
                setErrorMessage(data.message || 'Kayıt başarısız.');
            }
        } catch (error) {
            setErrorMessage('Sunucuya bağlanılamadı.');
            console.error(error);
        } finally {
            setLoading(false);
        }
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
                <Animated.ScrollView
                    contentContainerStyle={styles.scrollView}
                    keyboardShouldPersistTaps="handled"
                    scrollEventThrottle={16}
                    onScroll={Animated.event(
                        [{nativeEvent: {contentOffset: {y: scrollY}}}],
                        {useNativeDriver: true}
                    )}
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-left" size={24} color="#FFFFFF"/>
                    </TouchableOpacity>

                    {/* Header Bölümü */}
                    <Animated.View style={[styles.headerContainer, {transform: [{scale: headerScale}]}]}>
                        <View style={styles.iconCircle}>
                            <Icon name="account-plus" size={60} color="#FFFFFF" style={styles.headerIcon}/>
                        </View>
                        <Text variant="headlineLarge" style={styles.header}>Hesap Oluştur</Text>
                        <Text variant="bodyMedium" style={styles.subheader}>Diyetia'ya hoş geldiniz</Text>
                    </Animated.View>

                    {/* Hata mesajı animasyonu */}
                    {errorMessage && (
                        <Animated.View style={[styles.errorMessageContainer, {opacity: errorOpacity}]}>
                            <Surface style={styles.errorSurface}>
                                <Icon name="alert-circle" size={24} color="#D32F2F" style={styles.errorIcon}/>
                                <Text style={styles.errorMessage}>{errorMessage}</Text>
                            </Surface>
                        </Animated.View>
                    )}

                    {/* Form Kartı - Animasyonlu */}
                    <Animated.View style={{
                        opacity: formOpacity,
                        transform: [{translateY: formTranslateY}]
                    }}>
                        <Card style={styles.formCard}>
                            <Card.Content>
                                <Text style={styles.formTitle}>Kişisel Bilgileriniz</Text>

                                <TextInput
                                    label="İsim Soyisim"
                                    mode="outlined"
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                    style={styles.input}
                                    outlineColor={nameError ? "#FF0000" : "#DDD"}
                                    activeOutlineColor={nameError ? "#FF0000" : "#FF6B00"}
                                    left={<TextInput.Icon icon="account" color="#AAA"/>}
                                    theme={{ roundness: 12 }}
                                />
                                {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

                                <TextInput
                                    label="Email"
                                    mode="outlined"
                                    value={mail}
                                    onChangeText={(text) => {
                                        setMail(text);
                                        if (text && !validateEmail(text)) {
                                            setMailError('Geçerli bir e-posta giriniz.');
                                        } else {
                                            setMailError('');
                                        }
                                    }}
                                    style={styles.input}
                                    outlineColor={mailError ? "#FF0000" : "#DDD"}
                                    activeOutlineColor={mailError ? "#FF0000" : "#FF6B00"}
                                    left={<TextInput.Icon icon="email" color="#AAA"/>}
                                    theme={{ roundness: 12 }}
                                />
                                {mailError ? <Text style={styles.errorText}>{mailError}</Text> : null}

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
                                    outlineColor={phoneError ? "#FF0000" : "#DDD"}
                                    activeOutlineColor={phoneError ? "#FF0000" : "#FF6B00"}
                                    theme={{ roundness: 12 }}
                                />
                                {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

                                <Text style={styles.sectionLabel}>Cinsiyet</Text>
                                <RadioButton.Group onValueChange={newValue => setGender(newValue)} value={gender}>
                                    <View style={styles.radioGroup}>
                                        <View style={styles.radioOption}>
                                            <RadioButton value="Erkek" color="#FF6B00"/>
                                            <Text>Erkek</Text>
                                        </View>

                                        <View style={styles.radioOption}>
                                            <RadioButton value="Kadın" color="#FF6B00"/>
                                            <Text>Kadın</Text>
                                        </View>

                                        <View style={styles.radioOption}>
                                            <RadioButton value="Diğer" color="#FF6B00"/>
                                            <Text>Diğer</Text>
                                        </View>
                                    </View>
                                </RadioButton.Group>
                                {genderError ? <Text style={styles.errorText}>{genderError}</Text> : null}

                                <TextInput
                                    label="Yaş"
                                    mode="outlined"
                                    value={age}
                                    onChangeText={setAge}
                                    keyboardType="number-pad"
                                    style={styles.input}
                                    outlineColor={ageError ? "#FF0000" : "#DDD"}
                                    activeOutlineColor={ageError ? "#FF0000" : "#FF6B00"}
                                    left={<TextInput.Icon icon="cake-variant" color="#AAA"/>}
                                    theme={{ roundness: 12 }}
                                />
                                {ageError ? <Text style={styles.errorText}>{ageError}</Text> : null}

                                <Text style={styles.formTitle}>Güvenlik Bilgileri</Text>

                                <TextInput
                                    label="Şifre"
                                    mode="outlined"
                                    secureTextEntry={securePassword}
                                    value={password}
                                    onChangeText={setPassword}
                                    style={styles.input}
                                    outlineColor={passwordError ? "#FF0000" : "#DDD"}
                                    activeOutlineColor={passwordError ? "#FF0000" : "#FF6B00"}
                                    right={
                                        <TextInput.Icon
                                            icon={securePassword ? 'eye' : 'eye-off'}
                                            onPress={() => setSecurePassword(!securePassword)}
                                            color="#FF6B00"
                                        />
                                    }
                                    theme={{ roundness: 12 }}
                                />
                                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                                <TextInput
                                    label="Şifre Tekrar"
                                    mode="outlined"
                                    secureTextEntry={secureConfirmPassword}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    style={styles.input}
                                    outlineColor={confirmPasswordError ? "#FF0000" : "#DDD"}
                                    activeOutlineColor={confirmPasswordError ? "#FF0000" : "#FF6B00"}
                                    right={
                                        <TextInput.Icon
                                            icon={secureConfirmPassword ? 'eye' : 'eye-off'}
                                            onPress={() => setSecureConfirmPassword(!secureConfirmPassword)}
                                            color="#FF6B00"
                                        />
                                    }
                                    theme={{ roundness: 12 }}
                                />
                                {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

                                <View style={styles.dietitianSection}>
                                    <Text style={styles.formTitle}>Diyetisyen Bilgisi</Text>
                                    {/*<TextInput
                                        label="Diyetisyen Referans Kodu"
                                        mode="outlined"
                                        value={dietitianCode}
                                        onChangeText={(text) => {
                                            setDietitianCode(text);
                                            handleDietitianFetch(text);
                                        }}
                                        keyboardType="number-pad"
                                        style={styles.input}
                                        outlineColor="#DDD"
                                        activeOutlineColor="#F57C00"
                                        right={
                                            fetchingDietitian ?
                                                <TextInput.Icon
                                                    icon={() => <ActivityIndicator size={20} color="#F57C00"/>}/> :
                                                undefined
                                        }
                                    />*/}

                                    {dietitianName ? (
                                        <View style={styles.dietitianInfoCard}>
                                            <Icon name="account-check" size={24} color="#4CAF50"/>
                                            <Text style={styles.dietitianName}>Diyetisyen: {dietitianName}</Text>
                                        </View>
                                    ) : dietitianCode ? (
                                        <View style={styles.dietitianNotFoundCard}>
                                            <Icon name="alert-circle" size={24} color="#FF9800"/>
                                            <Text style={styles.dietitianNotFound}>Diyetisyen bulunamadı</Text>
                                        </View>
                                    ) : null}
                                </View>
                            </Card.Content>
                        </Card>

                        {loading ? (
                            <ActivityIndicator animating size="large" color="#FF6B00" style={styles.loader}/>
                        ) : (
                            <Button
                                mode="contained"
                                onPress={handleRegister}
                                style={styles.registerButton}
                                buttonColor="#2d4149"
                                contentStyle={styles.buttonContent}
                                labelStyle={styles.buttonLabel}
                            >
                                Kayıt Ol
                            </Button>
                        )}

                        <TouchableOpacity
                            style={styles.loginLink}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.loginText}>Zaten hesabınız var mı? <Text style={styles.loginTextBold}>Giriş
                                Yap</Text></Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

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
        bottom: 0,
    },
    patternOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        opacity: 0.8
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollView: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 40,
        paddingBottom: 40,
    },
    backButton: {
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 10,
        padding: 10,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 36,
        marginTop: 16,
    },
    iconCircle: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    headerIcon: {
        padding: 10,
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: {width: 0, height: 2},
        textShadowRadius: 3,
    },
    subheader: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
        opacity: 0.9
    },
    formCard: {
        borderRadius: 20,
        elevation: 8,
        marginBottom: 24,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginVertical: 12,
        marginBottom: 16,
        borderLeftWidth: 3,
        borderLeftColor: '#FF6B00',
        paddingLeft: 8,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        marginBottom: 12,
    },
    input: {
        marginBottom: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        fontSize: 16,
    },
    radioGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dietitianSection: {
        marginTop: 16,
        marginBottom: 8,
    },
    dietitianInfoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        backgroundColor: '#F0FFF4',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#C6F6D5',
        marginTop: 8,
    },
    dietitianName: {
        color: '#4CAF50',
        marginLeft: 12,
        fontWeight: '500',
        fontSize: 16,
    },
    dietitianNotFoundCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        backgroundColor: '#FFF3CD',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFEEBA',
        marginTop: 8,
    },
    dietitianNotFound: {
        color: '#FF9800',
        marginLeft: 12,
        fontWeight: '500',
        fontSize: 16,
    },
    registerButton: {
        marginVertical: 16,
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
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
        lineHeight: 16
    },
    loader: {
        marginTop: 20,
    },
    loginLink: {
        alignItems: 'center',
        marginTop: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignSelf: 'center',
    },
    loginText: {
        color: '#666',
        fontSize: 14,
    },
    loginTextBold: {
        color: '#FF6B00',
        fontWeight: 'bold',
    },
    errorText: {
        color: '#D32F2F',
        fontSize: 12,
        marginTop: -10,
        marginBottom: 10,
        marginLeft: 5,
    },
    errorMessageContainer: {
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
    errorMessage: {
        flex: 1,
        color: '#D32F2F',
        fontSize: 14,
        fontWeight: '500'
    },
});

export default KayitolScreen;
