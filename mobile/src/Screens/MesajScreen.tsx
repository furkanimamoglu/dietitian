import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const Mesaj = ({ navigation }) => {
  // Örnek avatar URL'leri - gerçek projenizde bunlar kullanıcı profillerinden gelmeli
  const DIYETISYEN_AVATAR = 'https://i.pravatar.cc/101';
  const USER_AVATAR = 'https://i.pravatar.cc/102';

  // State tanımlamaları
  const [messages, setMessages] = useState([
    { id: '1', from: 'diyetisyen', text: 'Merhaba, bugün nasılsınız?', timestamp: '09:10' },
    { id: '2', from: 'user', text: 'Merhaba hocam, gayet iyiyim. Siz nasılsınız?', timestamp: '09:12' },
    { id: '3', from: 'diyetisyen', text: 'Ben de iyiyim teşekkür ederim. Geçen hafta verdiğim diyet programını uyguladınız mı?', timestamp: '09:13' },
    { id: '4', from: 'user', text: 'Evet, büyük ölçüde uyguladım. Sadece Pazar günü dışarıda yemek yediğimde biraz program dışına çıktım.', timestamp: '09:15' },
  ]);

  const [input, setInput] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImageUri, setModalImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  // Otomatik scroll için ref
  const flatListRef = useRef(null);

  // Komponent yüklendiğinde kamera izinlerini sor
  useEffect(() => {
    requestCameraPermission();
  }, []);

  // Yeni mesaj geldiğinde en alta kaydır
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Kamera izinlerini iste
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

  const sendMessage = useCallback(() => {
    if (input.trim() === '') return;

    const newMessage = {
      id: Date.now().toString(),
      from: 'user',
      text: input.trim(),
      timestamp: getCurrentTime()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

//     setTimeout(() => {
//       const replyMessage = {
//         id: (Date.now() + 1).toString(),
//         from: 'diyetisyen',
//         text: 'Mesajınızı aldım, teşekkürler! En kısa sürede dönüş yapacağım.',
//         timestamp: getCurrentTime()
//       };
//       setMessages(prev => [...prev, replyMessage]);
//     }, 1000);
  }, [input]);

  // Kamera aç
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

  // Galeri aç
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

  // Resim modalını aç
  const handleImagePress = useCallback((uri) => {
    setModalImageUri(uri);
    setModalVisible(true);
  }, []);

  // Geçerli saati al
  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  // Mesaj balonu render - optimize edilmiş
  const renderMessageItem = useCallback(({ item }) => {
    const isUser = item.from === 'user';

    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.diyetisyenRow]}>
        {!isUser && (
          <Image
            source={{ uri: DIYETISYEN_AVATAR }}
            style={styles.avatar}
          />
        )}

        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.diyetisyenBubble]}>
          {item.text && <Text style={styles.messageText}>{item.text}</Text>}

          {item.image && (
            <TouchableOpacity onPress={() => handleImagePress(item.image)} activeOpacity={0.8}>
              <Image
                source={{ uri: item.image }}
                style={styles.sentImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}

          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.diyetisyenTimestamp]}>
            {item.timestamp}
          </Text>
        </View>

        {isUser && (
          <Image
            source={{ uri: USER_AVATAR }}
            style={styles.avatar}
          />
        )}
      </View>
    );
  }, [handleImagePress]);

  // Mesaj listesi için header
  const ListHeaderComponent = useMemo(() => (
    <View style={styles.dateHeader}>
      <Text style={styles.dateHeaderText}>Bugün</Text>
    </View>
  ), []);

  // Render - KeyboardAvoidingView ile klavye açılınca kaymayı önlüyoruz
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#f57c00" barStyle="light-content" />
      <Header navigation={navigation} />

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
            <Icon name="chat-outline" size={60} color="#ccc" />
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

            <View style={styles.inputActions}>
              <TouchableOpacity style={styles.iconButton} onPress={openCamera} disabled={loading}>
                <Icon name="camera" size={24} color={loading ? "#ccc" : "#555"} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconButton} onPress={openGallery} disabled={loading}>
                <Icon name="image" size={24} color={loading ? "#ccc" : "#555"} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={sendMessage}
            style={[styles.sendButton, input.trim() === '' && styles.sendButtonDisabled]}
            disabled={input.trim() === '' || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Icon name="send" size={22} color="#fff" />
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
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <Image source={{ uri: modalImageUri }} style={styles.fullImage} resizeMode="contain" />
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
    shadowOffset: { width: 0, height: 1 },
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