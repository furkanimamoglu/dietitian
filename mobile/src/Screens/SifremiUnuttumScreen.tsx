import React, {useState} from 'react';
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
import {Button, Card, Text, TextInput, useTheme} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import config from '../../config';

const SifremiUnuttumScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Phone entry, 2: Code verification, 3: New password
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [securePassword, setSecurePassword] = useState(true);
    const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);

    const handlePhoneChange = (text: string) => {
        const digits = text.replace(/[^0-9]/g, "").slice(0, 10);
        setPhone(digits);
    };

    const requestPasswordReset = async () => {
        if (phone.length < 10) {
            Alert.alert('Uyarı', 'Lütfen geçerli bir telefon numarası girin');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${config[config.environment].apiUrl}/client/forgot-password`, {
                phoneNumber: phone
            });

            if (response.data.success) {
                setStep(2);
                Alert.alert('Başarılı', 'Doğrulama kodu telefonunuza gönderildi');
            } else {
                Alert.alert('Hata', response.data.message || 'Bir hata oluştu');
            }
        } catch (error: any) {
            Alert.alert(
                'İşlem Başarısız',
                error?.response?.data?.message || 'Bir hata oluştu'
            );
        } finally {
            setLoading(false);
        }
    };

    const verifyCode = async () => {
        if (verificationCode.length < 4) {
            Alert.alert('Uyarı', 'Lütfen geçerli bir doğrulama kodu girin');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${config[config.environment].apiUrl}/client/verify-code`, {
                phoneNumber: phone,
                verificationCode: verificationCode
            });

            if (response.data.success) {
                setStep(3);
            } else {
                Alert.alert('Hata', response.data.message || 'Doğrulama kodu geçersiz');
            }
        } catch (error: any) {
            Alert.alert(
                'İşlem Başarısız',
                error?.response?.data?.message || 'Bir hata oluştu'
            );
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async () => {
        if (newPassword.length < 6) {
            Alert.alert('Uyarı', 'Şifre en az 6 karakter olmalıdır');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Uyarı', 'Şifreler eşleşmiyor');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${config[config.environment].apiUrl}/client/reset-password`, {
                phoneNumber: phone,
                verificationCode: verificationCode,
                newPassword: newPassword
            });

            if (response.data.success) {
                Alert.alert(
                    'Başarılı',
                    'Şifreniz başarıyla sıfırlandı',
                    [{text: 'Giriş Yap', onPress: () => navigation.goBack()}]
                );
            } else {
                Alert.alert('Hata', response.data.message || 'Şifre sıfırlama başarısız');
            }
        } catch (error: any) {
            Alert.alert(
                'İşlem Başarısız',
                error?.response?.data?.message || 'Bir hata oluştu'
            );
        } finally {
            setLoading(false);
        }
    };

    const renderStepOne = () => (
        <>
            <TextInput
                label="Telefon"
                mode="outlined"
                value={phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={10}
                placeholder="5xxxxxxxxx"
                left={<TextInput.Affix text="+90"/>}
                style={styles.input}
                outlineColor="#DDD"
                activeOutlineColor="#F57C00"
            />
            <Text style={styles.helpText}>
                Kayıtlı telefon numaranızı girin. Doğrulama kodu gönderilecektir.
            </Text>
            <Button
                mode="contained"
                onPress={requestPasswordReset}
                loading={loading}
                disabled={loading}
                style={styles.button}
                buttonColor="#F57C00"
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
            >
                Doğrulama Kodu Gönder
            </Button>
        </>
    );

    const renderStepTwo = () => (
        <>
            <TextInput
                label="Doğrulama Kodu"
                mode="outlined"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                style={styles.input}
                outlineColor="#DDD"
                activeOutlineColor="#F57C00"
            />
            <Text style={styles.helpText}>
                Telefonunuza gönderilen 6 haneli doğrulama kodunu girin.
            </Text>
            <Button
                mode="contained"
                onPress={verifyCode}
                loading={loading}
                disabled={loading}
                style={styles.button}
                buttonColor="#F57C00"
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
            >
                Doğrula
            </Button>
            <Button
                mode="text"
                onPress={() => setStep(1)}
                style={styles.textButton}
                textColor="#F57C00"
            >
                Telefon Numarasını Değiştir
            </Button>
        </>
    );

    const renderStepThree = () => (
        <>
            <TextInput
                label="Yeni Şifre"
                mode="outlined"
                secureTextEntry={securePassword}
                value={newPassword}
                onChangeText={setNewPassword}
                style={styles.input}
                outlineColor="#DDD"
                activeOutlineColor="#F57C00"
                right={
                    <TextInput.Icon
                        icon={securePassword ? 'eye' : 'eye-off'}
                        onPress={() => setSecurePassword(!securePassword)}
                        color="#F57C00"
                    />
                }
            />
            <TextInput
                label="Şifre Tekrar"
                mode="outlined"
                secureTextEntry={secureConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.input}
                outlineColor="#DDD"
                activeOutlineColor="#F57C00"
                right={
                    <TextInput.Icon
                        icon={secureConfirmPassword ? 'eye' : 'eye-off'}
                        onPress={() => setSecureConfirmPassword(!secureConfirmPassword)}
                        color="#F57C00"
                    />
                }
            />
            <Text style={styles.helpText}>
                Yeni şifreniz en az 6 karakter olmalıdır.
            </Text>
            <Button
                mode="contained"
                onPress={resetPassword}
                loading={loading}
                disabled={loading}
                style={styles.button}
                buttonColor="#F57C00"
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
            >
                Şifremi Sıfırla
            </Button>
        </>
    );

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#FF6B00" barStyle="light-content"/>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{flex: 1}}
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
                        <Icon name="lock-reset" size={50} color="#F57C00" style={styles.icon}/>
                        <Text style={styles.header}>Şifremi Unuttum</Text>
                        <Text style={styles.subheader}>
                            {step === 1 && 'Şifrenizi sıfırlamak için telefon numaranızı girin veya diyetisyeninize başvurun.'}
                            {step === 2 && 'Doğrulama kodunu girin'}
                            {step === 3 && 'Yeni şifrenizi oluşturun'}
                        </Text>
                    </View>

                    <Card style={styles.card}>
                        <Card.Content>
                            {step === 1 && renderStepOne()}
                            {step === 2 && renderStepTwo()}
                            {step === 3 && renderStepThree()}
                        </Card.Content>
                    </Card>

                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.loginText}>Şifrenizi hatırladınız mı? <Text style={styles.loginTextBold}>Giriş
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
    helpText: {
        fontSize: 12,
        color: '#777',
        marginBottom: 16,
        textAlign: 'center',
    },
    button: {
        marginVertical: 8,
        borderRadius: 8,
        elevation: 2,
    },
    textButton: {
        marginTop: 4,
    },
    buttonContent: {
        height: 48,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    loginLink: {
        alignItems: 'center',
        marginTop: 16,
    },
    loginText: {
        color: '#666',
        fontSize: 14,
    },
    loginTextBold: {
        color: '#fc9e21',
        fontWeight: 'bold',
    },
});

export default SifremiUnuttumScreen;
