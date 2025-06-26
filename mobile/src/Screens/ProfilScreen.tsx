import React, {useEffect, useState} from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
    Linking,
    Image,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
    PermissionsAndroid,
    Alert
} from 'react-native';
import {Button, Card, Text, Modal, Portal, TextInput, Provider as PaperProvider, Icon} from 'react-native-paper';
import * as ImagePicker from 'react-native-image-picker';

import Header from '../Components/Header';
import BottomNavbar from '../Components/BottomNavbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';

const Profil = ({navigation}) => {
    const [user, setUser] = useState({
        name: 'Yükleniyor...',
        phone: '',
        email: '',
        profileImageUrl: null,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [confirmName, setConfirmName] = useState('');

    useEffect(() => {
        const fetchClientInfo = async () => {
            setIsLoading(true);
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    navigation.replace('Login');
                    return;
                }
                const response = await fetch(`${config[config.environment].apiUrl}/client/getClientInfo`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setUser({
                        name: data.name || 'İsimsiz',
                        phone: data.phoneNumber || '',
                        email: data.email || '',
                        profileImageUrl: data.profileImageUrl || null,
                    });
                } else {
                    console.log('Kullanıcı bilgisi alınamadı:', data.message);
                    if (response.status === 401 || response.status === 403) {
                       await handleLogout();
                    }
                }
            } catch (error) {
                console.error('Hata:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchClientInfo();
    }, []);

    const handleChoosePhoto = async () => {
        if (isUploading) return;

        if (Platform.OS === 'android') {
            const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
            if (!hasPermission) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: "Uygulama Kamera İzni",
                        message: "Uygulama, profil fotoğrafı için kameranıza erişmek istiyor.",
                        buttonPositive: "Tamam"
                    }
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert("İzin Gerekli", "Fotoğraf yüklemek için kamera izni vermelisiniz.");
                    return;
                }
            }
        }

        ImagePicker.launchImageLibrary({
            mediaType: 'photo',
            quality: 0.7,
        }, (response) => {
            if (response.didCancel) {
                console.log('Kullanıcı resim seçmeyi iptal etti');
            } else if (response.errorCode) {
                console.log('ImagePicker Hatası: ', response.errorMessage);
            } else {
                let imageAsset = response.assets && response.assets[0];
                if (imageAsset) {
                     handleUploadPhoto(imageAsset);
                }
            }
        });
    };

    const handleUploadPhoto = async (photo) => {
        setIsUploading(true);
        const token = await AsyncStorage.getItem('token');
        const formData = new FormData();

        formData.append('image', {
            uri: photo.uri,
            type: photo.type,
            name: photo.fileName,
        });

        try {
            const response = await fetch(`${config[config.environment].apiUrl}/upload?type=profilephoto`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': token,
                },
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Sunucudan JSON dışında bir yanıt geldi:', text);
                Alert.alert('Hata', 'Sunucudan beklenmeyen bir yanıt alındı.');
                return;
            }
            console.log(data);
            if (response.ok) {
                const newImageUrl = data.imageUrl;
                try {
                    const updateRes = await fetch(`${config[config.environment].apiUrl}/client/updateProfilePhoto`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token,
                        },
                        body: JSON.stringify({ profilePhoto: newImageUrl })
                    });
                    if (!updateRes.ok) {
                        const updateText = await updateRes.text();
                        console.error('Profil fotoğrafı güncellenemedi:', updateText);
                        Alert.alert('Hata', 'Profil fotoğrafı güncellenemedi.');
                    } else {
                        setUser(prevUser => ({ ...prevUser, profileImageUrl: newImageUrl }));
                    }
                } catch (err) {
                    console.error('Profil fotoğrafı güncelleme hatası:', err);
                    Alert.alert('Hata', 'Profil fotoğrafı güncellenemedi.');
                }
            } else {
                Alert.alert('Hata', 'Fotoğraf yüklenemedi. Lütfen tekrar deneyin.');
            }
        } catch (error) {
            console.error('Fotoğraf yükleme hatası:', error);
            Alert.alert('Hata', 'Bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            navigation.replace('Login');
        } catch (error) {
            console.error('Çıkış yapılırken hata oluştu:', error);
        }
    };

    const handleDeleteAccount = () => {
        const mailtoLink = `mailto:diyetia.app@gmail.com?subject=Hesap%20Silme%20Talebi&body=Merhaba,%0A%0AHesabımı%20silmenizi%20talep%20ediyorum.%0A%0AAdı%20Soyadı:%20${user.name}%0AE-posta:%20${user.email}%0ATelefon:%20+90${user.phone}%0A%0ALütfen hesabımı silme işlemleri için, telefon numaram üzerinden benimle iletişime geçin.`;
        Linking.openURL(mailtoLink);
    };

    const handleConfirmDelete = () => {
        if (confirmName.trim() === user.name.trim()) {
            handleDeleteAccount();
            setDeleteModalVisible(false);
            setConfirmName('');
        } else {
            Alert.alert('Hata', 'Lütfen hesabınızı silmek için adınızı doğru bir şekilde girin.');
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2e7d32" />
            </View>
        );
    }

    return (
        <PaperProvider>
            <View style={styles.container}>
                <Header navigation={navigation}/>

                <ScrollView style={styles.content}>
                    <View style={styles.profileSection}>
                        <TouchableOpacity onPress={handleChoosePhoto} disabled={isUploading} style={styles.avatarContainer}>
                            {user.profileImageUrl ? (
                                <Image source={{ uri: user.profileImageUrl }} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarInitial}>{user.name?.charAt(0).toUpperCase()}</Text>
                                </View>
                            )}
                            <View style={styles.cameraIconContainer}>
                                {isUploading ?
                                    <ActivityIndicator color="#fff" size="small"/>
                                    : <Icon source="camera" size={20} color="#fff" />
                                }
                            </View>
                        </TouchableOpacity>

                        <Text style={styles.name}>{user.name}</Text>
                        <Text style={styles.labelText}>Telefon: +90{user.phone}</Text>
                        <Text style={styles.labelText}>Mail: {user.email}</Text>
                    </View>

                    <Card style={styles.card}>
                        <Card.Content>
                             <Button
                                onPress={() => navigation.navigate('Odeme')}
                                mode="contained"
                                icon="credit-card"
                                style={[styles.button, styles.primaryButton]}
                                contentStyle={styles.buttonContent}
                                labelStyle={styles.buttonLabel}
                            >
                                Ödemelerim
                            </Button>

                            <Button
                                onPress={() => setDeleteModalVisible(true)}
                                mode="outlined"
                                icon="account-remove"
                                textColor="#d32f2f"
                                style={[styles.button, styles.dangerButton]}
                                contentStyle={styles.buttonContent}
                                labelStyle={styles.buttonLabel}
                            >
                                Hesabımı Sil
                            </Button>

                            <Button
                                onPress={handleLogout}
                                mode="contained"
                                textColor="#fff"
                                buttonColor="#d32f2f"
                                style={[styles.button, styles.logoutButton]}
                                icon="logout"
                                contentStyle={styles.buttonContent}
                                labelStyle={styles.buttonLabel}
                            >
                                Çıkış Yap
                            </Button>
                        </Card.Content>
                    </Card>

                    <Portal>
                        <Modal
                            visible={deleteModalVisible}
                            onDismiss={() => setDeleteModalVisible(false)}
                            contentContainerStyle={styles.modalContainer}
                        >
                            <View>
                                <Text style={styles.modalTitle}>Hesabı Sil</Text>
                                <Text style={styles.modalText}>
                                    Bu işlem geri alınamaz. Onaylamak için lütfen tam adınızı yazın.
                                </Text>

                                <TextInput
                                    label={`'${user.name}' yazarak onaylayın`}
                                    value={confirmName}
                                    onChangeText={setConfirmName}
                                    style={styles.textInput}
                                    autoCapitalize="none"
                                />

                                <Button
                                    onPress={handleConfirmDelete}
                                    mode="contained"
                                    style={styles.deleteButton}
                                    labelStyle={{color: '#fff'}}
                                >
                                    Hesabı Kalıcı Olarak Sil
                                </Button>

                                <Button
                                    onPress={() => setDeleteModalVisible(false)}
                                    mode="outlined"
                                    style={styles.cancelButton}
                                >
                                    İptal
                                </Button>
                            </View>
                        </Modal>
                    </Portal>
                </ScrollView>

                <BottomNavbar navigation={navigation}/>
            </View>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#f8f9fa'},
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f8f9fa',
    },
    content: {flex: 1, padding: 16},
    profileSection: {
        alignItems: 'center',
        marginBottom: 24,
        paddingVertical: 20
    },
    avatarContainer: {
        position: 'relative',
        width: 100,
        height: 100,
        marginBottom: 16,
    },
    avatarPlaceholder: {
        backgroundColor: '#2e7d32',
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        elevation: 5,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#fff',
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        color: 'white',
        fontSize: 40,
        fontWeight: 'bold',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 4
    },
    labelText: {
        fontSize: 15,
        color: '#333',
        marginTop: 2
    },
    card: {
        marginBottom: 16,
        borderRadius: 12,
        elevation: 3,
        backgroundColor: '#ffffff',
        paddingVertical: 12
    },
    button: {
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 12,
        elevation: 2,
    },
    primaryButton: {
        backgroundColor: '#ff9e25',
    },
    dangerButton: {
        borderColor: '#d32f2f',
        borderWidth: 1,
        backgroundColor: 'transparent'
    },
    logoutButton: {
        backgroundColor: '#d32f2f',
    },
    buttonContent: {
        height: 48,
        flexDirection: 'row-reverse',
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 16,
        margin: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
        lineHeight: 20,
    },
    textInput: {
        marginBottom: 16,
        backgroundColor: '#f1f1f1',
    },
    deleteButton: {
        backgroundColor: '#d32f2f',
        borderRadius: 8,
        paddingVertical: 4,
        marginBottom: 8,
    },
    cancelButton: {
        borderRadius: 8,
        borderColor: '#666',
        borderWidth: 1,
        paddingVertical: 4,
    },
});

export default Profil;