import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    PermissionsAndroid,
    Platform,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ImageBackground,
    Alert,
} from 'react-native';

import Header from '../Components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

const Mesaj = ({navigation}) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [clientInfo, setClientInfo] = useState({});
    const [modalVisible, setModalVisible] = useState(false);
    const [modalImageUri, setModalImageUri] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const flatListRef = useRef(null);
    const intervalRef = useRef(null);

    const fetchMessages = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('Token Bulunamadı');
                return;
            }

            const response = await fetch(`${config[config.environment].apiUrl}/message/getMyMessages`, {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 500) {
                setMessages([]);
                return;
            }

            const data = await response.json();

            if (data && Array.isArray(data)) {
                setMessages(data);
            } else {
                setMessages([]);
            }
        } catch (err) {
            console.error('Error: fetchMessages ', err);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

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
                setClientInfo(data);
            } else {
                console.log('Kullanıcı bilgisi alınamadı:', data.message);
            }
        } catch (error) {
            console.error('Hata:', error);
        }
    };

    useEffect(() => {
        fetchClientInfo().then(response => {
        });
        fetchMessages().then(response => {
        });
        requestCameraPermission().then(response => {
        });

        intervalRef.current = setInterval(() => {
            fetchMessages();
        }, 5000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (flatListRef.current && messages.length > 0) {
            setTimeout(() => {
                flatListRef.current.scrollToEnd({animated: true});
            }, 100);
        }
    }, [messages]);

    const requestCameraPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: 'Kamera Erişim İzni',
                    message: 'Uygulamanın kameraya erişmesi gerekiyor',
                    buttonNeutral: 'Daha Sonra Sor',
                    buttonNegative: 'İptal',
                    buttonPositive: 'Tamam'
                }
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Kamera izni reddedildi');
            }
        } catch (err) {
            console.warn(err);
        }
    };

    const uploadImage = async (imageUri) => {
        try {
            setUploadingImage(true);

            const formData = new FormData();
            formData.append('image', {
                uri: imageUri,
                type: 'image/jpeg',
                name: 'image.jpg',
            });

            const response = await fetch('http://localhost:3000/api/upload?type=message', {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = await response.json();

            if (response.ok && data.imageUrl) {
                return data.imageUrl;
            } else {
                throw new Error('Resim yüklenemedi');
            }
        } catch (error) {
            console.error('Resim yükleme hatası:', error);
            Alert.alert('Hata', 'Resim yüklenirken bir hata oluştu');
            return null;
        } finally {
            setUploadingImage(false);
        }
    };

    const sendImageMessage = async (imageUrl) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('Token bulunamadı');
                return;
            }

            const response = await fetch(`${config[config.environment].apiUrl}/message/sendMessage`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    receiver_id: clientInfo.dietitian_id,
                    message: `[RESIM:${imageUrl}]`
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API Hatası: ${response.status}`, errorText);
            }
        } catch (err) {
            console.error('Resim mesajı gönderme hatası:', err);
        }
    };

    const sendMessage = useCallback(async () => {
        if (input.trim() === '') return;

        const messageText = input.trim();

        const newMessage = {
            id: Date.now().toString(),
            sender: 'CLIENT',
            message: messageText,
            isRead: true,
            createdAt: getCurrentTime()
        };

        setMessages(prev => [...prev, newMessage]);
        setInput('');

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('Token bulunamadı');
                return;
            }

            const response = await fetch(`${config[config.environment].apiUrl}/message/sendMessage`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    receiver_id: clientInfo.dietitian_id,
                    message: messageText
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API Hatası: ${response.status}`, errorText);
            }
        } catch (err) {
            console.error('Mesaj gönderme hatası:', err);
        }
    }, [input, clientInfo.dietitian_id]);

    const openCamera = useCallback(() => {
        setLoading(true);
        launchCamera(
            {
                mediaType: 'photo',
                saveToPhotos: true,
                quality: 0.8,
                maxWidth: 1000,
                maxHeight: 1000,
            },
            async (response) => {
                setLoading(false);
                if (response.didCancel) {
                    console.log('Kullanıcı kamerayı iptal etti');
                } else if (response.errorCode) {
                    console.error('Kamera hatası:', response.errorMessage);
                } else {
                    const imageUri = response.assets?.[0]?.uri;
                    if (imageUri) {
                        // Önce UI'da göster
                        const tempMessage = {
                            id: Date.now().toString(),
                            sender: 'CLIENT',
                            message: `[RESIM:${imageUri}]`,
                            createdAt: getCurrentTime(),
                            isUploading: true
                        };
                        setMessages(prev => [...prev, tempMessage]);

                        // Resmi yükle ve gerçek URL'i gönder
                        const uploadedImageUrl = await uploadImage(imageUri);
                        if (uploadedImageUrl) {
                            // Temp mesajı kaldır ve gerçek mesajı ekle
                            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
                            await sendImageMessage(uploadedImageUrl);
                        } else {
                            // Hata durumunda temp mesajı kaldır
                            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
                        }
                    }
                }
            }
        );
    }, [clientInfo.dietitian_id]);

    const openGallery = useCallback(() => {
        setLoading(true);
        launchImageLibrary(
            {
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 1000,
                maxHeight: 1000,
            },
            async (response) => {
                setLoading(false);
                if (response.didCancel) {
                    console.log('Kullanıcı galeriyi iptal etti');
                } else if (response.errorCode) {
                    console.error('Galeri hatası:', response.errorMessage);
                } else {
                    const imageUri = response.assets?.[0]?.uri;
                    if (imageUri) {
                        // Önce UI'da göster
                        const tempMessage = {
                            id: Date.now().toString(),
                            sender: 'CLIENT',
                            message: `[RESIM:${imageUri}]`,
                            createdAt: getCurrentTime(),
                            isUploading: true
                        };
                        setMessages(prev => [...prev, tempMessage]);

                        // Resmi yükle ve gerçek URL'i gönder
                        const uploadedImageUrl = await uploadImage(imageUri);
                        if (uploadedImageUrl) {
                            // Temp mesajı kaldır ve gerçek mesajı gönder
                            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
                            await sendImageMessage(uploadedImageUrl);
                        } else {
                            // Hata durumunda temp mesajı kaldır
                            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
                        }
                    }
                }
            }
        );
    }, [clientInfo.dietitian_id]);

    const handleImagePress = useCallback((uri) => {
        setModalImageUri(uri);
        setModalVisible(true);
    }, []);

    const getCurrentTime = () => {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    };

    const renderMessageItem = useCallback(({item}) => {
        const isUser = item.sender === 'CLIENT';

        const isImage = item.message && item.message.startsWith('http') &&
            (item.message.endsWith('.jpg') || item.message.endsWith('.jpeg') ||
                item.message.endsWith('.png') || item.message.endsWith('.gif'));

        const resimMatch = item.message && item.message.match(/^\[RESIM:(http[^[\]]+)\]$/);
        const isResimFormat = !!resimMatch;
        const resimUrl = isResimFormat ? resimMatch[1] : null;

        return (
            <View style={[styles.messageRow, isUser ? styles.userRow : styles.diyetisyenRow]}>
                <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.diyetisyenBubble]}>
                    {!isImage && !isResimFormat && item.message && (
                        <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.diyetisyenMessageText]}>
                            {item.message}
                        </Text>
                    )}

                    {isImage && (
                        <TouchableOpacity onPress={() => handleImagePress(item.message)} activeOpacity={0.8}>
                            <Image
                                source={{uri: item.message}}
                                style={styles.sentImage}
                                resizeMode="cover"
                            />
                            {item.isUploading && (
                                <View style={styles.imageUploadOverlay}>
                                    <ActivityIndicator color="#fff" size="small"/>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}

                    {isResimFormat && (
                        <TouchableOpacity onPress={() => handleImagePress(resimUrl)} activeOpacity={0.8}>
                            <Image
                                source={{uri: resimUrl}}
                                style={styles.sentImage}
                                resizeMode="cover"
                            />
                            {item.isUploading && (
                                <View style={styles.imageUploadOverlay}>
                                    <ActivityIndicator color="#fff" size="small"/>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}

                    {item.image && (
                        <TouchableOpacity onPress={() => handleImagePress(item.image)} activeOpacity={0.8}>
                            <Image
                                source={{uri: item.image}}
                                style={styles.sentImage}
                                resizeMode="cover"
                            />
                            {item.isUploading && (
                                <View style={styles.imageUploadOverlay}>
                                    <ActivityIndicator color="#fff" size="small"/>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}

                    <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.diyetisyenTimestamp]}>
                        {item.createdAt}
                    </Text>
                </View>
            </View>
        );
    }, [handleImagePress]);

    const ListHeaderComponent = useMemo(() => (
        <View style={styles.dateHeader}>
            <View style={styles.dateHeaderContainer}>
                <Text style={styles.dateHeaderText}>Bugün</Text>
            </View>
        </View>
    ), []);

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#2E7D32" barStyle="light-content"/>
            <Header navigation={navigation}/>

            <ImageBackground
                source={{
                    uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJzdWJ0bGUtcGF0dGVybiIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPgogICAgICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZhZmFmYSIvPgogICAgICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIxLjUiIGZpbGw9IiNmMGYwZjAiIG9wYWNpdHk9IjAuMyIvPgogICAgICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSIjZThlOGU4IiBvcGFjaXR5PSIwLjIiLz4KICAgICAgPGNpcmNsZSBjeD0iODAiIGN5PSI4MCIgcj0iMSIgZmlsbD0iI2U4ZThlOCIgb3BhY2l0eT0iMC4yIi8+CiAgICA8L3BhdHRlcm4+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ1cmwoI3N1YnRsZS1wYXR0ZXJuKSIvPgo8L3N2Zz4='
                }}
                style={styles.backgroundImage}
                resizeMode="repeat"
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={renderMessageItem}
                    contentContainerStyle={styles.messagesContainer}
                    ListHeaderComponent={ListHeaderComponent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconContainer}>
                                <Icon name="chat-outline" size={60} color="#bbb"/>
                            </View>
                            <Text style={styles.emptyText}>Henüz mesaj yok</Text>
                            <Text style={styles.emptySubText}>Diyetisyeninizle sohbete başlayın</Text>
                        </View>
                    }
                />
            </ImageBackground>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={90}
            >
                <View style={styles.inputWrapper}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            value={input}
                            onChangeText={setInput}
                            placeholder="Mesajınızı yazın..."
                            placeholderTextColor="#888"
                            style={styles.input}
                            multiline
                        />
                        {/*<View style={styles.inputActions}>*/}
                        {/*    <TouchableOpacity*/}
                        {/*        style={[styles.iconButton, (loading || uploadingImage) && styles.iconButtonDisabled]}*/}
                        {/*        onPress={openGallery}*/}
                        {/*        disabled={loading || uploadingImage}*/}
                        {/*    >*/}
                        {/*        <Icon name="image" size={22} color={(loading || uploadingImage) ? "#ccc" : "#4CAF50"}/>*/}
                        {/*    </TouchableOpacity>*/}
                        {/*    <TouchableOpacity*/}
                        {/*        style={[styles.iconButton, (loading || uploadingImage) && styles.iconButtonDisabled]}*/}
                        {/*        onPress={openCamera}*/}
                        {/*        disabled={loading || uploadingImage}*/}
                        {/*    >*/}
                        {/*        <Icon name="camera" size={22} color={(loading || uploadingImage) ? "#ccc" : "#4CAF50"}/>*/}
                        {/*    </TouchableOpacity>*/}
                        {/*</View>*/}
                    </View>

                    <TouchableOpacity
                        onPress={sendMessage}
                        style={[styles.sendButton, input.trim() === '' && styles.sendButtonDisabled]}
                        disabled={input.trim() === '' || loading || uploadingImage}
                    >
                        {(loading || uploadingImage) ? (
                            <ActivityIndicator color="#fff" size="small"/>
                        ) : (
                            <Icon name="send" size={20} color="#fff"/>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Büyük resim modali */}
            <Modal visible={modalVisible} transparent={true} animationType="fade">
                <Pressable style={styles.modalBackground} onPress={() => setModalVisible(false)}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Icon name="close" size={28} color="#fff"/>
                        </TouchableOpacity>
                    </View>
                    <Image source={{uri: modalImageUri}} style={styles.fullImage} resizeMode="contain"/>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa'
    },
    backgroundImage: {
        flex: 1,
    },
    messagesContainer: {
        padding: 16,
        paddingBottom: 20,
        flexGrow: 1,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginVertical: 3,
    },
    userRow: {
        justifyContent: 'flex-end',
    },
    diyetisyenRow: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 20,
        minWidth: 60,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    userBubble: {
        backgroundColor: '#4CAF50',
        borderBottomRightRadius: 5,
        marginRight: 8,
    },
    diyetisyenBubble: {
        backgroundColor: '#ffffff',
        borderBottomLeftRadius: 5,
        marginLeft: 8,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    userMessageText: {
        color: '#ffffff',
    },
    diyetisyenMessageText: {
        color: '#333333',
    },
    sentImage: {
        width: 200,
        height: 200,
        borderRadius: 15,
        marginVertical: 2,
    },
    imageUploadOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timestamp: {
        fontSize: 11,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    userTimestamp: {
        color: 'rgba(255,255,255,0.8)',
    },
    diyetisyenTimestamp: {
        color: '#888888',
    },
    fullImage: {
        width: '90%',
        height: '80%',
        borderRadius: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e8e8e8',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#f8f8f8',
        borderRadius: 25,
        paddingHorizontal: 15,
        alignItems: 'flex-end',
        minHeight: 45,
        borderWidth: 1,
        borderColor: '#e8e8e8',
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 5,
        maxHeight: 100,
        fontSize: 15,
        color: '#333',
    },
    inputActions: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingBottom: 8,
    },
    sendButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 25,
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        shadowColor: '#4CAF50',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
    },
    sendButtonDisabled: {
        backgroundColor: '#a8d5aa',
        shadowOpacity: 0.1,
    },
    iconButton: {
        padding: 8,
        marginHorizontal: 2,
        borderRadius: 20,
    },
    iconButtonDisabled: {
        opacity: 0.5,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalHeader: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1,
    },
    closeButton: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 25,
        padding: 10,
    },
    dateHeader: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    dateHeaderContainer: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    dateHeaderText: {
        color: '#666',
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 50,
        marginTop: 100,
    },
    emptyIconContainer: {
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 40,
        padding: 20,
        marginBottom: 20,
    },
    emptyText: {
        color: '#666',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubText: {
        color: '#999',
        fontSize: 14,
        textAlign: 'center',
    },
});

export default Mesaj;