import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView, Text as RNText, Dimensions, Modal, TouchableOpacity} from 'react-native';
import {Avatar, Card, Text, Surface, ProgressBar, Button} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';
import Header from '../Components/Header';
import BottomNavbar from '../Components/BottomNavbar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';

type Props = NativeStackScreenProps<RootStackParamList, 'AnaSayfa'>;

const {width} = Dimensions.get('window');

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

    const checkKVKKStatus = async () => {
        try {
            const response = await fetch(`${config.apiUrl}/client/getMyKVKKStatus`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': await AsyncStorage.getItem('token') || ''
                }
            });
            const data = await response.json();
            if (response.ok && data.kvkkApproval === false) {
                setShowKVKKModal(true);
            }
        } catch (error) {
            console.error('KVKK status kontrol hatası:', error);
        }
    };

    const approveKVKK = async () => {
        try {
            const response = await fetch(`${config.apiUrl}/client/approveKVKK`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': await AsyncStorage.getItem('token') || ''
                }
            });
            const data = await response.json();
            if (response.ok) {
                setShowKVKKModal(false);
            } else {
                console.log('KVKK onayı hatası:', data.message);
            }
        } catch (error) {
            console.error('KVKK onayı hatası:', error);
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
            const response = await fetch(`${config.apiUrl}/appointment/fetchClientAppointments`, {
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

    const fetchMeasurementInfo = async () => {
        try {
            const response = await fetch(`${config.apiUrl}/client/getMyLatestMeasurement`, {
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
            const response = await fetch(`${config.apiUrl}/appointment/fetchClientAppointments`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': await AsyncStorage.getItem('token') || ''
                }
            });

            const data = await response.json();

            if (response.ok) {
                const approvedAppointments = data.filter(appt => appt.status === 'approved');

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

    useEffect(() => {
        fetchAppointmentInfo();
        fetchMeasurementInfo();
        fetchClientInfo();
        checkKVKKStatus();
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

    return (
        <View style={styles.container}>
            <Header navigation={navigation}/>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Karşılama Kartı */}
                <Surface style={styles.welcomeCard}>
                    <View style={styles.welcomeContent}>
                        <View>
                            <Text style={styles.welcomeText}>Merhaba,{'\n'}{userName}!</Text>
                            <Text style={styles.subText}>Bugün programın için harika bir gün 💪</Text>
                        </View>
                    </View>
                </Surface>

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

                <Card style={styles.card}>
                    <Card.Title title="Gelecek Randevu Tarihiniz" />
                    <Card.Content>
                        <View style={styles.randevuBilgi}>
                            <Avatar.Icon size={48} icon="calendar" style={styles.randevuIcon} />
                            <View style={styles.randevuDetay}>
                                <Text style={styles.randevuTarih}>
                                    {closestAppointment
                                        ? closestAppointment.toLocaleDateString('tr-TR')
                                        : 'Tarih yok'}
                                </Text>
                                <Text style={styles.randevuSaat}>
                                    {closestAppointment
                                        ? closestAppointment.toLocaleTimeString('tr-TR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })
                                        : 'Saat yok'}
                                </Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* İlerleme Grafiği - LineChart olmadan
        <Text style={styles.sectionTitle}>Haftalık İlerleme</Text>
        <Surface style={styles.chartCard}>
          <Text style={styles.chartTitle}>Ağırlık Takibi (kg)</Text>
          <View style={styles.chartContainer}>
            {weeklyProgress.map((item, index) => (
              <View key={index} style={styles.barColumn}>
                <Text style={styles.barValue}>{item.value}</Text>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${(item.value / maxValue) * 80}%`,
                        backgroundColor: index === 4 ? '#2e7d32' : '#81c784'
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barDay}>{item.day}</Text>
              </View>
            ))}
          </View>
        </Surface>
        */}

                {/* Su Tüketimi
        <Text style={styles.sectionTitle}>Su Tüketimi</Text>
        <Surface style={styles.waterCard}>
          <View style={styles.waterHeader}>
            <View style={styles.waterInfo}>
              <Icon name="cup-water" size={28} color="#0288d1" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.waterTitle}>Günlük Hedefiniz</Text>
                <Text style={styles.waterTarget}>{healthData.waterAmount}</Text>
              </View>
            </View>
            <Text style={styles.waterPercentage}>{waterPercentage}%</Text>
          </View>

          <View style={styles.waterMeterContainer}>
            <ProgressBar progress={waterPercentage / 100} color="#0288d1" style={styles.waterMeter} />
          </View>

          <View style={styles.waterBottles}>
            {[0, 1, 2, 3, 4].map((index) => (
              <View key={index} style={styles.waterBottleContainer}>
                <Icon
                  name={index < 3 ? "cup-water" : "cup"}
                  size={26}
                  color={index < 3 ? "#0288d1" : "#B0BEC5"}
                />
                <Text style={{color: index < 3 ? "#0288d1" : "#B0BEC5"}}>500ml</Text>
              </View>
            ))}
          </View>
        </Surface> */}

                {/* Motivasyon Kartı */}
                <Surface style={styles.motivationCard}>
                    <Icon name="star-circle" size={36} color="#fff" style={styles.motivationIcon}/>
                    <Text style={styles.motivationText}>
                        "Küçük adımlar büyük değişimlerin başlangıcıdır. Bugün attığın her adım, yarın daha sağlıklı bir
                        sen için."
                    </Text>
                </Surface>

                {/* Alt boşluk */}
                <View style={styles.bottomSpacer}/>
            </ScrollView>

            {/* KVKK Modal */}
            <Modal
                visible={showKVKKModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>KVKK Aydınlatma Metni</Text>
                        <ScrollView style={styles.modalScrollView}>
                            <Text style={styles.modalText}>
                                Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, kişisel verilerinizin işlenmesi,
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
                                KVKK kapsamında sahip olduğunuz haklar:
                                {'\n\n'}
                                - Kişisel verilerinizin işlenip işlenmediğini öğrenme
                                {'\n'}
                                - Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme
                                {'\n'}
                                - Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp
                                kullanılmadığını öğrenme
                                {'\n'}
                                - Yurtiçinde veya yurtdışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme
                                {'\n'}
                                - Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların
                                düzeltilmesini isteme
                                {'\n'}
                                - KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin
                                silinmesini veya yok edilmesini isteme
                                {'\n\n'}
                                Bu aydınlatma metnini kabul etmeniz, uygulamayı kullanabilmeniz için gereklidir. Kabul
                                etmediğiniz takdirde, uygulamayı kullanamayacağınızı belirtmek isteriz.
                            </Text>
                        </ScrollView>
                        <View style={styles.modalButtonContainer}>
                            <Button
                                mode="contained"
                                style={[styles.modalButton, styles.rejectButton]}
                                onPress={rejectKVKK}
                            >
                                Reddet
                            </Button>
                            <Button
                                mode="contained"
                                style={[styles.modalButton, styles.acceptButton]}
                                onPress={approveKVKK}
                            >
                                Kabul Et
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
    welcomeText: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#2e7d32',
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
        marginBottom: 16
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
        alignItems: 'center'
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
        maxHeight: '80%',
        padding: 20,
        elevation: 5
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 16,
        textAlign: 'center'
    },
    modalScrollView: {
        maxHeight: 400,
        marginBottom: 16
    },
    modalText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#424242'
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    modalButton: {
        flex: 1,
        margin: 8
    },
    acceptButton: {
        backgroundColor: '#2e7d32'
    },
    rejectButton: {
        backgroundColor: '#d32f2f'
    },
});

export default AnaSayfa;