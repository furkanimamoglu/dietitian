import React, {useEffect, useState} from 'react';
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config.js';

// Define a simple navigation prop type that doesn't depend on RootStackParamList
type NavigationProp = {
    replace: (routeName: string) => void;
    navigate: (routeName: string) => void;
};

type Props = {
    navigation: NavigationProp;
};

interface DailyMealPlan {
    Kahvaltı: string[] | string | { main: string[], alternatives: { [key: string]: string[] } };
    'Öğle Yemeği': string[] | string | { main: string[], alternatives: { [key: string]: string[] } };
    'Akşam Yemeği': string[] | string | { main: string[], alternatives: { [key: string]: string[] } };
    Aparatif: string[] | string | { main: string[], alternatives: { [key: string]: string[] } };
}

const BottomNav = ({navigation}: Props) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showMealPopup, setShowMealPopup] = useState(false);
    const [showExercisePopup, setShowExercisePopup] = useState(false);
    const route = useRoute();
    const [selectedMealType, setSelectedMealType] = useState('Kahvaltı');
    const [newMeal, setNewMeal] = useState('');
    const [newPortion, setNewPortion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedExerciseType, setSelectedExerciseType] = useState('Koşu');
    const [exerciseDuration, setExerciseDuration] = useState('');
    const [isExerciseSubmitting, setIsExerciseSubmitting] = useState(false);
    const [nutritionPlanId, setNutritionPlanId] = useState<number | null>(null);

    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const toastOpacity = useState(new Animated.Value(0))[0];

    useEffect(() => {
        fetchNutritionPlanId();
    }, []);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setToastVisible(true);

        // Animate fade in
        Animated.timing(toastOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
        }).start();

        // Auto hide after 3 seconds
        setTimeout(() => {
            Animated.timing(toastOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            }).start(() => setToastVisible(false));
        }, 3000);
    };

    const fetchNutritionPlanId = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('Token Bulunamadı');
                return;
            }

            const response = await fetch(`${config[config.environment].apiUrl}/client/getTodayMeal`, {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            // Store the nutrition plan ID
            if (data.nutrition_plan_id) {
                setNutritionPlanId(data.nutrition_plan_id);
            } else if (data.NutritionPlan && data.NutritionPlan.id) {
                setNutritionPlanId(data.NutritionPlan.id);
            }
        } catch (error) {
            console.error('Error fetching nutrition plan ID:', error);
        }
    };

    const mealTypes = ['Kahvaltı', 'Öğle', 'Akşam', 'Aperatifler'];
    const exerciseTypes = [
        'Koşu',
        'Yürüyüş',
        'Bisiklet',
        'Yüzme',
        'Yoga',
        'Pilates',
        'Futbol',
        'Basketbol',
        'Voleybol',
        'Tenis',
    ];

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const isActive = (routeName: string) => {
        return route.name === routeName;
    };

    const handleAddMeal = async () => {
        if (!newMeal || !newPortion || !selectedMealType) return;
        setIsSubmitting(true);

        try {
            // Get current day of the week in Turkish
            const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
            const today = new Date().getDay();
            const todayTurkish = days[today];

            // If we don't have a nutrition plan ID, we need to fetch it
            if (nutritionPlanId === null) {
                await fetchNutritionPlanId();
                if (nutritionPlanId === null) {
                    showToast('Beslenme planı bulunamadı. Lütfen daha sonra tekrar deneyin.', 'error');
                    setIsSubmitting(false);
                    return;
                }
            }

            // Convert app meal names to API meal names
            const convertAppMealNameToApiMealName = (appMealName: string): string => {
                switch (appMealName) {
                    case 'Kahvaltı':
                        return 'Kahvaltı';
                    case 'Öğle':
                        return 'Öğle Yemeği';
                    case 'Akşam':
                        return 'Akşam Yemeği';
                    case 'Aperatifler':
                        return 'Aparatif';
                    default:
                        return '';
                }
            };

            // First get the current meal plan to update it
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                showToast('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.', 'error');
                setIsSubmitting(false);
                return;
            }

            const response = await fetch(`${config[config.environment].apiUrl}/client/getTodayMeal`, {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            // Find the meal plan data
            let mealPlanData: any = null;

            if (data.mealPlan) {
                mealPlanData = data.mealPlan;
            } else if (data.NutritionPlan && data.NutritionPlan.mealPlan) {
                mealPlanData = data.NutritionPlan.mealPlan;
            }

            if (!mealPlanData) {
                // If we can't find a meal plan, create a new one
                mealPlanData = {
                    [todayTurkish]: {
                        'Kahvaltı': [],
                        'Öğle Yemeği': [],
                        'Akşam Yemeği': [],
                        'Aparatif': []
                    }
                };
            }

            // Make sure today's plan exists
            if (!mealPlanData[todayTurkish]) {
                mealPlanData[todayTurkish] = {
                    'Kahvaltı': [],
                    'Öğle Yemeği': [],
                    'Akşam Yemeği': [],
                    'Aparatif': []
                };
            }

            // Get the API meal type
            const apiMealType = convertAppMealNameToApiMealName(selectedMealType);

            // Create or update the meal array for this meal type
            const todayPlan = mealPlanData[todayTurkish];

            // Initialize the meal type if it doesn't exist
            if (!todayPlan[apiMealType]) {
                todayPlan[apiMealType] = [];
            } else if (typeof todayPlan[apiMealType] === 'object' &&
                !Array.isArray(todayPlan[apiMealType]) &&
                todayPlan[apiMealType] &&
                'main' in todayPlan[apiMealType]) {
                // If it's in the complex format with main and alternatives
                const mealData = todayPlan[apiMealType] as {
                    main: string[],
                    alternatives?: { [key: string]: string[] }
                };

                // Check if the meal is already in the list to avoid duplicates
                if (!mealData.main.includes(newMeal)) {
                    mealData.main.push(newMeal);
                }
            } else if (Array.isArray(todayPlan[apiMealType])) {
                // Simple array format - Check if the meal is already in the list to avoid duplicates
                const meals = todayPlan[apiMealType] as string[];
                if (!meals.includes(newMeal)) {
                    meals.push(newMeal);
                }
            }

            // Prepare the update data
            const updateData = {
                nutrition_plan_id: nutritionPlanId,
                mealPlan: {
                    [todayTurkish]: todayPlan
                }
            };

            // Send the update to the server
            const updateResponse = await fetch(`${config[config.environment].apiUrl}/client/updateMealPlan`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            const updateResult = await updateResponse.json();

            if (!updateResponse.ok) {
                showToast('Öğün eklenirken bir hata oluştu: ' + (updateResult.message || 'Bilinmeyen hata'), 'error');
            } else {
                showToast('Öğün başarıyla eklendi', 'success');
            }

            setShowMealPopup(false);
            setNewMeal('');
            setNewPortion('');
            setSelectedMealType('Kahvaltı');
        } catch (e) {
            console.error('Error adding meal:', e);
            showToast('Öğün eklenirken bir hata oluştu. Lütfen tekrar deneyin.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddExercise = async () => {
        if (!selectedExerciseType || !exerciseDuration) return;
        setIsExerciseSubmitting(true);
        try {
            await fetch('https://your-api-endpoint.com/exercises', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    exerciseType: selectedExerciseType,
                    duration: exerciseDuration,
                }),
            });
            setShowExercisePopup(false);
            setSelectedExerciseType('Koşu');
            setExerciseDuration('');
        } catch (e) {
            console.log('Hata:', 'Hızlı Egzersiz Ekle butonunda bir hata oluştu.');
        } finally {
            setIsExerciseSubmitting(false);
        }
    };

    return (
        <View>
            {menuOpen && (
                <View style={styles.floatingMenuRow}>
                    <TouchableOpacity
                        style={styles.floatingButton}
                        onPress={() => {
                            navigation.replace('Randevu');
                            setMenuOpen(false);
                        }}
                        activeOpacity={0.8}
                    >
                        <Icon name="calendar-check" size={24} color="#f57c00"/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.floatingButton}
                        onPress={() => {
                            setShowMealPopup(true);
                            setMenuOpen(false);
                        }}
                        activeOpacity={0.8}
                    >
                        <Icon name="silverware-fork-knife" size={24} color="#f57c00"/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.floatingButton}
                        onPress={() => {
                            setShowExercisePopup(true);
                            setMenuOpen(false);
                        }}
                        activeOpacity={0.8}
                    >
                        <Icon name="run" size={24} color="#f57c00"/>
                    </TouchableOpacity>
                </View>
            )}

            {/* Overlay to close menu when clicked outside */}
            {menuOpen && (
                <TouchableWithoutFeedback onPress={() => setMenuOpen(false)}>
                    <View style={styles.overlay}/>
                </TouchableWithoutFeedback>
            )}

            {/* Toast Notification */}
            {toastVisible && (
                <Animated.View style={[
                    styles.toast,
                    toastType === 'error' ? styles.errorToast : styles.successToast,
                    {opacity: toastOpacity}
                ]}>
                    <Icon
                        name={toastType === 'error' ? 'alert-circle' : 'check-circle'}
                        size={20}
                        color="#fff"
                        style={styles.toastIcon}
                    />
                    <Text style={styles.toastText}>{toastMessage}</Text>
                </Animated.View>
            )}

            <View style={styles.bottomNavbar}>
                <TouchableOpacity onPress={() => {
                    if (route.name !== 'Egzersiz') {
                        navigation.replace('Egzersiz');
                    }
                }}
                style={[styles.navItem, isActive('Egzersiz') && styles.activeNavItem]}>
                    <Icon name="dumbbell" size={24} color={isActive('Egzersiz') ? '#ffffff' : '#ffffff80'}/>
                    <Text style={[styles.label, isActive('Egzersiz') && styles.activeLabel]}>Egzersiz</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    if (route.name !== 'Beslenme') {
                        navigation.replace('Beslenme');
                    }
                }}
                                  style={[styles.navItem, isActive('Beslenme') && styles.activeNavItem]}>
                    <Icon name="food" size={24} color={isActive('Beslenme') ? '#ffffff' : '#ffffff80'}/>
                    <Text style={[styles.label, isActive('Beslenme') && styles.activeLabel]}>Beslenme</Text>
                </TouchableOpacity>

                {/* TODO: Bu buton harici bir yere tıklanınca da ek butonlarını kapatması gerekiyor */}
                <TouchableOpacity onPress={toggleMenu} style={styles.navCenterButton}>
                    <Text style={styles.plusText}>+</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {
                    if (route.name !== 'Randevu') {
                        navigation.replace('Randevu');
                    }
                }}
                                  style={[styles.navItem, isActive('Randevu') && styles.activeNavItem]}>
                    <Icon name="calendar" size={24} color={isActive('Randevu') ? '#ffffff' : '#ffffff80'}/>
                    <Text style={[styles.label, isActive('Randevu') && styles.activeLabel]}>Randevular</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    if (route.name !== 'AnaSayfa') {
                        navigation.replace('AnaSayfa');
                    }
                }}
                                  style={[styles.navItem, isActive('AnaSayfa') && styles.activeNavItem]}>
                    <Icon name="home" size={24} color={isActive('AnaSayfa') ? '#ffffff' : '#ffffff80'}/>
                    <Text style={[styles.label, isActive('AnaSayfa') && styles.activeLabel]}>Ana Sayfa</Text>
                </TouchableOpacity>
            </View>

            {/* Öğün Ekle Popup */}
            <Modal
                transparent
                visible={showMealPopup}
                animationType="fade"
                onRequestClose={() => setShowMealPopup(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.popupBox}>
                        <Text style={styles.popupText}>Yeni Öğün Ekle</Text>
                        <Text style={styles.dialogLabel}>Öğün Türü</Text>
                        <View style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8}}>
                            {mealTypes.map(type => (
                                <TouchableOpacity
                                    key={type}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginRight: 16,
                                        marginBottom: 4
                                    }}
                                    onPress={() => setSelectedMealType(type)}
                                >
                                    <View style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: 10,
                                        borderWidth: 2,
                                        borderColor: '#f57c00',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 4,
                                        backgroundColor: selectedMealType === type ? '#f57c00' : '#fff',
                                    }}>
                                        {selectedMealType === type && <View
                                            style={{width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff'}}/>}
                                    </View>
                                    <Text>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={styles.dialogLabel}>Yemek Adı</Text>
                        <View style={{width: '100%', marginBottom: 8}}>
                            <TextInput
                                style={styles.input}
                                placeholder="Örn: Mercimek çorbası"
                                value={newMeal}
                                onChangeText={setNewMeal}
                            />
                        </View>
                        <Text style={styles.dialogLabel}>Porsiyon/Adet/Gram</Text>
                        <View style={{width: '100%', marginBottom: 16}}>
                            <TextInput
                                style={styles.input}
                                placeholder="Örn: 1 porsiyon, 2 adet, 150g"
                                value={newPortion}
                                onChangeText={setNewPortion}
                            />
                        </View>
                        <View style={{flexDirection: 'row', justifyContent: 'flex-end', width: '100%'}}>
                            <TouchableOpacity onPress={() => setShowMealPopup(false)}
                                              style={[styles.closeButton, {marginRight: 8}]}>
                                <Text style={styles.closeButtonText}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleAddMeal}
                                style={[styles.closeButton, {backgroundColor: isSubmitting ? '#ccc' : '#f57c00'}]}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.closeButtonText}>{isSubmitting ? 'Ekleniyor...' : 'Ekle'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Egzersiz Ekle Popup */}
            <Modal
                transparent
                visible={showExercisePopup}
                animationType="fade"
                onRequestClose={() => setShowExercisePopup(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.popupBox}>
                        <Text style={styles.popupText}>Yeni Egzersiz Ekle</Text>
                        <Text style={styles.dialogLabel}>Egzersiz Türü</Text>
                        <View style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8}}>
                            {exerciseTypes.map(type => (
                                <TouchableOpacity
                                    key={type}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginRight: 16,
                                        marginBottom: 4
                                    }}
                                    onPress={() => setSelectedExerciseType(type)}
                                >
                                    <View style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: 10,
                                        borderWidth: 2,
                                        borderColor: '#f57c00',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 4,
                                        backgroundColor: selectedExerciseType === type ? '#f57c00' : '#fff',
                                    }}>
                                        {selectedExerciseType === type && <View
                                            style={{width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff'}}/>}
                                    </View>
                                    <Text>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={styles.dialogLabel}>Süre (dakika)</Text>
                        <View style={{width: '100%', marginBottom: 16}}>
                            <TextInput
                                style={styles.input}
                                placeholder="Örn: 30"
                                value={exerciseDuration}
                                onChangeText={setExerciseDuration}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={{flexDirection: 'row', justifyContent: 'flex-end', width: '100%'}}>
                            <TouchableOpacity onPress={() => setShowExercisePopup(false)}
                                              style={[styles.closeButton, {marginRight: 8}]}>
                                <Text style={styles.closeButtonText}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleAddExercise}
                                style={[styles.closeButton, {backgroundColor: isExerciseSubmitting ? '#ccc' : '#f57c00'}]}
                                disabled={isExerciseSubmitting}
                            >
                                <Text
                                    style={styles.closeButtonText}>{isExerciseSubmitting ? 'Ekleniyor...' : 'Ekle'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    bottomNavbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 60,
        backgroundColor: '#f57c00',
        borderTopWidth: 1,
        borderTopColor: '#e65100',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowOffset: {width: 0, height: -3},
        shadowRadius: 6,
        elevation: 12,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    label: {
        fontSize: 10,
        color: '#ffffff',
        marginTop: 2
    },
    navCenterButton: {
        backgroundColor: '#ffffff',
        width: 70,
        height: 70,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 28,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: {width: 0, height: 4},
        shadowRadius: 6,
        elevation: 14,
    },
    plusText: {
        fontSize: 38,
        color: '#f57c00',
        marginTop: -2,
    },
    floatingMenuRow: {
        position: 'absolute',
        bottom: 95,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        zIndex: 10,
        gap: 10,
        paddingLeft: 0,
        paddingRight: 15,
    },
    floatingButton: {
        backgroundColor: '#ffffff',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 4,
        elevation: 6,
        zIndex: 11,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        zIndex: 9,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popupBox: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        width: '80%',
        alignItems: 'center',
    },
    popupText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    closeButton: {
        backgroundColor: '#f57c00',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    activeNavItem: {
        opacity: 1,
    },
    activeLabel: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    dialogLabel: {
        fontSize: 14,
        marginTop: 12,
        marginBottom: 4,
        color: '#666',
        fontWeight: '500',
        alignSelf: 'flex-start',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#f9f9f9',
        width: '100%',
        marginBottom: 0,
    },
    toast: {
        position: 'absolute',
        bottom: 80,
        left: 20,
        right: 20,
        backgroundColor: '#333',
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 4,
        elevation: 5,
        zIndex: 9999,
    },
    successToast: {
        backgroundColor: '#4caf50',
    },
    errorToast: {
        backgroundColor: '#f44336',
    },
    toastIcon: {
        marginRight: 8,
    },
    toastText: {
        color: '#fff',
        fontSize: 14,
        flex: 1,
    }
});

export default BottomNav;
