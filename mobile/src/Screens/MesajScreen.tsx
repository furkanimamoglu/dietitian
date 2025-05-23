import React, {useEffect, useState, useRef, useCallback, useMemo} from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    Text,
    KeyboardAvoidingView,
    Platform,
    Image,
    PermissionsAndroid,
    Modal,
    Pressable,
    StatusBar,
    ActivityIndicator,
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

    const flatListRef = useRef(null);
    const intervalRef = useRef(null);

    const fetchMessages = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('Token Bulunamadı');
                return;
            }

            const response = await fetch(`${config.apiUrl}/message/getMyMessages`, {
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

    const checkForNewMessages = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('Token Bulunamadı');
                return;
            }

            const response = await fetch(`${config.apiUrl}/message/getMyMessages`, {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 500) {
                return;
            }

            const data = await response.json();

            if (data && Array.isArray(data)) {
                setMessages(prevMessages => {
                    const currentMessageIds = new Set(prevMessages.map(msg => msg.id));

                    const newMessages = data.filter(msg => !currentMessageIds.has(msg.id));

                    if (newMessages.length > 0) {
                        console.log(`${newMessages.length} yeni mesaj bulundu`);
                        return [...prevMessages, ...newMessages];
                    }

                    return prevMessages;
                });
            }
        } catch (err) {
            console.error('Error: checkForNewMessages ', err);
        }
    };

    const fetchClientInfo = async () => {
        try {
            const response = await fetch(`${config.apiUrl}/client/getClientInfo`, {
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
        fetchClientInfo().then(response => {});
        fetchMessages().then(response => {});
        requestCameraPermission().then(response => {});

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

            const response = await fetch(`${config.apiUrl}/message/sendMessage`, {
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
            (response) => {
                setLoading(false);
                if (response.didCancel) {
                    console.log('Kullanıcı kamerayı iptal etti');
                } else if (response.errorCode) {
                    console.error('Kamera hatası:', response.errorMessage);
                } else {
                    const imageUri = response.assets?.[0]?.uri;
                    if (imageUri) {
                        const newMessage = {
                            id: Date.now().toString(),
                            from: 'user',
                            image: imageUri,
                            timestamp: getCurrentTime()
                        };
                        setMessages(prev => [...prev, newMessage]);
                    }
                }
            }
        );
    }, []);

    const openGallery = useCallback(() => {
        setLoading(true);
        launchImageLibrary(
            {
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 1000,
                maxHeight: 1000,
            },
            (response) => {
                setLoading(false);
                if (response.didCancel) {
                    console.log('Kullanıcı galeriyi iptal etti');
                } else if (response.errorCode) {
                    console.error('Galeri hatası:', response.errorMessage);
                } else {
                    const imageUri = response.assets?.[0]?.uri;
                    if (imageUri) {
                        const newMessage = {
                            id: Date.now().toString(),
                            from: 'user',
                            image: imageUri,
                            timestamp: getCurrentTime()
                        };
                        setMessages(prev => [...prev, newMessage]);
                    }
                }
            }
        );
    }, []);

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

        return (
            <View style={[styles.messageRow, isUser ? styles.userRow : styles.diyetisyenRow]}>
                <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.diyetisyenBubble]}>
                    {item.message && <Text style={styles.messageText}>{item.message}</Text>}

                    {/* item.image && (
                        <TouchableOpacity onPress={() => handleImagePress(item.image)} activeOpacity={0.8}>
                            <Image
                                source={{uri: item.image}}
                                style={styles.sentImage}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                    ) */}

                    <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.diyetisyenTimestamp]}>
                        {item.createdAt}
                    </Text>
                </View>
            </View>
        );
    }, [handleImagePress]);

    const ListHeaderComponent = useMemo(() => (
        <View style={styles.dateHeader}>
            <Text style={styles.dateHeaderText}>Bugün</Text>
        </View>
    ), []);

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#f57c00" barStyle="light-content"/>
            <Header navigation={navigation}/>

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
                        <Icon name="chat-outline" size={60} color="#ccc"/>
                        <Text style={styles.emptyText}>Henüz mesaj yok</Text>
                    </View>
                }
            />

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
                            style={styles.input}
                            multiline
                        />
                        {/*
                        <View style={styles.inputActions}>
                            <TouchableOpacity style={styles.iconButton} onPress={openCamera} disabled={loading}>
                                <Icon name="camera" size={24} color={loading ? "#ccc" : "#555"}/>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.iconButton} onPress={openGallery} disabled={loading}>
                                <Icon name="image" size={24} color={loading ? "#ccc" : "#555"}/>
                            </TouchableOpacity>
                        </View>
                        */}
                    </View>

                    <TouchableOpacity
                        onPress={sendMessage}
                        style={[styles.sendButton, input.trim() === '' && styles.sendButtonDisabled]}
                        disabled={input.trim() === '' || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" size="small"/>
                        ) : (
                            <Icon name="send" size={22} color="#fff"/>
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
                            <Icon name="close" size={24} color="#fff"/>
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
        backgroundColor: '#f5f5f7'
    },
    messagesContainer: {
        padding: 16,
        paddingBottom: 20,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginVertical: 4,
    },
    userRow: {
        justifyContent: 'flex-end',
    },
    diyetisyenRow: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '70%',
        padding: 10,
        borderRadius: 16,
        minWidth: 80,
    },
    userBubble: {
        backgroundColor: '#e1f5fe',
        borderBottomRightRadius: 4,
        marginRight: 8,
    },
    diyetisyenBubble: {
        backgroundColor: '#fff3e0',
        borderBottomLeftRadius: 4,
        marginLeft: 8,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
        color: '#333',
    },
    sentImage: {
        width: 200,
        height: 200,
        borderRadius: 12,
        marginVertical: 4,
    },
    timestamp: {
        fontSize: 11,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    userTimestamp: {
        color: '#78909c',
    },
    diyetisyenTimestamp: {
        color: '#bf8c5c',
    },
    fullImage: {
        width: '90%',
        height: '80%',
        borderRadius: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#f1f1f1',
        borderRadius: 20,
        paddingHorizontal: 10,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 5,
        maxHeight: 100,
        fontSize: 15,
    },
    inputActions: {
        flexDirection: 'row',
    },
    sendButton: {
        backgroundColor: '#f57c00',
        borderRadius: 25,
        width: 45,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 2,
    },
    sendButtonDisabled: {
        backgroundColor: '#f5ac71',
    },
    iconButton: {
        padding: 6,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginBottom: 5,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalHeader: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1,
    },
    closeButton: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 8,
    },
    dateHeader: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    dateHeaderText: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        color: '#666',
        fontSize: 12,
        fontWeight: '500',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 50,
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
        marginTop: 10,
    },
});

export default Mesaj;