import React, {useEffect, useRef, useState} from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
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

export default function Header({navigation}: Props) {
    const [messageCount, setMessageCount] = useState<number>(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerAnim] = useState(new Animated.Value(screenWidth));
    const [userName, setUserName] = useState<string>('Yükleniyor...');

    const bellShakeAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        if (unreadNotificationsCount > 0) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(bellShakeAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                        easing: Easing.linear,
                    }),
                    Animated.timing(bellShakeAnim, {
                        toValue: -1,
                        duration: 300,
                        useNativeDriver: true,
                        easing: Easing.linear,
                    }),
                    Animated.timing(bellShakeAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                        easing: Easing.linear,
                    }),
                ]),
                {iterations: 2}
            ).start();
        }
    }, [unreadNotificationsCount]);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
                easing: Easing.out(Easing.back(1.7)),
            }),
        ]).start();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await fetch(`${config[config.environment].apiUrl}/client/getMyNotifications`, {
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

    const fetchUnreadMessages = async () => {
        try {
            const response = await fetch(`${config[config.environment].apiUrl}/message/getMyUnreadMessageCount`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': await AsyncStorage.getItem('token') || ''
                }
            });
            const data = await response.json();
            if (response.ok) {
                setMessageCount(data.count || 0);
            } else {
                console.log('Okunmamış mesaj sayısı alınamadı:', data.message);
            }
        } catch (error) {
            console.error('Mesaj sayısı hatası:', error);
        }
    };

    const checkToken = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.log('Token bulunamadı, giriş ekranına yönlendiriliyor...');
                navigation.reset({
                    index: 0,
                    routes: [{name: 'Login'}],
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
            const response = await fetch(`${config[config.environment].apiUrl}/client/getClientInfo`, {
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

    useEffect(() => {
        fetchUnreadMessages();
        fetchClientInfo();
        checkToken();
        fetchNotifications();

        const interval = setInterval(() => {
            fetchUnreadMessages();
            fetchNotifications();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const unreadNotificationsCount = (notifications || []).filter(n => !n.isRead).length;

    const openDrawer = () => {
        setDrawerOpen(true);
        Animated.spring(drawerAnim, {
            toValue: 0,
            speed: 12,
            bounciness: 8,
            useNativeDriver: false,
        }).start();
    };

    const closeDrawer = async () => {
        try {
            const response = await fetch(`${config[config.environment].apiUrl}/client/readMyAllNotifications`, {
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

    const canGoBack = (() => {
        try {
            return navigation && navigation.canGoBack();
        } catch (error) {
            console.log('Navigation canGoBack error:', error);
            return false;
        }
    })();

    const EmptyNotifications = () => (
        <View style={styles.emptyNotificationsContainer}>
            <Icon name="bell-off-outline" size={50} color="#ddd"/>
            <Text style={styles.emptyNotificationsText}>Henüz bildiriminiz yok</Text>
        </View>
    );

    const formatNotificationDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();

        if (date.toDateString() === now.toDateString()) {
            return `Bugün ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
        }

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return `Dün ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
        }

        return date.toLocaleDateString('tr-TR');
    };

    return (
        <>
            {Platform.OS === 'android' ? (
                <StatusBar backgroundColor="#ff8c00" barStyle="light-content"/>
            ) : (
                <StatusBar barStyle="light-content"/>
            )}
            <Animated.View style={{
                opacity: fadeAnim,
                transform: [{scale: scaleAnim}]
            }}>
                <LinearGradient
                    colors={['#ff8c00', '#fc9e21', '#ffb347']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.appbarContainer}>
                    <View style={styles.appbarInner}>
                        <View style={styles.leftSection}>
                            {canGoBack && (
                                <TouchableOpacity
                                    onPress={() => navigation.goBack()}
                                    style={styles.backButton}
                                    activeOpacity={0.7}>
                                    <View style={styles.iconBackground}>
                                        <Icon name="arrow-left" size={22} color="#fff"/>
                                    </View>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Profil')}
                                style={styles.avatarWrapper}
                                activeOpacity={0.8}>
                                <View style={styles.avatarContent}>
                                    <View style={styles.avatarPlaceholder}>
                                        <Text style={styles.avatarInitial}>{userName?.charAt(0).toUpperCase()}</Text>
                                    </View>
                                    <Text style={styles.avatarLabel} numberOfLines={1}>
                                        {userName}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.rightIconsWrapper}>
                            <View style={styles.rightIcons}>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Mesaj')}
                                    style={styles.iconButton}
                                    activeOpacity={0.7}>
                                    <View style={styles.iconBackground}>
                                        <Icon name="message-outline" size={22} color="#ffffff"/>
                                    </View>
                                    {messageCount > 0 && (
                                        <Animated.View
                                            style={[
                                                styles.notificationBadge,
                                                {transform: [{scale: messageCount > 0 ? 1.1 : 1}]}
                                            ]}>
                                            <Text style={styles.notificationText}>{messageCount}</Text>
                                        </Animated.View>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={openDrawer}
                                    style={styles.iconButton}
                                    activeOpacity={0.7}>
                                    <View style={styles.iconBackground}>
                                        <Animated.View style={{
                                            transform: [{
                                                rotate: bellShakeAnim.interpolate({
                                                    inputRange: [-1, 1],
                                                    outputRange: ['-20deg', '20deg']
                                                })
                                            }]
                                        }}>
                                            <Icon name="bell-outline" size={22} color="#ffffff"/>
                                        </Animated.View>
                                    </View>
                                    {unreadNotificationsCount > 0 && (
                                        <Animated.View
                                            style={[
                                                styles.notificationBadge,
                                                {transform: [{scale: unreadNotificationsCount > 0 ? 1.1 : 1}]}
                                            ]}>
                                            <Text style={styles.notificationText}>{unreadNotificationsCount}</Text>
                                        </Animated.View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </Animated.View>

            {drawerOpen && (
                <TouchableWithoutFeedback onPress={closeDrawer}>
                    <View style={styles.fullScreen}>
                        <Animated.View style={[
                            styles.overlay,
                            {
                                opacity: drawerAnim.interpolate({
                                    inputRange: [0, screenWidth],
                                    outputRange: [0.5, 0]
                                })
                            }
                        ]}/>
                        <Animated.View
                            style={[
                                styles.drawer,
                                {transform: [{translateX: drawerAnim}]}
                            ]}>
                            <View style={styles.drawerHeader}>
                                <Text style={styles.drawerTitle}>Bildirimler</Text>
                                <TouchableOpacity
                                    onPress={closeDrawer}
                                    style={styles.closeButton}>
                                    <Icon name="close" size={22} color="#666"/>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.drawerContent}>
                                {notifications.length > 0 ? (
                                    notifications.map((notification, index) => (
                                        <View
                                            key={notification.id}
                                            style={[
                                                styles.notificationBox,
                                                !notification.isRead && styles.unreadNotification
                                            ]}>
                                            <View style={styles.notificationIconContainer}>
                                                <Icon
                                                    name={!notification.isRead ? "bell-ring-outline" : "bell-outline"}
                                                    size={22}
                                                    color={!notification.isRead ? "#fc9e21" : "#999"}
                                                />
                                            </View>
                                            <View style={styles.notificationContent}>
                                                <Text style={[
                                                    styles.notificationMessage,
                                                    !notification.isRead && styles.unreadText
                                                ]}>
                                                    {notification.message}
                                                </Text>
                                                <Text style={styles.notificationDate}>
                                                    {formatNotificationDate(notification.createdAt)}
                                                </Text>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <EmptyNotifications/>
                                )}
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
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 8,
            },
        }),
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        overflow: Platform.OS === 'ios' ? 'hidden' : 'visible',
    },
    appbarInner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 12,
    },
    avatarWrapper: {
        marginLeft: 4,
    },
    avatarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 28,
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    avatarLabel: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        maxWidth: 120,
    },
    rightIconsWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        flex: 1,
    },
    rightIcons: {
        flexDirection: 'row',
        gap: 16,
    },
    iconButton: {
        position: 'relative',
    },
    iconBackground: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    notificationBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#d32f2f',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.3,
                shadowRadius: 2,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    notificationText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    fullScreen: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 100,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
    },
    drawer: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '80%',
        height: '100%',
        backgroundColor: '#fff',
        elevation: 10,
        zIndex: 101,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: {width: -2, height: 0},
                shadowOpacity: 0.2,
                shadowRadius: 5,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    drawerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    drawerContent: {
        flex: 1,
        padding: 16,
    },
    drawerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fc9e21',
    },
    notificationBox: {
        flexDirection: 'row',
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    unreadNotification: {
        backgroundColor: '#fff3e0',
        borderLeftWidth: 4,
        borderLeftColor: '#fc9e21',
    },
    notificationIconContainer: {
        width: 40,
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationMessage: {
        fontSize: 14,
        marginBottom: 6,
        color: '#333',
    },
    unreadText: {
        fontWeight: '600',
        color: '#000',
    },
    notificationDate: {
        fontSize: 12,
        color: '#888',
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fff',
    },
    avatarInitial: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptyNotificationsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyNotificationsText: {
        marginTop: 10,
        color: '#999',
        fontSize: 16,
    },
});
