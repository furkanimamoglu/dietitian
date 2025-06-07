import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../Components/Header';
import BottomNavbar from '../Components/BottomNavbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';

const Egzersiz = ({navigation}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [exerciseInfo, setExerciseInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEgzersiz, setSelectedEgzersiz] = useState(null);
    const [sure, setSure] = useState('');
    const [customDuration, setCustomDuration] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchExerciseInfo = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${config[config.environment].apiUrl}/client/getMyDailyExercises`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': await AsyncStorage.getItem('token') || ''
                }
            });
            const data = await response.json();
            if (response.ok) {
                setExerciseInfo(data);
            } else {
                setError(data.message || 'Veri alınamadı');
                console.log('Egzersiz bilgisi alınamadı:', data.message);
            }
        } catch (error) {
            setError('Sunucuya bağlanırken bir hata oluştu');
            console.error('Hata:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchExerciseInfo();
    }, []);

    useEffect(() => {
        fetchExerciseInfo();
    }, []);

    const categoryIconMap = useMemo(() => ({
        1: 'run',
        2: 'yoga',
        3: 'weightlifting',
        4: 'basketball',
        5: 'swim',
        default: 'dumbbell',
    }), []);

    // Status için renk ve metin eşleştirmesi
    const statusMap = useMemo(() => ({
        'completed': {color: '#43a047', text: 'Tamamlandı'},
        'active': {color: '#1e88e5', text: 'Aktif'},
        'missed': {color: '#e53935', text: 'Kaçırıldı'},
        'pending': {color: '#fb8c00', text: 'Beklemede'},
        default: {color: '#757575', text: 'Belirsiz'}
    }), []);

    const getCategoryIcon = useCallback((categoryId) => {
        return categoryIconMap[categoryId] || categoryIconMap.default;
    }, [categoryIconMap]);

    const getStatusInfo = useCallback((status) => {
        return statusMap[status] || statusMap.default;
    }, [statusMap]);

    const formatDate = useCallback((dateString) => {
        const options = {year: 'numeric', month: 'numeric', day: 'numeric'};
        return new Date(dateString).toLocaleDateString('tr-TR', options);
    }, []);

    const stats = useMemo(() => {
        const totalDuration = exerciseInfo.reduce((sum, item) => sum + (item.Exercise?.duration || 0), 0);
        const activeExercises = exerciseInfo.filter(item => item.status === 'active').length;
        const completedExercises = exerciseInfo.filter(item => item.status === 'completed').length;

        return {
            totalDuration,
            totalExercises: exerciseInfo.length,
            activeExercises,
            completedExercises
        };
    }, [exerciseInfo]);

    const updateExerciseStatus = async (exerciseId, newStatus) => {
        try {
            const response = await fetch(`${config[config.environment].apiUrl}/client/updateMyExercise`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': await AsyncStorage.getItem('token') || ''
                },
                body: JSON.stringify({
                    exercise_id: exerciseId,
                    status: newStatus,
                    duration: parseInt(customDuration) || undefined
                })
            });

            if (response.ok) {
                fetchExerciseInfo();
            } else {
                const errorData = await response.json();
                console.log('Egzersiz durumu güncellenemedi:', errorData.message);
            }
        } catch (error) {
            console.error('Hata:', error);
        }
    };

    const renderExerciseCard = useCallback(({item}) => {
        const statusInfo = getStatusInfo(item.status);
        const categoryIcon = getCategoryIcon(item.Exercise?.category_id);

        return (
            <View style={styles.exerciseCard}>
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconContainer, {backgroundColor: statusInfo.color}]}>
                            <Icon name={categoryIcon} size={24} color="#fff"/>
                        </View>
                        <View style={styles.cardTitleContainer}>
                            <Text style={styles.title}>{item.Exercise?.exercise_name}</Text>
                            <View style={styles.statusContainer}>
                                <View style={[styles.statusIndicator, {backgroundColor: statusInfo.color}]}/>
                                <Text style={styles.statusText}>{statusInfo.text}</Text>
                            </View>
                        </View>
                        {item.status === 'active' && (
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedEgzersiz(item);
                                    setCustomDuration(item.Exercise?.duration.toString());
                                    setModalVisible(true);
                                }}
                                style={styles.completeButton}
                            >
                                <Icon name="check-circle" size={28} color="#43a047"/>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.divider}/>

                    <View style={styles.cardDetails}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailItem}>
                                <Icon name="calendar-range" size={18} color="#757575"/>
                                <Text style={styles.detailText}>
                                    {formatDate(item.start_date)} - {formatDate(item.end_date)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.detailRow}>
                            <View style={styles.detailItem}>
                                <Icon name="clock-outline" size={18} color="#757575"/>
                                <Text style={styles.detailText}>{item.Exercise?.duration} dakika</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Icon name="fire" size={18} color="#f57c00"/>
                                <Text style={styles.detailText}>{item.Exercise?.calories_burned} kcal</Text>
                            </View>
                        </View>

                        {item.note && (
                            <View style={styles.noteContainer}>
                                <Icon name="note-text-outline" size={18} color="#757575"/>
                                <Text style={styles.noteText}>{item.note}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    }, [getCategoryIcon, getStatusInfo, formatDate]);

    // Modal içeriği
    const renderCompleteExerciseModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Egzersizi Tamamla</Text>

                    <View style={styles.modalExerciseInfo}>
                        <Text style={styles.modalExerciseName}>
                            {selectedEgzersiz?.Exercise?.exercise_name}
                        </Text>
                        <Text style={styles.modalExerciseDetails}>
                            Önerilen süre: {selectedEgzersiz?.Exercise?.duration} dakika
                        </Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Egzersiz Süresi (dakika)</Text>
                        <TextInput
                            value={customDuration}
                            onChangeText={setCustomDuration}
                            keyboardType="numeric"
                            style={styles.input}
                            placeholder="Süre"
                        />
                    </View>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.cancelButton}
                        >
                            <Text style={styles.cancelButtonText}>İptal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                updateExerciseStatus(selectedEgzersiz.id, 'completed');
                                setModalVisible(false);
                            }}
                            style={styles.saveButton}
                        >
                            <Text style={styles.saveButtonText}>Tamamla</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    if (loading && !refreshing) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#2e7d32"/>
                <Text style={styles.loadingText}>Egzersizler Yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header navigation={navigation}/>

            <View style={styles.content}>
                {/* Özet Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.cardContent}>
                        <Text style={styles.summaryTitle}>Egzersiz Özeti</Text>
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Icon name="clock-outline" size={24} color="#1e88e5"/>
                                <Text style={styles.statValue}>{stats.totalDuration}</Text>
                                <Text style={styles.statLabel}>Dakika</Text>
                            </View>
                            <View style={styles.verticalDivider}/>
                            <View style={styles.statItem}>
                                <Icon name="check-circle" size={24} color="#43a047"/>
                                <Text style={styles.statValue}>{stats.completedExercises}</Text>
                                <Text style={styles.statLabel}>Tamamlanan</Text>
                            </View>
                            <View style={styles.verticalDivider}/>
                            <View style={styles.statItem}>
                                <Icon name="calendar-clock" size={24} color="#fb8c00"/>
                                <Text style={styles.statValue}>{stats.activeExercises}</Text>
                                <Text style={styles.statLabel}>Aktif</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {error ? (
                    <View style={styles.errorContainer}>
                        <Icon name="alert-circle-outline" size={48} color="#e53935"/>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={fetchExerciseInfo}
                        >
                            <Text style={styles.retryButtonText}>Yeniden Dene</Text>
                        </TouchableOpacity>
                    </View>
                ) : exerciseInfo.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="dumbbell" size={64} color="#bdbdbd"/>
                        <Text style={styles.emptyText}>Henüz egzersiz programınız bulunmuyor</Text>
                        <Text style={styles.emptySubtext}>
                            Diyetisyeniniz sizin için egzersiz programı oluşturduğunda burada görüntülenecektir.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={exerciseInfo}
                        renderItem={renderExerciseCard}
                        keyExtractor={item => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        initialNumToRender={5}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        removeClippedSubviews={true}
                        style={styles.listContainer}
                        onRefresh={onRefresh}
                        refreshing={refreshing}
                    />
                )}
            </View>

            {/* Egzersiz tamamlama modal */}
            {renderCompleteExerciseModal()}

            <BottomNavbar navigation={navigation}/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#616161'
    },
    content: {
        flex: 1,
        padding: 16
    },
    summaryCard: {
        marginBottom: 16,
        borderRadius: 12,
        elevation: 3,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    cardContent: {
        padding: 16
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#424242'
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#424242',
        marginTop: 4
    },
    statLabel: {
        fontSize: 12,
        color: '#757575'
    },
    verticalDivider: {
        width: 1,
        height: '70%',
        backgroundColor: '#e0e0e0'
    },
    listContainer: {
        flex: 1
    },
    exerciseCard: {
        marginBottom: 16,
        borderRadius: 12,
        elevation: 2,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 3
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2e7d32',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    cardTitleContainer: {
        flex: 1
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#424242'
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6
    },
    statusText: {
        fontSize: 12,
        color: '#757575'
    },
    completeButton: {
        padding: 8
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 8
    },
    cardDetails: {
        marginTop: 4
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    detailText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#616161'
    },
    noteContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 4,
        paddingTop: 4,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0'
    },
    noteText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#616161',
        flex: 1
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
    retryButton: {
        marginTop: 16,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#2e7d32',
        borderRadius: 8
    },
    retryButtonText: {
        color: '#ffffff',
        fontWeight: 'bold'
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#616161',
        marginTop: 16,
        textAlign: 'center'
    },
    emptySubtext: {
        fontSize: 14,
        color: '#757575',
        marginTop: 8,
        textAlign: 'center'
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20
    },
    modalContent: {
        backgroundColor: '#ffffff',
        width: '100%',
        borderRadius: 16,
        padding: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.2,
        shadowRadius: 6
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2e7d32',
        textAlign: 'center'
    },
    modalExerciseInfo: {
        marginBottom: 20,
        padding: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 8
    },
    modalExerciseName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#424242'
    },
    modalExerciseDetails: {
        marginTop: 4,
        fontSize: 14,
        color: '#757575'
    },
    inputContainer: {
        marginBottom: 16
    },
    inputLabel: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 8
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#ffffff',
        fontSize: 16
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16
    },
    cancelButton: {
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#2e7d32',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8
    },
    cancelButtonText: {
        color: '#2e7d32',
        fontSize: 16
    },
    saveButton: {
        backgroundColor: '#2e7d32',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default Egzersiz;