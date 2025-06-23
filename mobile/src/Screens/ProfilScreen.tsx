import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View, Linking} from 'react-native';
import {Button, Card, Text, Modal, Portal, TextInput} from 'react-native-paper';
import Header from '../Components/Header';
import BottomNavbar from '../Components/BottomNavbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';

const Profil = ({navigation}) => {
    const [user, setUser] = useState({
        name: 'Yükleniyor...',
        phone: '',
        email: '',
    });

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [confirmName, setConfirmName] = useState('');

    useEffect(() => {
        const fetchClientInfo = async () => {
            try {
                const response = await fetch(`${config[config.environment].apiUrl}/client/getClientInfo`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': await AsyncStorage.getItem('token') || ''
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setUser({
                        name: data.name || 'İsimsiz',
                        phone: data.phoneNumber || '',
                        email: data.email || ''
                    });
                } else {
                    console.log('Kullanıcı bilgisi alınamadı:', data.message);
                }
            } catch (error) {
                console.error('Hata:', error);
            }
        };

        fetchClientInfo();
    }, []);

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            navigation.replace('Login');
        } catch (error) {
            console.error('Çıkış yapılırken hata oluştu:', error);
        }
    };

    const handleDeleteAccount = () => {
        Linking.openURL('mailto:diyetia.app@gmail.com?subject=Hesap%20Silme%20Talebi&body=Merhaba,%0A%0AHesabımı%20silmenizi%20talep%20ediyorum.%0A%0AAdı%20Soyadı:%20' + user.name +
        '%0AE-posta:%20' + user.email +
        '%0ATelefon:%20+90' + user.phone +
        '%0A%0ALütfen hesabımı silme işlemleri için, telefon numaram üzerinden benimle iletişime geçin.');
    };

    const handleConfirmDelete = () => {
        if (confirmName === user.name) {
            handleDeleteAccount();
            setDeleteModalVisible(false);
        } else {
            alert('Lütfen hesabınızı silmek için adınızı doğru bir şekilde girin.');
        }
    };

    return (
        <View style={styles.container}>
            <Header navigation={navigation}/>

            <ScrollView style={styles.content}>
                <View style={styles.profileSection}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarInitial}>{user.name?.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.name}>{user.name}</Text>
                    <Text style={styles.labelText}>Telefon: +90{user.phone}</Text>
                    <Text style={styles.labelText}>Mail: {user.email}</Text>
                </View>

                <Card style={styles.card}>
                    <Card.Content>
                        {/*
                        <Button onPress={() => console.log('Profili Düzenle')} mode="outlined" style={styles.button}>Profili
                            Düzenle</Button>

                        <Button onPress={() => console.log('Şifreyi Değiştir')} mode="outlined" style={styles.button}>Şifreyi
                            Değiştir
                        </Button>
                        <Button onPress={() => console.log('Ayarlar')} mode="outlined"
                                style={styles.button}>Ayarlar</Button>
                        */}
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
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Hesabı Sil</Text>
                            <Text style={styles.modalText}>
                                Hesabınızı silmek üzeresiniz. Bu işlem geri alınamaz.
                            </Text>

                            <TextInput
                                label="Adınızı Onaylayın"
                                value={confirmName}
                                onChangeText={setConfirmName}
                                style={styles.textInput}
                            />

                            <Button
                                onPress={handleConfirmDelete}
                                mode="contained"
                                style={styles.deleteButton}
                            >
                                Hesabı Sil
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
    );
};

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#f8f9fa'},
    content: {flex: 1, padding: 16},
    profileSection: {
        alignItems: 'center',
        marginBottom: 24,
        paddingVertical: 20
    },
    avatarPlaceholder: {
        backgroundColor: '#2e7d32',
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
    },
    name: {
        fontSize: 20,
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
        paddingBottom: 12
    },
    button: {
        marginVertical: 8,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    primaryButton: {
        backgroundColor: '#ff9e25',
    },
    dangerButton: {
        borderColor: '#d32f2f',
        borderWidth: 2,
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
        letterSpacing: 0.5,
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 12,
        margin: 16,
    },
    modalContent: {
        maxWidth: 400,
        width: '100%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        textAlign: 'center',
    },
    textInput: {
        marginBottom: 16,
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
    },
    deleteButton: {
        backgroundColor: '#d32f2f',
        borderRadius: 8,
    },
    cancelButton: {
        borderRadius: 8,
        borderColor: '#007bff',
        borderWidth: 2,
    },
});

export default Profil;
