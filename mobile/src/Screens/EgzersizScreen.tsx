import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
    Dimensions,
    ScrollView,
    Animated,
    RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../Components/Header';
import BottomNavbar from '../Components/BottomNavbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';

const {width} = Dimensions.get('window');

const Egzersiz = ({navigation}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [exerciseInfo, setExerciseInfo] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedEgzersiz, setSelectedEgzersiz] = useState(null);
    const [customDuration, setCustomDuration] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));

    const fetchExerciseInfo = async () => {
        if (!refreshing) {
            setLoading(true);
        }
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
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
            } else {
                setError(data.message || 'Veri alınamadı');
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
        2: 'weightlifting',
        3: 'swim',
        4: 'basketball',
        5: 'yoga',
        default: 'dumbbell',
    }), []);

    const statusMap = useMemo(() => ({
        'completed': {
            color: '#10B981',
            bgColor: '#ECFDF5',
            text: 'Tamamlandı',
            icon: 'check-circle'
        },
        'active': {
            color: '#3B82F6',
            bgColor: '#EFF6FF',
            text: 'Aktif',
            icon: 'play-circle'
        },
        'missed': {
            color: '#EF4444',
            bgColor: '#FEF2F2',
            text: 'Kaçırıldı',
            icon: 'close-circle'
        },
        'pending': {
            color: '#F59E0B',
            bgColor: '#FFFBEB',
            text: 'Beklemede',
            icon: 'clock'
        },
        default: {
            color: '#6B7280',
            bgColor: '#F9FAFB',
            text: 'Belirsiz',
            icon: 'help-circle'
        }
    }), []);

    const getCategoryIcon = useCallback((categoryId) => {
        return categoryIconMap[categoryId] || categoryIconMap.default;
    }, [categoryIconMap]);

    const getStatusInfo = useCallback((status) => {
        return statusMap[status] || statusMap.default;
    }, [statusMap]);

    const formatDate = useCallback((dateString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('tr-TR', options);
    }, []);

    const getDaysDifference = useCallback((startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays + 1;
    }, []);

    const stats = useMemo(() => {
        const totalDuration = exerciseInfo.reduce((sum, item) => sum + (item.Exercise?.duration || 0), 0);
        const activeExercises = exerciseInfo.filter(item => item.status === 'active').length;
        const completedExercises = exerciseInfo.filter(item => item.status === 'completed').length;
        const totalCalories = exerciseInfo.reduce((sum, item) => sum + (item.Exercise?.calories_burned || 0), 0);

        return {
            totalDuration,
            totalExercises: exerciseInfo.length,
            activeExercises,
            completedExercises,
            totalCalories
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

    const getDifficultyStars = useCallback((difficulty) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Icon
                    key={i}
                    name={i <= difficulty ? "star" : "star-outline"}
                    size={14}
                    color={i <= difficulty ? "#F59E0B" : "#D1D5DB"}
                />
            );
        }
        return stars;
    }, []);

    const renderExerciseCard = useCallback(({item, index}) => {
        const statusInfo = getStatusInfo(item.status);
        const categoryIcon = getCategoryIcon(item.Exercise?.category_id);
        const daysDuration = getDaysDifference(item.start_date, item.end_date);

        return (
            <Animated.View
                style={[
                    styles.exerciseCard,
                    {
                        opacity: fadeAnim,
                        transform: [{
                            translateY: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [50, 0],
                            }),
                        }],
                    }
                ]}
            >
                {/* Gradient Header */}
                <View style={[styles.cardHeader, {backgroundColor: statusInfo.bgColor}]}>
                    <View style={styles.headerContent}>
                        <View style={[styles.iconContainer, {backgroundColor: statusInfo.color}]}>
                            <Icon name={categoryIcon} size={24} color="#fff"/>
                        </View>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.exerciseTitle} numberOfLines={2}>
                                {item.Exercise?.exercise_name}
                            </Text>
                            <View style={styles.statusBadge}>
                                <Icon name={statusInfo.icon} size={14} color={statusInfo.color}/>
                                <Text style={[styles.statusText, {color: statusInfo.color}]}>
                                    {statusInfo.text}
                                </Text>
                            </View>
                        </View>
                        {item.status === 'active' && (
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedEgzersiz(item);
                                    setCustomDuration(item.Exercise?.duration.toString());
                                    setModalVisible(true);
                                }}
                                style={[styles.actionButton, {backgroundColor: statusInfo.color}]}
                            >
                                <Icon name="check" size={20} color="#fff"/>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Exercise Image */}
                {item.Exercise?.image ? (
                    <View style={styles.imageContainer}>
                        <Image
                            source={{uri: item.Exercise.image}}
                            style={styles.exerciseImage}
                            resizeMode="cover"
                        />
                        {item.Exercise?.video && (
                            <View style={styles.imageOverlay}>
                                <TouchableOpacity style={styles.playButton}>
                                    <Icon name="play" size={24} color="#fff"/>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.noImageContainer}>
                        <Icon name="image-off-outline" size={48} color="#D1D5DB"/>
                        <Text style={styles.noImageText}>
                            Henüz görsel eklenmemiş 📸
                        </Text>
                    </View>
                )}

                {/* Card Content */}
                <View style={styles.cardContent}>
                    {/* Description */}
                    {item.Exercise?.exercise_description && (
                        <Text style={styles.description} numberOfLines={2}>
                            {item.Exercise.exercise_description}
                        </Text>
                    )}

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Icon name="clock-outline" size={16} color="#6B7280"/>
                            <Text style={styles.statText}>
                                {item.Exercise?.duration} dk
                            </Text>
                        </View>

                        <View style={styles.statItem}>
                            <Icon name="fire" size={16} color="#EF4444"/>
                            <Text style={styles.statText}>
                                {item.Exercise?.calories_burned || 0} kcal
                            </Text>
                        </View>

                        <View style={styles.statItem}>
                            <Icon name="calendar-range" size={16} color="#8B5CF6"/>
                            <Text style={styles.statText}>
                                {daysDuration} gün
                            </Text>
                        </View>
                    </View>

                    {/* Difficulty */}
                    <View style={styles.difficultyContainer}>
                        <Text style={styles.difficultyLabel}>Zorluk:</Text>
                        <View style={styles.starsContainer}>
                            {getDifficultyStars(item.Exercise?.difficulty || 0)}
                        </View>
                    </View>

                    {/* Date Range */}
                    <View style={styles.dateContainer}>
                        <Icon name="calendar" size={14} color="#6B7280"/>
                        <Text style={styles.dateText}>
                            {formatDate(item.start_date)} - {formatDate(item.end_date)}
                        </Text>
                    </View>

                    {/* Note */}
                    {item.note && (
                        <View style={styles.noteContainer}>
                            <Icon name="note-text" size={14} color="#6B7280"/>
                            <Text style={styles.noteText}>{item.note}</Text>
                        </View>
                    )}

                    {/* Equipment */}
                    {item.Exercise?.equipment && (
                        <View style={styles.equipmentContainer}>
                            <Icon name="dumbbell" size={14} color="#6B7280"/>
                            <Text style={styles.equipmentText}>
                                Ekipman: {item.Exercise.equipment}
                            </Text>
                        </View>
                    )}
                </View>
            </Animated.View>
        );
    }, [getCategoryIcon, getStatusInfo, formatDate, getDaysDifference, getDifficultyStars, fadeAnim]);

    // Enhanced Modal
    const renderCompleteExerciseModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Icon name="check-circle" size={32} color="#10B981"/>
                        <Text style={styles.modalTitle}>Egzersizi Tamamla</Text>
                    </View>

                    <View style={styles.modalExerciseInfo}>
                        <Text style={styles.modalExerciseName}>
                            {selectedEgzersiz?.Exercise?.exercise_name}
                        </Text>
                        <Text style={styles.modalExerciseDetails}>
                            Önerilen süre: {selectedEgzersiz?.Exercise?.duration} dakika
                        </Text>
                        <Text style={styles.modalCalorieInfo}>
                            Yakılacak kalori: ~{selectedEgzersiz?.Exercise?.calories_burned || 0} kcal
                        </Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Egzersiz Süresi (dakika)</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                value={customDuration}
                                onChangeText={setCustomDuration}
                                keyboardType="numeric"
                                style={styles.input}
                                placeholder="Süre girin"
                                placeholderTextColor="#9CA3AF"
                            />
                            <Text style={styles.inputUnit}>dk</Text>
                        </View>
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
                            <Icon name="check" size={18} color="#fff"/>
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
                <ActivityIndicator size="large" color="#3B82F6"/>
                <Text style={styles.loadingText}>Egzersizler Yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header navigation={navigation}/>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#3B82F6']}
                        tintColor="#3B82F6"
                    />
                }
                showsVerticalScrollIndicator={false}
            >

                {error ? (
                    <View style={styles.errorContainer}>
                        <Icon name="alert-circle-outline" size={48} color="#EF4444"/>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={fetchExerciseInfo}>
                            <Text style={styles.retryButtonText}>Yeniden Dene</Text>
                        </TouchableOpacity>
                    </View>
                ) : exerciseInfo.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="dumbbell" size={64} color="#D1D5DB"/>
                        <Text style={styles.emptyText}>Henüz egzersiz programınız bulunmuyor</Text>
                        <Text style={styles.emptySubtext}>
                            Diyetisyeniniz sizin için egzersiz programı oluşturduğunda burada görüntülenecektir.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.exerciseList}>
                        {exerciseInfo.map((item, index) => (
                            <View key={item.id}>
                                {renderExerciseCard({item, index})}
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {renderCompleteExerciseModal()}
            <BottomNavbar navigation={navigation}/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC'
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500'
    },
    content: {
        flex: 1,
        padding: 16
    },

    // Stats Card Styles
    statsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 16,
        textAlign: 'center'
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },
    statCard: {
        width: (width - 48) / 2 - 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6'
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500'
    },

    // Exercise Card Styles
    exerciseList: {
        paddingBottom: 20
    },
    exerciseCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6
    },
    cardHeader: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6'
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    headerTextContainer: {
        flex: 1
    },
    exerciseTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },

    // Image Styles
    imageContainer: {
        position: 'relative',
        height: 180
    },
    exerciseImage: {
        width: '100%',
        height: '100%'
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    playButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgb(253,146,0)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    noImageContainer: {
        height: 160,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6'
    },
    noImageText: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '600',
        marginTop: 8,
        textAlign: 'center'
    },
    noImageSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
        textAlign: 'center',
        fontStyle: 'italic'
    },

    // Card Content Styles
    cardContent: {
        padding: 16
    },
    description: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 12
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6'
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    statText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
        marginLeft: 4
    },
    difficultyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    difficultyLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginRight: 8
    },
    starsContainer: {
        flexDirection: 'row'
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    dateText: {
        fontSize: 13,
        color: '#6B7280',
        marginLeft: 6
    },
    noteContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6'
    },
    noteText: {
        fontSize: 13,
        color: '#6B7280',
        marginLeft: 6,
        flex: 1,
        lineHeight: 18
    },
    equipmentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4
    },
    equipmentText: {
        fontSize: 13,
        color: '#6B7280',
        marginLeft: 6
    },

    // Modal Styles
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20
    },
    modalContent: {
        backgroundColor: '#fff',
        width: '100%',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 20
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginTop: 8
    },
    modalExerciseInfo: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20
    },
    modalExerciseName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4
    },
    modalExerciseDetails: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 2
    },
    modalCalorieInfo: {
        fontSize: 14,
        color: '#EF4444',
        fontWeight: '500'
    },
    inputContainer: {
        marginBottom: 20
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        backgroundColor: '#FAFAFA'
    },
    input: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1F2937'
    },
    inputUnit: {
        paddingRight: 16,
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500'
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        alignItems: 'center'
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280'
    },
    saveButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: '#10B981',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 6
    },

    // Error & Empty States
    errorContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4
    },
    errorText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 22
    },
    retryButton: {
        marginTop: 16,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#3B82F6',
        borderRadius: 12
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14
    },
    emptyContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        marginTop: 20
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
        textAlign: 'center'
    },
    emptySubtext: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20
    }
});

export default Egzersiz;