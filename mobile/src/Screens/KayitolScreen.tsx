import React, {useEffect, useState} from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import {ActivityIndicator, Button, Card, Text, RadioButton, TextInput, useTheme} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import config from '../../config';

type RootStackParamList = {
    Kayitol: { dietitian_id: string };
    AnaSayfa: undefined;
};

type KayitolRouteProp = RouteProp<RootStackParamList, 'Kayitol'>;

const KayitolScreen: React.FC = () => {
    const theme = useTheme();
    const route = useRoute<KayitolRouteProp>();
    const navigation = useNavigation<any>();
    const dietitianId = route.params?.dietitian_id || '';

    const [name, setName] = useState('');
    const [dietitianCode, setDietitianCode] = useState(dietitianId);
    const [gender, setGender] = useState('');
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

    const [dietitianName, setDietitianName] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingDietitian, setFetchingDietitian] = useState(false);

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
                    })
                }
            );
            const data = await response.json();
            if (response.ok) {
                await AsyncStorage.setItem('token', `Bearer ${data.token}`);
                await navigation.navigate('AnaSayfa');
            } else {
                Alert.alert('Hata', data.message || 'Kayıt başarısız.');
            }
        } catch (error) {
            Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#F57C00" barStyle="light-content"/>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollView}
                    keyboardShouldPersistTaps="handled"
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-left" size={24} color="#F57C00"/>
                    </TouchableOpacity>

                    <View style={styles.headerContainer}>
                        <Icon name="account-plus" size={50} color="#F57C00" style={styles.icon}/>
                        <Text style={styles.header}>Hesap Oluştur</Text>
                    </View>

                    <Card style={styles.card}>
                        <Card.Content>
                            <TextInput
                                label="İsim Soyisim"
                                mode="outlined"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                                style={styles.input}
                                outlineColor={nameError ? "#FF0000" : "#DDD"}
                                activeOutlineColor={nameError ? "#FF0000" : "#F57C00"}
                                left={<TextInput.Icon icon="account" color="#AAA"/>}
                            />
                            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

                            <TextInput
                              label="Email"
                              mode="outlined"
                              value={mail}
                              onChangeText={(text) => {
                                setMail(text);
                                if (!validateEmail(text)) {
                                  setMailError('Geçerli bir e-posta giriniz.');
                                } else {
                                  setMailError('');
                                }
                              }}
                              style={styles.input}
                              outlineColor={mailError ? "#FF0000" : "#DDD"}
                              activeOutlineColor={mailError ? "#FF0000" : "#F57C00"}
                              left={<TextInput.Icon icon="email" color="#AAA" />}
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
                                activeOutlineColor={phoneError ? "#FF0000" : "#F57C00"}
                            />
                            {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

                            <Text style={{ marginBottom: 8, fontSize: 16, fontWeight: '700' }}>Cinsiyet</Text>
                            <RadioButton.Group onValueChange={newValue => setGender(newValue)} value={gender}>
                                <View style={{ flexDirection: 'row' as const, justifyContent: 'space-between', marginBottom: 16 }}>
                                    <View style={{ flexDirection: 'row' as const, alignItems: 'center' as const }}>
                                        <RadioButton value="Erkek" />
                                        <Text>Erkek</Text>
                                    </View>

                                    <View style={{ flexDirection: 'row' as const, alignItems: 'center' as const }}>
                                        <RadioButton value="Kadın" />
                                        <Text>Kadın</Text>
                                    </View>

                                    <View style={{ flexDirection: 'row' as const, alignItems: 'center' as const }}>
                                        <RadioButton value="Diğer" />
                                        <Text>Diğer</Text>
                                    </View>
                                </View>
                            </RadioButton.Group>
                            {genderError ? <Text style={styles.errorText}>{genderError}</Text> : null}

                            <TextInput
                                label="Şifre"
                                mode="outlined"
                                secureTextEntry={securePassword}
                                value={password}
                                onChangeText={setPassword}
                                style={styles.input}
                                outlineColor={passwordError ? "#FF0000" : "#DDD"}
                                activeOutlineColor={passwordError ? "#FF0000" : "#F57C00"}
                                right={
                                    <TextInput.Icon
                                        icon={securePassword ? 'eye' : 'eye-off'}
                                        onPress={() => setSecurePassword(!securePassword)}
                                        color="#F57C00"
                                    />
                                }
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
                                activeOutlineColor={confirmPasswordError ? "#FF0000" : "#F57C00"}
                                right={
                                    <TextInput.Icon
                                        icon={secureConfirmPassword ? 'eye' : 'eye-off'}
                                        onPress={() => setSecureConfirmPassword(!secureConfirmPassword)}
                                        color="#F57C00"
                                    />
                                }
                            />
                            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

                            <View style={styles.dietitianSection}>
                                <Text style={styles.sectionTitle}>Diyetisyen Bilgileri</Text>
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
                                    <View style={styles.dietitianInfo}>
                                        <Icon name="account-check" size={20} color="#4CAF50"/>
                                        <Text style={styles.dietitianName}>Diyetisyen: {dietitianName}</Text>
                                    </View>
                                ) : dietitianCode ? (
                                    <View style={styles.dietitianInfo}>
                                        <Icon name="alert-circle" size={20} color="#FF9800"/>
                                        <Text style={styles.dietitianNotFound}>Diyetisyen bulunamadı</Text>
                                    </View>
                                ) : null}
                            </View>
                        </Card.Content>
                    </Card>

                    {loading ? (
                        <ActivityIndicator animating size="large" color="#F57C00" style={styles.loader}/>
                    ) : (
                        <Button
                            mode="contained"
                            onPress={handleRegister}
                            style={styles.button}
                            buttonColor="#F57C00"
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
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const {width} = Dimensions.get('window');

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
        marginBottom: 24,
    },
    icon: {
        backgroundColor: 'rgba(245, 124, 0, 0.1)',
        padding: 16,
        borderRadius: 50,
        marginBottom: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    subheader: {
        fontSize: 14,
        color: '#777',
        textAlign: 'center',
        marginBottom: 8,
    },
    card: {
        borderRadius: 16,
        elevation: 4,
        marginBottom: 24,
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
    dietitianSection: {
        marginTop: 8,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        marginBottom: 12,
    },
    dietitianInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    dietitianName: {
        color: '#4CAF50',
        marginLeft: 8,
        fontWeight: '500',
    },
    dietitianNotFound: {
        color: '#FF9800',
        marginLeft: 8,
        fontWeight: '500',
    },
    button: {
        marginVertical: 16,
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
    loader: {
        marginTop: 20,
    },
    loginLink: {
        alignItems: 'center',
        marginTop: 8,
    },
    loginText: {
        color: '#666',
        fontSize: 14,
    },
    loginTextBold: {
        color: '#F57C00',
        fontWeight: 'bold',
    },
    errorText: {
        color: '#FF0000',
        fontSize: 12,
        marginTop: -10,
        marginBottom: 10,
        marginLeft: 5,
    },
});

export default KayitolScreen;
