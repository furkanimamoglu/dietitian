import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  Image,
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback
} from 'react-native';
import { Appbar } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import config from '../../config';

const screenWidth = Dimensions.get('window').width;

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

type Notification = {
  id: number;
  phoneNumber: string;
  isRead: boolean;
  message: string;
  createdAt: string;
  updatedAt: string;
};

export default function Header({ navigation }: Props) {
  const notificationCount = 3;
  const messageCount = 5;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerAnim] = useState(new Animated.Value(screenWidth));

  const [userName, setUserName] = useState<string>('Yükleniyor...');
  const [userProfile, setUserProfile] = useState<string>('');

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/client/getMyNotifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': await AsyncStorage.getItem('token') || ''
        }
      });
      const data = await response.json();
      if (response.ok) {
        setNotifications(data);
      } else {
        console.log('Bildirimler alınamadı:', data.message);
      }
    } catch (error) {
      console.error('Bildirim hatası:', error);
    }
  };

  useEffect(() => {
    const checkToken = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
                if (!token) {
                  console.log('Token bulunamadı, giriş ekranına yönlendiriliyor...');
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  });
                  return;
                } else {
                    console.log('Token bulundu, kontrol başarılı.');
                }
        } catch (error) {
            console.error('Hata:', error);
        }
    }

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
          setUserName(data.name || 'Bilinmiyor');
        } else {
          console.log('Kullanıcı bilgisi alınamadı:', data.message);
        }
      } catch (error) {
        console.error('Hata:', error);
      }
    };

    fetchClientInfo();
    checkToken();
    fetchNotifications();
  }, []);

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeDrawer = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/client/readMyAllNotifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': await AsyncStorage.getItem('token') || ''
        }
      });
      
      if (response.ok) {
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => ({
            ...notification,
            isRead: true
          }))
        );
      } else {
        console.log('Bildirimler okundu olarak işaretlenemedi');
      }
    } catch (error) {
      console.error('Bildirim okuma hatası:', error);
    }

    Animated.timing(drawerAnim, {
      toValue: screenWidth,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setDrawerOpen(false));
  };

  const canGoBack = navigation.canGoBack();

  return (
    <>
      <Appbar.Header style={styles.appbarContainer}>
        <View style={styles.appbarInner}>
          <View style={styles.leftSection}>
            {canGoBack && (
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-left" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => navigation.navigate('Profil')} style={styles.avatarWrapper}>
              <View style={styles.avatarContent}>
                <Image
                  source={{ uri: userProfile || 'https://i.pravatar.cc/101' }}
                  style={styles.avatar}
                />
                <Text style={styles.avatarLabel}>{userName}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.rightIconsWrapper}>
            <View style={styles.rightIcons}>
              <TouchableOpacity onPress={() => navigation.navigate('Mesaj')} style={styles.notificationWrapper}>
                <Icon name="message-outline" size={24} color="#ffffff" style={styles.icon} />
                {messageCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationText}>{messageCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={openDrawer} style={styles.notificationWrapper}>
                <Icon name="bell-outline" size={24} color="#ffffff" style={styles.icon} />
                {unreadNotificationsCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationText}>{unreadNotificationsCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Appbar.Header>

      {drawerOpen && (
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <View style={styles.fullScreen}>
            <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnim }] }]}>
              <View style={styles.drawerContent}>
                <Text style={styles.drawerTitle}>Bildirimler</Text>
                {notifications.map((notification) => (
                  <View key={notification.id} style={[
                    styles.notificationBox,
                    !notification.isRead && styles.unreadNotification
                  ]}>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationDate}>
                      {new Date(notification.createdAt).toLocaleDateString('tr-TR')}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  appbarContainer: {
    backgroundColor: '#f57c00',
    elevation: 4,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  appbarInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backButton: {
    marginRight: 8,
  },
  avatarWrapper: {
    marginLeft: 4,
  },
  avatarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff22',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 28,
    gap: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  rightIconsWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1,
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  icon: {
    marginLeft: 12,
  },
  notificationWrapper: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -2,
    backgroundColor: '#d32f2f',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  notificationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold'
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  drawer: {
    position: 'absolute',
    top: 60,
    right: 0,
    width: '80%',
    height: '100%',
    backgroundColor: '#fff',
    elevation: 10,
    zIndex: 101,
    padding: 16,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  drawerContent: {
    flex: 1,
    gap: 12,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#f57c00'
  },
  notificationBox: {
    backgroundColor: '#f3f3f3',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  unreadNotification: {
    backgroundColor: '#fff3e0',
    borderLeftWidth: 4,
    borderLeftColor: '#f57c00',
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: '#666',
  },
});
