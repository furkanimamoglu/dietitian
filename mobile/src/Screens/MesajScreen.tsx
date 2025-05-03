import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  Image,
  PermissionsAndroid,
  Modal,
  Pressable
} from 'react-native';
import Header from '../Components/Header';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const Mesaj = ({ navigation }) => {
  const [messages, setMessages] = useState([
    { from: 'diyetisyen', text: 'Merhaba, bugün nasılsın?' },
    { from: 'user', text: 'Merhaba hocam, gayet iyiyim. Siz nasılsınız?' },
  ]);

  const [input, setInput] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImageUri, setModalImageUri] = useState(null);

  useEffect(() => {
    requestCameraPermission();
  }, []);

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
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Kamera izni verildi');
      } else {
        console.log('Kamera izni reddedildi');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const sendMessage = () => {
    if (input.trim() === '') return;
    setMessages([...messages, { from: 'user', text: input }]);
    setInput('');
  };

  const openCamera = () => {
    launchCamera(
      {
        mediaType: 'photo',
        saveToPhotos: true,
      },
      (response) => {
        if (response.didCancel) {
          console.log('Kullanıcı kamerayı iptal etti');
        } else if (response.errorCode) {
          console.error('Kamera hatası:', response.errorMessage);
        } else {
          const imageUri = response.assets?.[0]?.uri;
          if (imageUri) {
            setMessages([...messages, { from: 'user', image: imageUri }]);
          }
        }
      }
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
      },
      (response) => {
        if (response.didCancel) {
          console.log('Kullanıcı galeriyi iptal etti');
        } else if (response.errorCode) {
          console.error('Galeri hatası:', response.errorMessage);
        } else {
          const imageUri = response.assets?.[0]?.uri;
          if (imageUri) {
            setMessages([...messages, { from: 'user', image: imageUri }]);
          }
        }
      }
    );
  };

  const handleImagePress = (uri) => {
    setModalImageUri(uri);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />

      <ScrollView style={styles.messagesContainer} contentContainerStyle={{ padding: 16 }}>
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[styles.messageRow, msg.from === 'user' ? styles.userRow : styles.diyetisyenRow]}
          >
            {msg.from === 'diyetisyen' && (
              <Image
                source={{ uri: 'https://i.pravatar.cc/101' }}
                style={styles.avatar}
              />
            )}
            <View
              style={[styles.messageBubble, msg.from === 'user' ? styles.userBubble : styles.diyetisyenBubble]}
            >
              {msg.text && <Text style={styles.messageText}>{msg.text}</Text>}
              {msg.image && (
                <TouchableOpacity onPress={() => handleImagePress(msg.image)}>
                  <Image source={{ uri: msg.image }} style={styles.sentImage} />
                </TouchableOpacity>
              )}
            </View>
            {msg.from === 'user' && (
              <Image
                source={{ uri: 'https://i.pravatar.cc/102' }}
                style={styles.avatar}
              />
            )}
          </View>
        ))}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
        style={styles.inputWrapper}
      >
        <TouchableOpacity style={styles.iconButton} onPress={openCamera}>
          <Icon name="camera" size={24} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={openGallery}>
          <Icon name="image" size={24} color="#555" />
        </TouchableOpacity>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Mesajınızı yazın..."
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Icon name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <Pressable style={styles.modalBackground} onPress={() => setModalVisible(false)}>
          <Image source={{ uri: modalImageUri }} style={styles.fullImage} resizeMode="contain" />
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  messagesContainer: {
    flex: 1,
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
    fontSize: 14,
  },
  sentImage: {
    width: 160,
    height: 160,
    borderRadius: 12,
    marginTop: 4,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f1f1f1',
    marginHorizontal: 10,
  },
  sendButton: {
    backgroundColor: '#f57c00',
    borderRadius: 20,
    padding: 10,
  },
  iconButton: {
    padding: 6,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center'
  },
});

export default Mesaj;
