import React, {useEffect, useState} from 'react';
import {Alert, FlatList, Modal, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Avatar, Button, Card, Divider, IconButton, List, ProgressBar, Surface, Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';
import Header from '../Components/Header';
import BottomNavbar from '../Components/BottomNavbar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';

type Props = NativeStackScreenProps<RootStackParamList, 'AnaSayfa'>;

const waterContainers = [
    {name: 'Bardak', icon: 'cup', amount: 200, color: '#2196F3'},
    {name: 'Büyük Bardak', icon: 'cup', amount: 300, color: '#03A9F4'},
    {name: 'Şişe', icon: 'bottle-soda', amount: 500, color: '#00BCD4'},
    {name: 'Büyük Şişe', icon: 'bottle-soda-outline', amount: 1000, color: '#009688'},
    {name: 'Sürahi', icon: 'bottle-tonic', amount: 1500, color: '#4CAF50'},
];

const AnaSayfa = ({navigation}: Props) => {

    const [userName, setUserName] = useState<string>('Yükleniyor...');
    const [measurementInfo, setMeasurementInfo] = useState<{
        kilo: number;
        yag: number;
        kas: number;
        su: number;
    } | null>(null);
    const [closestAppointment, setClosestAppointment] = useState<Date | null>(null);
    const [showKVKKModal, setShowKVKKModal] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [waterIntake, setWaterIntake] = useState<Array<{
        id: string,
        client_id: string,
        date: string,
        amount_ml: number
    }>>([]);
    const [waterLoading, setWaterLoading] = useState<boolean>(false);
    const [showWaterModal, setShowWaterModal] = useState<boolean>(false);
    const [showWaterListModal, setShowWaterListModal] = useState<boolean>(false);
    const [dailyWaterGoal, setDailyWaterGoal] = useState<number>(2500);
    const [deletingWaterId, setDeletingWaterId] = useState<string | null>(null);
    const [acceptedUserAgreement, setAcceptedUserAgreement] = useState<boolean>(false);
    const [acceptedKVKK, setAcceptedKVKK] = useState<boolean>(false);
    const [acceptedNotifications, setAcceptedNotifications] = useState<boolean>(false);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                fetchClientInfo(),
                fetchMeasurementInfo(),
                fetchAppointmentInfo(),
                fetchWaterIntake()
            ]);
        } catch (error) {
            console.error('Yenileme hatası:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const approveKVKK = async () => {
        if (!acceptedUserAgreement || !acceptedKVKK || !acceptedNotifications) {
            setAcceptedUserAgreement(true);
            setAcceptedKVKK(true);
            setAcceptedNotifications(true);
            return;
        }

        try {
            const response = await fetch(`${config[config.environment].apiUrl}/client/updateApprovalSettings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': await AsyncStorage.getItem('token') || ''
                },
                body: JSON.stringify({
                    kvkkApproval: true,
                    kullaniciSozlesmesiApproval: true,
                    SMSApproval: acceptedNotifications,
                    MailApproval: acceptedNotifications,
                    NotificationApproval: acceptedNotifications
                })
            });

            if (response.ok) {
                setShowKVKKModal(false);
            } else {
                let errorMsg = 'Onay bilgileri güncellenirken bir hata oluştu.';
                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const data = await response.json();
                        errorMsg = data.message || errorMsg;
                    } else {
                        // JSON olmayan yanıt için
                        const text = await response.text();
                        console.log('Sunucu yanıtı (JSON değil):', text);
                    }
                } catch (parseError) {
                    console.log('Yanıt çözümleme hatası:', parseError);
                }

                console.log('Onay güncelleme hatası:', errorMsg);
                Alert.alert('Hata', errorMsg);
            }
        } catch (error) {
            console.error('Onay güncelleme hatası:', error);
            Alert.alert('Hata', 'Bir bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol ediniz.');
        }
    };

    const rejectKVKK = async () => {
        try {
            await AsyncStorage.removeItem('token');
            navigation.reset({
                index: 0,
                routes: [{name: 'Login'}],
            });
        } catch (error) {
            console.error('Çıkış yapılırken hata:', error);
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
                setUserName(data.name || 'Bilinmiyor');
                if (data.dailyWaterIntake && typeof data.dailyWaterIntake === 'number') {
                    setDailyWaterGoal(data.dailyWaterIntake);
                }

                // KVKK ve kullanıcı sözleşmesi durumunu kontrol et
                if (!data.kvkkApproval || !data.kullaniciSozlesmesiApproval) {
                    setShowKVKKModal(true);
                    setAcceptedUserAgreement(!!data.kullaniciSozlesmesiApproval);
                    setAcceptedKVKK(!!data.kvkkApproval);
                    setAcceptedNotifications(!!(data.SMSApproval && data.MailApproval && data.NotificationApproval));
                } else {
                    setShowKVKKModal(false);
                }
            } else {
                console.log('Kullanıcı bilgisi alınamadı:', data.message);
            }
        } catch (error) {
            console.error('Hata:', error);
        }
    };

    const fetchMeasurementInfo = async () => {
        try {
            const response = await fetch(`${config[config.environment].apiUrl}/client/getMyLatestMeasurement`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': await AsyncStorage.getItem('token') || ''
                }
            });
            const data = await response.json();
            console.log(data);
            if (response.ok) {
                setMeasurementInfo({
                    kilo: data.kilo,
                    yag: data.yag,
                    kas: data.kas,
                    su: data.su
                });
            } else {
                console.log('Ölçüm bilgisi alınamadı:', data.message);
            }
        } catch (error) {
            console.error('Hata:', error);
        }
    };

    const fetchAppointmentInfo = async () => {
        try {
            const response = await fetch(`${config[config.environment].apiUrl}/appointment/fetchClientAppointments`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': await AsyncStorage.getItem('token') || ''
                }
            });

            const data = await response.json();

            if (response.ok) {
                const approvedAppointments = data.filter((appt: { status: string; }) => appt.status === 'approved');

                if (approvedAppointments.length > 0 && approvedAppointments[0].start) {
                    setClosestAppointment(new Date(approvedAppointments[0].start));
                } else {
                    setClosestAppointment(null);
                }
            } else {
                console.log('Kullanıcı bilgisi alınamadı:', data.message);
            }
        } catch (error) {
            console.error('Hata:', error);
        }
    };

    // Format date to YYYY-MM-DD for API
    const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const fetchWaterIntake = async () => {
        try {
            setWaterLoading(true);
            const today = new Date();
            const formattedDate = formatDateForAPI(today);

            const response = await fetch(`${config[config.environment].apiUrl}/nutrition/getClientWater?start_date=${formattedDate}&end_date=${formattedDate}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': await AsyncStorage.getItem('token') || ''
                }
            });

            if (response.ok) {
                const data = await response.json();
                setWaterIntake(data);
            } else {
                console.log('Su tüketimi bilgisi alınamadı');
            }
        } catch (error) {
            console.error('Su tüketimi verisi yüklenirken hata:', error);
        } finally {
            setWaterLoading(false);
        }
    };

    const addWaterIntake = async (amount: number) => {
        try {
            const newTotal = totalWaterIntake + amount;

            if (newTotal > dailyWaterGoal * 2) {
                Alert.alert(
                    'Uyarı',
                    `Günlük hedefin 2 katından fazla su ekleyemezsin. Maksimum ${dailyWaterGoal * 2 - totalWaterIntake} ml daha ekleyebilirsin.`,
                    [{text: 'Tamam', style: 'cancel'}]
                );
                return;
            }

            const response = await fetch(`${config[config.environment].apiUrl}/nutrition/addClientWater`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': await AsyncStorage.getItem('token') || ''
                },
                body: JSON.stringify({amount})
            });

            if (response.ok) {
                // Refresh water intake data
                fetchWaterIntake();
                setShowWaterModal(false);
            } else {
                Alert.alert('Hata', 'Su tüketimi eklenirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Su tüketimi eklenirken hata:', error);
            Alert.alert('Hata', 'Bağlantı hatası. Lütfen tekrar deneyin.');
        }
    };

    const deleteWaterIntake = async (waterId: string) => {
        try {
            setDeletingWaterId(waterId);
            const response = await fetch(`${config[config.environment].apiUrl}/nutrition/deleteClientWater?water_id=${waterId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': await AsyncStorage.getItem('token') || ''
                }
            });

            if (response.ok) {
                setWaterIntake(prev => prev.filter(item => item.id !== waterId));
                Alert.alert('Başarılı', 'Su tüketimi kaydı silindi.');
            } else {
                Alert.alert('Hata', 'Su tüketimi silinirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Su tüketimi silinirken hata:', error);
            Alert.alert('Hata', 'Bağlantı hatası. Lütfen tekrar deneyin.');
        } finally {
            setDeletingWaterId(null);
        }
    };

    // Calculate total water intake
    const totalWaterIntake = waterIntake.reduce((sum, item) => sum + item.amount_ml, 0);
    const waterPercentage = Math.min(Math.round((totalWaterIntake / dailyWaterGoal) * 100), 100);

    useEffect(() => {
        fetchAppointmentInfo();
        fetchMeasurementInfo();
        fetchClientInfo();
        fetchWaterIntake();
    }, []);

    const todayDate = new Date().toLocaleDateString('tr-TR', {weekday: 'long', day: 'numeric', month: 'long'});

    const weeklyProgress = [
        {day: "Pzt", value: 65},
        {day: "Sal", value: 68},
        {day: "Çar", value: 67},
        {day: "Per", value: 69},
        {day: "Cum", value: 70},
        {day: "Cmt", value: 70},
        {day: "Paz", value: 70}
    ];

    const maxValue = Math.max(...weeklyProgress.map(item => item.value));

    // Format time for display
    const formatTime = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'});
    };

    return (
        <View style={styles.container}>
            <Header navigation={navigation}/>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#fc9e21']}
                        tintColor={'#fc9e21'}
                    />
                }
            >
                {/* Sağlık Göstergeleri */}
                <Surface style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <View style={[styles.statIconContainer, {backgroundColor: '#e8f5e9'}]}>
                            <Icon name="weight-kilogram" size={22} color="#2e7d32"/>
                        </View>
                        <Text style={styles.statValue}>{measurementInfo?.kilo ?? '-'} kg</Text>
                        <Text style={styles.statLabel}>Ağırlık</Text>
                    </View>

                    <View style={styles.statItem}>
                        <View style={[styles.statIconContainer, {backgroundColor: '#e3f2fd'}]}>
                            <Icon name="arm-flex" size={22} color="#1976d2"/>
                        </View>
                        <Text style={styles.statValue}>%{measurementInfo?.kas ?? '-'}</Text>
                        <Text style={styles.statLabel}>Kas</Text>
                    </View>

                    <View style={styles.statItem}>
                        <View style={[styles.statIconContainer, {backgroundColor: '#fff3e0'}]}>
                            <Icon name="chart-bell-curve" size={22} color="#f57c00"/>
                        </View>
                        <Text style={styles.statValue}>%{measurementInfo?.yag ?? '-'}</Text>
                        <Text style={styles.statLabel}>Yağ</Text>
                    </View>

                    <View style={styles.statItem}>
                        <View style={[styles.statIconContainer, {backgroundColor: '#e0f7fa'}]}>
                            <Icon name="water-percent" size={22} color="#0288d1"/>
                        </View>
                        <Text style={styles.statValue}>%{measurementInfo?.su ?? '-'}</Text>
                        <Text style={styles.statLabel}>Su</Text>
                    </View>
                </Surface>

                {/* Motivasyon Kartı */}
                <Surface style={styles.motivationCard}>
                    <Icon name="star-circle" size={36} color="#fff" style={styles.motivationIcon}/>
                    <Text style={styles.motivationText}>
                        "Küçük adımlar büyük değişimlerin başlangıcıdır. Bugün attığın her adım, yarın daha sağlıklı bir
                        sen için."
                    </Text>
                </Surface>

                <Card style={styles.card}>
                    <Card.Title title="Gelecek Randevu Tarihiniz"/>
                    <Card.Content>
                        <View style={styles.randevuBilgi}>
                            <Avatar.Icon size={48} icon="calendar" style={styles.randevuIcon}/>
                            <View style={styles.randevuDetay}>
                                <Text style={styles.randevuTarih}>
                                    {closestAppointment
                                        ? closestAppointment.toLocaleDateString('tr-TR')
                                        : 'Randevunuz bulunmamaktadır.'}
                                </Text>
                                <Text style={styles.randevuSaat}>
                                    {closestAppointment
                                        ? closestAppointment.toLocaleTimeString('tr-TR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })
                                        : ' '}
                                </Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Su Tüketimi Kartı */}
                <Surface style={styles.waterCard}>
                    <View style={styles.waterHeader}>
                        <View style={styles.waterInfo}>
                            <Icon name="water" size={28} color="#0288d1"/>
                            <View style={{marginLeft: 12}}>
                                <Text style={styles.waterTitle}>Günlük Su Tüketimi</Text>
                                <Text style={styles.waterTarget}>{totalWaterIntake} / {dailyWaterGoal} ml</Text>
                            </View>
                        </View>
                        <Text style={styles.waterPercentage}>{waterPercentage}%</Text>
                    </View>

                    <View style={styles.waterMeterContainer}>
                        <ProgressBar
                            progress={waterPercentage / 100}
                            color="#0288d1"
                            style={styles.waterMeter}
                        />
                    </View>

                    <View style={styles.waterBottles}>
                        {waterContainers.slice(0, 5).map((container, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.waterBottleContainer}
                                onPress={() => addWaterIntake(container.amount)}
                            >
                                <Icon
                                    name={container.icon}
                                    size={24}
                                    color={container.color}
                                />
                                <Text style={{color: container.color, fontSize: 12}}>{container.amount}ml</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Water entries preview */}
                    {waterIntake.length > 0 && (
                        <View style={styles.waterEntriesPreview}>
                            <Divider style={{marginVertical: 12}}/>
                            <Text style={styles.waterEntriesTitle}>Son Eklenenler</Text>

                            {waterIntake.slice(0, 2).map((item) => (
                                <View key={item.id} style={styles.waterEntryItem}>
                                    <View style={styles.waterEntryInfo}>
                                        <Icon name="cup-water" size={16} color="#0288d1"/>
                                        <Text style={styles.waterEntryText}>
                                            {item.amount_ml} ml • {formatTime(item.date)}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => deleteWaterIntake(item.id)}
                                        disabled={deletingWaterId === item.id}
                                    >
                                        <Icon
                                            name="delete-outline"
                                            size={18}
                                            color="#F44336"
                                            style={{opacity: deletingWaterId === item.id ? 0.5 : 1}}
                                        />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {waterIntake.length > 2 && (
                                <Button
                                    mode="text"
                                    onPress={() => setShowWaterListModal(true)}
                                    style={{marginTop: 8}}
                                    labelStyle={{fontSize: 12}}
                                    icon="chevron-down"
                                    contentStyle={{flexDirection: 'row-reverse'}}
                                >
                                    Tümünü Gör
                                </Button>
                            )}
                        </View>
                    )}
                </Surface>

                {/* Alt boşluk */}
                <View style={styles.bottomSpacer}/>
            </ScrollView>

            {/* Water List Modal */}
            <Modal
                visible={showWaterListModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowWaterListModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.waterListModalContainer}>
                        <View style={styles.waterListModalHeader}>
                            <Text style={styles.waterListModalTitle}>Bugünkü Su Tüketimi</Text>
                            <IconButton
                                icon="close"
                                size={20}
                                onPress={() => setShowWaterListModal(false)}
                            />
                        </View>

                        <Divider/>

                        {waterIntake.length === 0 ? (
                            <Text style={styles.emptyListText}>Bugün henüz su tüketimi kaydedilmemiş.</Text>
                        ) : (
                            <FlatList
                                data={waterIntake}
                                keyExtractor={(item) => item.id}
                                renderItem={({item}) => (
                                    <List.Item
                                        title={`${item.amount_ml} ml`}
                                        description={`Saat: ${formatTime(item.date)}`}
                                        left={props => <List.Icon {...props} icon="water" color="#0288d1"/>}
                                        right={props => (
                                            <IconButton
                                                icon="delete-outline"
                                                iconColor="#F44336"
                                                size={20}
                                                onPress={() => deleteWaterIntake(item.id)}
                                                disabled={deletingWaterId === item.id}
                                                style={{opacity: deletingWaterId === item.id ? 0.5 : 1}}
                                            />
                                        )}
                                    />
                                )}
                                ItemSeparatorComponent={() => <Divider/>}
                                style={styles.waterListModalContent}
                            />
                        )}

                        <View style={styles.waterListModalFooter}>
                            <Text style={styles.waterListModalTotal}>
                                Toplam: <Text
                                style={{fontWeight: 'bold'}}>{totalWaterIntake} ml</Text> ({waterPercentage}%)
                            </Text>
                            <Button
                                mode="contained"
                                onPress={() => setShowWaterListModal(false)}
                                style={{backgroundColor: '#0288d1'}}
                            >
                                Kapat
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* KVKK Modal */}
            <Modal
                visible={showKVKKModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {}}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Sözleşmeler</Text>

                        <View style={styles.agreementBoxesContainer}>
                            {/* Kullanıcı Sözleşmesi Kutusu */}
                            <View style={styles.agreementBoxWrapper}>
                                <Text style={styles.agreementBoxTitle}>Kullanıcı Sözleşmesi</Text>
                                <View style={styles.agreementBox}>
                                    <ScrollView style={styles.agreementScrollView}>
                                        <Text style={styles.modalText}>
                                            Kullanıcı Sözleşmesi
                                            {'\n\n'}
                                            Bu Kullanıcı Sözleşmesi ("Sözleşme"), uygulamamızı kullanımınızı düzenleyen koşulları içermektedir. Uygulamayı kullanarak bu sözleşmeyi kabul etmiş sayılırsınız.
                                            {'\n\n'}
                                            1. Hizmet Kullanımı
                                            {'\n'}
                                            Uygulamamız, beslenme ve diyet hizmetleri kapsamında danışmanlık, takip ve bilgilendirme amaçlarıyla sağlanmaktadır. Hizmetlerimizi yalnızca yasal amaçlar için ve bu sözleşmede belirtilen koşullara uygun olarak kullanmayı kabul ediyorsunuz.
                                            {'\n\n'}
                                            2. Hesap Güvenliği
                                            {'\n'}
                                            Hesabınızın güvenliğinden ve hesabınız altında gerçekleşen tüm etkinliklerden siz sorumlusunuz. Şifrenizi güvende tutmak ve herhangi bir güvenlik ihlali durumunda derhal bize bildirmek sizin sorumluluğunuzdadır.
                                            {'\n\n'}
                                            3. Kullanıcı İçeriği
                                            {'\n'}
                                            Uygulama içerisinde paylaştığınız tüm içeriklerden (veriler, bilgiler, dosyalar vb.) siz sorumlusunuz. Telif hakkı, ticari marka veya başkalarının haklarını ihlal eden içerikler paylaşmamayı kabul ediyorsunuz.
                                            {'\n\n'}
                                            4. Ücretlendirme ve Ödemeler
                                            {'\n'}
                                            Uygulama içerisindeki bazı özellikler ve hizmetler ücretli olabilir. Ücretli hizmetlerden yararlanabilmek için ilgili ücretin tam ve zamanında ödenmesi gerekmektedir.
                                        </Text>
                                    </ScrollView>
                                </View>
                            </View>

                            {/* KVKK Aydınlatma Metni Kutusu */}
                            <View style={styles.agreementBoxWrapper}>
                                <Text style={styles.agreementBoxTitle}>Gizlilik Politikası</Text>
                                <View style={styles.agreementBox}>
                                    <ScrollView style={styles.agreementScrollView}>
                                        <Text style={styles.modalText}>
                                            Gizlilik Politikası kapsamında, kişisel verilerinizin işlenmesi,
                                            saklanması ve kullanılması hakkında aşağıdaki bilgileri siz değerli kullanıcılarımızla
                                            paylaşmak isteriz.
                                            {'\n\n'}
                                            Uygulamamız, sağlık verilerinizi, beslenme alışkanlıklarınızı, fiziksel aktivitelerinizi
                                            ve sizinle ilgili diğer kişisel bilgileri, size özel hizmet sunabilmek amacıyla
                                            toplamakta ve işlemektedir.
                                            {'\n\n'}
                                            Kişisel verileriniz, sadece uygulama içerisindeki hizmetlerin sunulması, iyileştirilmesi
                                            ve kişiselleştirilmesi amacıyla kullanılacak olup, açık rızanız olmadan üçüncü kişilerle
                                            paylaşılmayacaktır.
                                            {'\n\n'}
                                            Kişisel verilerinizin güvenliği için gerekli tüm teknik ve idari tedbirler alınmıştır.
                                            Sahip olduğunuz haklar:
                                            {'\n\n'}
                                            - Kişisel verilerinizin işlenip işlenmediğini öğrenme
                                            {'\n'}
                                            - Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme
                                            {'\n'}
                                            - Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp
                                            kullanılmadığını öğrenme
                                        </Text>
                                    </ScrollView>
                                </View>
                            </View>
                        </View>

                        <View style={styles.checkboxesContainer}>
                            <View style={styles.checkboxContainer}>
                                <TouchableOpacity
                                    style={styles.checkboxTouchable}
                                    onPress={() => setAcceptedUserAgreement(!acceptedUserAgreement)}
                                >
                                    <Icon
                                        name={acceptedUserAgreement ? "checkbox-marked" : "checkbox-blank-outline"}
                                        size={24}
                                        color={acceptedUserAgreement ? "#2e7d32" : "#757575"}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.checkboxLabel}>
                                    Kullanıcı Sözleşmesini okudum ve kabul ediyorum.
                                </Text>
                            </View>

                            <View style={styles.checkboxContainer}>
                                <TouchableOpacity
                                    style={styles.checkboxTouchable}
                                    onPress={() => setAcceptedKVKK(!acceptedKVKK)}
                                >
                                    <Icon
                                        name={acceptedKVKK ? "checkbox-marked" : "checkbox-blank-outline"}
                                        size={24}
                                        color={acceptedKVKK ? "#2e7d32" : "#757575"}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.checkboxLabel}>
                                    Gizlilik Politikası'nı okudum ve onaylıyorum.
                                </Text>
                            </View>

                            <View style={styles.checkboxContainer}>
                                <TouchableOpacity
                                    style={styles.checkboxTouchable}
                                    onPress={() => setAcceptedNotifications(!acceptedNotifications)}
                                >
                                    <Icon
                                        name={acceptedNotifications ? "checkbox-marked" : "checkbox-blank-outline"}
                                        size={24}
                                        color={acceptedNotifications ? "#2e7d32" : "#757575"}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.checkboxLabel}>
                                    SMS, Mail ve Bildirim yolu üzerinden bilgilendirmeleri kabul ediyorum.
                                </Text>
                            </View>
                        </View>

                        <View style={styles.modalButtonContainer}>
                            <Button
                                mode="outlined"
                                style={styles.modalButton}
                                onPress={rejectKVKK}
                            >
                                Vazgeç
                            </Button>
                            <Button
                                mode="contained"
                                style={[styles.modalButton, styles.acceptButton]}
                                onPress={approveKVKK}
                                labelStyle={styles.buttonLabel}
                            >
                                {acceptedUserAgreement && acceptedKVKK && acceptedNotifications ? 'Kabul Et' : 'Onayla'}
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>

            <BottomNavbar navigation={navigation}/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa'
    },
    content: {
        flex: 1,
        paddingHorizontal: 16
    },
    welcomeCard: {
        marginTop: 16,
        marginBottom: 20,
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        elevation: 2
    },
    welcomeContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    dateText: {
        fontSize: 12,
        color: '#757575',
        marginBottom: 4
    },
    subText: {
        fontSize: 14,
        color: '#555'
    },
    avatarContainer: {
        padding: 8
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#424242',
        marginTop: 8,
        marginBottom: 12,
        paddingLeft: 4
    },
    statsContainer: {
        marginTop: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        elevation: 2,
        marginBottom: 20
    },
    statItem: {
        alignItems: 'center'
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#424242',
        marginBottom: 2
    },
    statLabel: {
        fontSize: 12,
        color: '#757575'
    },
    chartCard: {
        borderRadius: 16,
        backgroundColor: '#ffffff',
        elevation: 2,
        padding: 16,
        marginBottom: 20
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#424242',
        marginBottom: 16,
        textAlign: 'center'
    },
    chartContainer: {
        flexDirection: 'row',
        height: 180,
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        paddingBottom: 10
    },
    barColumn: {
        alignItems: 'center',
        width: 30
    },
    barValue: {
        fontSize: 12,
        color: '#424242',
        marginBottom: 4
    },
    barContainer: {
        width: 20,
        height: 100,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        overflow: 'hidden',
        justifyContent: 'flex-end'
    },
    barFill: {
        width: '100%',
        borderRadius: 10
    },
    barDay: {
        fontSize: 12,
        color: '#757575',
        marginTop: 8
    },
    waterCard: {
        borderRadius: 16,
        backgroundColor: '#ffffff',
        padding: 16,
        elevation: 2,
        marginBottom: 20
    },
    waterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    waterInfo: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    waterTitle: {
        fontSize: 14,
        color: '#757575'
    },
    waterTarget: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#424242'
    },
    waterPercentage: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0288d1'
    },
    waterMeterContainer: {
        marginBottom: 16
    },
    waterMeter: {
        height: 12,
        borderRadius: 6
    },
    waterBottles: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 8
    },
    waterBottleContainer: {
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#f5f5f5'
    },
    planCard: {
        borderRadius: 16,
        backgroundColor: '#ffffff',
        padding: 16,
        elevation: 2,
        marginBottom: 20
    },
    planSection: {
        flexDirection: 'row',
        marginBottom: 8
    },
    planIcon: {
        width: 42,
        height: 42,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        marginTop: 4
    },
    planContent: {
        flex: 1
    },
    planTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#424242',
        marginBottom: 12
    },
    planItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    planTime: {
        fontSize: 14,
        color: '#757575',
        width: 50,
        marginLeft: 6
    },
    planText: {
        fontSize: 14,
        color: '#424242'
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 16
    },
    motivationCard: {
        borderRadius: 16,
        padding: 20,
        elevation: 2,
        marginBottom: 20,
        backgroundColor: '#43a047',
        position: 'relative',
        overflow: 'hidden'
    },
    motivationIcon: {
        position: 'absolute',
        right: -10,
        top: -10,
        opacity: 0.2
    },
    motivationText: {
        fontSize: 16,
        fontStyle: 'italic',
        color: '#ffffff',
        lineHeight: 22
    },
    bottomSpacer: {
        height: 24
    },
    card: {
        backgroundColor: '#ffffff',
        marginBottom: 16,
        borderRadius: 16,
        elevation: 2
    },
    randevuBilgi: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8
    },
    randevuIcon: {
        backgroundColor: '#2e7d32'
    },
    randevuDetay: {
        marginLeft: 16
    },
    randevuTarih: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    randevuSaat: {
        fontSize: 14,
        color: '#2e7d32',
        fontWeight: '500'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        width: '100%',
        maxHeight: '85%',
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 16,
        textAlign: 'center',
        letterSpacing: 0.5
    },
    modalScrollView: {
        maxHeight: 400,
        marginBottom: 16
    },
    modalText: {
        fontSize: 13,
        lineHeight: 18,
        color: '#424242',
        padding: 8
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8
    },
    modalButton: {
        flex: 1,
        margin: 8,
        borderRadius: 8,
        elevation: 2
    },
    acceptButton: {
        backgroundColor: '#2e7d32'
    },
    disabledButton: {
        backgroundColor: '#a5d6a7',
        opacity: 0.7
    },
    rejectButton: {
        backgroundColor: 'transparent',
        borderColor: '#d32f2f',
        borderWidth: 1
    },
    waterEntriesPreview: {
        marginTop: 4
    },
    waterEntriesTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#424242',
        marginBottom: 8
    },
    waterEntryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6
    },
    waterEntryInfo: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    waterEntryText: {
        marginLeft: 8,
        fontSize: 13,
        color: '#424242'
    },
    waterListModalContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        width: '90%',
        maxHeight: '80%',
        elevation: 5
    },
    waterListModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16
    },
    waterListModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0288d1'
    },
    waterListModalContent: {
        maxHeight: 400
    },
    waterListModalFooter: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    waterListModalTotal: {
        fontSize: 16,
        color: '#424242'
    },
    emptyListText: {
        padding: 20,
        textAlign: 'center',
        color: '#757575',
        fontStyle: 'italic'
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#fff',
        marginTop: 30,
        marginHorizontal: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: '#5a6268',
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    agreementBoxesContainer: {
        marginBottom: 16
    },
    agreementBoxWrapper: {
        marginBottom: 12
    },
    agreementBoxTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#424242',
        marginBottom: 8
    },
    agreementBox: {
        borderRadius: 12,
        backgroundColor: '#f9f9f9',
        overflow: 'hidden',
        elevation: 1
    },
    agreementScrollView: {
        maxHeight: 120
    },
    checkboxesContainer: {
        marginBottom: 16
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    checkboxTouchable: {
        width: 24,
        height: 24,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#424242'
    },
    buttonLabel: {
        textAlign: 'center',
        lineHeight: 20
    }
});

export default AnaSayfa;

