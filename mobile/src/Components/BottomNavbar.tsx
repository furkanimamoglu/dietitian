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

type NavigationProp = {
    replace: (routeName: string) => void;
    navigate: (routeName: string) => void;
};

type Props = {
    navigation: NavigationProp;
};

// Öğün türü ara yüzünü tanımlıyorum
interface MealType {
    id: string;
    name: string;
    apiName: string;
}

// Beslenme planı veri yapısını tanımlıyorum
interface DailyMeal {
    [key: string]: any;
}

const BottomNav = ({navigation}: Props) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showMealPopup, setShowMealPopup] = useState(false);
    const [showExercisePopup, setShowExercisePopup] = useState(false);
    const route = useRoute();
    const [selectedMealType, setSelectedMealType] = useState('');
    const [newMeal, setNewMeal] = useState('');
    const [newPortion, setNewPortion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedExerciseType, setSelectedExerciseType] = useState('Koşu');
    const [exerciseDuration, setExerciseDuration] = useState('');
    const [isExerciseSubmitting, setIsExerciseSubmitting] = useState(false);
    const [nutritionPlanId, setNutritionPlanId] = useState<number | null>(null);
    // Dinamik öğün tiplerini tutacak state
    const [mealTypes, setMealTypes] = useState<MealType[]>([]);
    // Günlük beslenme planını tutacak state
    const [dailyMealPlan, setDailyMealPlan] = useState<DailyMeal | null>(null);
    // Egzersiz tiplerini tutacak değişkeni tanımlıyorum
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

    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const toastOpacity = useState(new Animated.Value(0))[0];

    useEffect(() => {
        fetchNutritionPlanId();
        fetchMealTypes();  // Öğün tiplerini çek
    }, []);

    // Öğün tiplerini getirmek için yeni fonksiyon
    const fetchMealTypes = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('Token Bulunamadı');
                return;
            }

            const response = await fetch(`${config[config.environment].apiUrl}/client/getTodayMealPlan`, {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            // Debug: API yanıtının içeriğini kontrol et
            const responseText = await response.text();
            console.log('API Response:', responseText.substring(0, 100) + '...'); // Çok uzun olmaması için kısaltıyoruz

            // HTML yanıtı başlıyor mu diye kontrol et (JSON sanılıp HTML dönüyorsa)
            if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
                console.error('API HTML yanıtı döndürüyor, JSON değil');
                // Varsayılan değerleri kullan
                useDefaultMealTypes();
                return;
            }

            // Metin yanıtını JSON'a çevirelim
            const data = JSON.parse(responseText);

            // Beslenme planı bilgisini al
            if (data.id || data.nutrition_plan_id) {
                if (data.nutrition_plan_id) {
                    setNutritionPlanId(data.nutrition_plan_id);
                } else if (data.NutritionPlan && data.NutritionPlan.id) {
                    setNutritionPlanId(data.NutritionPlan.id);
                }

                // Bugünkü beslenme planını set et
                await fetchTodayMealPlan(data);

                // Bugünkü gün için öğün tiplerini al
                const todayTurkish = getToday();

                let mealPlanData: any = null;

                if (data.mealPlan) {
                    mealPlanData = data.mealPlan;
                } else if (data.NutritionPlan && data.NutritionPlan.mealPlan) {
                    mealPlanData = data.NutritionPlan.mealPlan;
                }

                // Eğer bugünün bir öğün planı varsa, öğün tiplerini buradan çıkart
                if (mealPlanData && mealPlanData[todayTurkish]) {
                    const mealTypesList: MealType[] = [];

                    // Öğün tiplerini belirle
                    Object.keys(mealPlanData[todayTurkish]).forEach((mealTypeKey, index) => {
                        mealTypesList.push({
                            id: `meal-type-${index}`,
                            name: convertApiMealNameToAppMealName(mealTypeKey),
                            apiName: mealTypeKey
                        });
                    });

                    if (mealTypesList.length > 0) {
                        setMealTypes(mealTypesList);
                        setSelectedMealType(mealTypesList[0].name); // İlk öğün türünü seç
                        return;
                    }
                }
            }

            // Eğer öğün planında öğün tipi bulunamadıysa, varsayılan öğün tiplerini kullan
            useDefaultMealTypes();
        } catch (error) {
            console.error('Error fetching meal types:', error);
            // Hata durumunda varsayılan öğün tiplerini kullan
            useDefaultMealTypes();
        }
    };

    // Varsayılan öğün tiplerini kullanan yardımcı fonksiyon
    const useDefaultMealTypes = () => {
        const defaultMealTypes: MealType[] = [
            { id: 'breakfast', name: 'Kahvaltı', apiName: 'Kahvaltı' },
            { id: 'lunch', name: 'Öğle', apiName: 'Öğle Yemeği' },
            { id: 'dinner', name: 'Akşam', apiName: 'Akşam Yemeği' },
            { id: 'snacks', name: 'Aperatifler', apiName: 'Aparatif' }
        ];

        setMealTypes(defaultMealTypes);
        setSelectedMealType(defaultMealTypes[0].name);
    };

    // API öğün adlarını uygulama içindeki öğün adlarına dönüştüren fonksiyon
    const convertApiMealNameToAppMealName = (apiMealName: string): string => {
        switch (apiMealName) {
            case 'Kahvaltı':
                return 'Kahvaltı';
            case 'Öğle Yemeği':
                return 'Öğle';
            case 'Akşam Yemeği':
                return 'Akşam';
            case 'Aparatif':
                return 'Aperatifler';
            default:
                return apiMealName;
        }
    };

    // Uygulama içindeki öğün adlarını API öğün adlarına dönüştüren fonksiyon
    const convertAppMealNameToApiMealName = (appMealName: string): string => {
        const selectedMealType = mealTypes.find(type => type.name === appMealName);
        if (selectedMealType) {
            return selectedMealType.apiName;
        }

        // Eğer bulunamazsa varsayılan dönüşüm yap
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
                return appMealName;
        }
    };

    // Bugünkü beslenme planını getir
    const fetchTodayMealPlan = async (data?: any) => {
        try {
            if (!data) {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    console.error('Token Bulunamadı');
                    return;
                }

                const response = await fetch(`${config[config.environment].apiUrl}/client/getTodayMealPlan`, {
                    method: 'GET',
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    }
                });

                // API cevabını metin olarak al ve kontrol et
                const responseText = await response.text();

                // HTML yanıtı mı kontrol et
                if (responseText.trim().startsWith('<')) {
                    console.error('API HTML yanıtı döndürüyor, JSON değil');
                    // Varsayılan değerler kullan
                    setDailyMealPlan({
                        'Kahvaltı': [],
                        'Öğle Yemeği': [],
                        'Akşam Yemeği': [],
                        'Aparatif': []
                    });
                    return;
                }

                // Metin yanıtını JSON'a çevir
                try {
                    data = JSON.parse(responseText);
                } catch (e) {
                    console.error('JSON parse hatası:', e);
                    setDailyMealPlan({
                        'Kahvaltı': [],
                        'Öğle Yemeği': [],
                        'Akşam Yemeği': [],
                        'Aparatif': []
                    });
                    return;
                }
            }

            const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
            const today = new Date().getDay();
            const todayTurkish = days[today];

            let mealPlanData: any = null;

            if (data.mealPlan) {
                mealPlanData = data.mealPlan;
            } else if (data.NutritionPlan && data.NutritionPlan.mealPlan) {
                mealPlanData = data.NutritionPlan.mealPlan;
            }

            if (mealPlanData && mealPlanData[todayTurkish]) {
                setDailyMealPlan(mealPlanData[todayTurkish]);
            } else {
                setDailyMealPlan({
                    'Kahvaltı': [],
                    'Öğle Yemeği': [],
                    'Akşam Yemeği': [],
                    'Aparatif': []
                });
            }
        } catch (error) {
            console.error('Error fetching today meal plan:', error);
            // Hata durumunda varsayılan değerleri kullan
            setDailyMealPlan({
                'Kahvaltı': [],
                'Öğle Yemeği': [],
                'Akşam Yemeği': [],
                'Aparatif': []
            });
        }
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setToastVisible(true);

        Animated.timing(toastOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
        }).start();

        setTimeout(() => {
            Animated.timing(toastOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            }).start(() => setToastVisible(false));
        }, 3000);
    };

    // Bugünün Türkçe gün adını döndüren yardımcı fonksiyon
    const getToday = (): string => {
        const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        const today = new Date().getDay();
        return days[today];
    };

    const fetchNutritionPlanId = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('Token Bulunamadı');
                return;
            }

            const response = await fetch(`${config[config.environment].apiUrl}/client/getTodayMealPlan`, {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            // API cevabını metin olarak al ve kontrol et
            const responseText = await response.text();

            // HTML yanıtı mı kontrol et
            if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
                console.error('API HTML yanıtı döndürüyor, JSON değil');
                return;
            }

            // Metin yanıtını JSON'a çevir
            try {
                const data = JSON.parse(responseText);

                if (data.nutrition_plan_id) {
                    setNutritionPlanId(data.nutrition_plan_id);
                } else if (data.NutritionPlan && data.NutritionPlan.id) {
                    setNutritionPlanId(data.NutritionPlan.id);
                }
            } catch (e) {
                console.error('JSON parse hatası:', e);
                return;
            }
        } catch (error) {
            console.error('Error fetching nutrition plan ID:', error);
        }
    };

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
            const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
            const today = new Date().getDay();
            const todayTurkish = days[today];

            if (nutritionPlanId === null) {
                await fetchNutritionPlanId();
                if (nutritionPlanId === null) {
                    showToast('Beslenme planı bulunamadı. Lütfen daha sonra tekrar deneyin.', 'error');
                    setIsSubmitting(false);
                    return;
                }
            }

            const token = await AsyncStorage.getItem('token');
            if (!token) {
                showToast('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.', 'error');
                setIsSubmitting(false);
                return;
            }

            // Seçilen öğün tipinin API adını al
            const selectedMealTypeObj = mealTypes.find(type => type.name === selectedMealType);
            if (!selectedMealTypeObj) {
                showToast('Öğün tipi bulunamadı. Lütfen tekrar deneyin.', 'error');
                setIsSubmitting(false);
                return;
            }
            const apiMealType = selectedMealTypeObj.apiName;

            // Güncel beslenme planını çek
            const response = await fetch(`${config[config.environment].apiUrl}/client/getTodayMealPlan`, {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            // API yanıtını metin olarak al
            const responseText = await response.text();

            // HTML yanıtı mı kontrol et
            if (responseText.trim().startsWith('<')) {
                console.error('API HTML yanıtı döndürüyor, JSON değil');
                showToast('Sunucudan geçersiz yanıt alındı. Lütfen tekrar deneyin.', 'error');
                setIsSubmitting(false);
                return;
            }

            // Metin yanıtını JSON'a çevir
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('JSON parse hatası:', e);
                showToast('Sunucudan geçersiz yanıt alındı. Lütfen tekrar deneyin.', 'error');
                setIsSubmitting(false);
                return;
            }

            let mealPlanData: any = null;

            if (data.mealPlan) {
                mealPlanData = data.mealPlan;
            } else if (data.NutritionPlan && data.NutritionPlan.mealPlan) {
                mealPlanData = data.NutritionPlan.mealPlan;
            }

            // Eğer beslenme planı yoksa yeni oluştur
            if (!mealPlanData) {
                mealPlanData = { [todayTurkish]: {} };
                mealTypes.forEach(type => {
                    mealPlanData[todayTurkish][type.apiName] = [];
                });
            }

            // Bugün için planı yoksa oluştur
            if (!mealPlanData[todayTurkish]) {
                mealPlanData[todayTurkish] = {};
                mealTypes.forEach(type => {
                    mealPlanData[todayTurkish][type.apiName] = [];
                });
            }

            const todayPlan = mealPlanData[todayTurkish];

            // Seçilen öğün tipi için veri yapısını kontrol et ve ekle
            if (!todayPlan[apiMealType]) {
                // Öğün tipi yoksa yeni bir nesne oluştur (Ana Menü formatında)
                todayPlan[apiMealType] = {
                    "Ana Menü": [{
                        name: newMeal,
                        portion: newPortion,
                        eaten: false,
                        timestamp: new Date().toISOString()
                    }]
                };
            } else if (typeof todayPlan[apiMealType] === 'object' &&
                      !Array.isArray(todayPlan[apiMealType]) &&
                      todayPlan[apiMealType] &&
                      todayPlan[apiMealType]["Ana Menü"]) {
                // "Ana Menü" formatında
                if (!todayPlan[apiMealType]["Ana Menü"]) {
                    todayPlan[apiMealType]["Ana Menü"] = [];
                }

                // Aynı yemek adı daha önce eklenmiş mi kontrol et
                const existingMealIndex = todayPlan[apiMealType]["Ana Menü"].findIndex(
                    (item: any) => item.name === newMeal
                );

                // Yeni yemeği ekle
                if (existingMealIndex === -1) {
                    todayPlan[apiMealType]["Ana Menü"].push({
                        name: newMeal,
                        portion: newPortion,
                        eaten: false,
                        timestamp: new Date().toISOString()
                    });
                }
            } else if (Array.isArray(todayPlan[apiMealType])) {
                // Array formatında ise Ana Menü formatına dönüştür
                const existingMeals = todayPlan[apiMealType] as any[];
                todayPlan[apiMealType] = {
                    "Ana Menü": [
                        ...existingMeals.map(item => {
                            if (typeof item === 'string') {
                                return { name: item, portion: "1 porsiyon", eaten: false };
                            }
                            return item;
                        }),
                        { name: newMeal, portion: newPortion, eaten: false, timestamp: new Date().toISOString() }
                    ]
                };
            }

            // Beslenme planını güncelle - TÜM günlerin verilerini koruyacak şekilde güncellendi
            const updateData = {
                nutrition_plan_id: nutritionPlanId,
                mealPlan: {
                    ...mealPlanData,  // Tüm mevcut günlerin verilerini koru
                    [todayTurkish]: todayPlan  // Bugünün güncel verilerini ekle
                }
            };

            console.log('Gönderilen beslenme planı:', JSON.stringify(updateData.mealPlan));
            console.log('Bugünün öğünleri:', JSON.stringify(todayPlan));

            const updateResponse = await fetch(`${config[config.environment].apiUrl}/client/updateMealPlan`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            // API yanıtını metin olarak al
            const updateResponseText = await updateResponse.text();

            // HTML yanıtı mı kontrol et
            if (updateResponseText.trim().startsWith('<')) {
                console.error('API güncelleme yanıtı HTML içeriyor, JSON değil');
                showToast('Öğün eklenirken bir hata oluştu: Sunucu yanıtı geçersiz', 'error');
                setIsSubmitting(false);
                return;
            }

            // Metin yanıtını JSON'a çevir
            let updateResult;
            try {
                updateResult = JSON.parse(updateResponseText);
            } catch (e) {
                console.error('JSON parse hatası:', e);
                showToast('Öğün eklenirken bir hata oluştu: Sunucu yanıtı geçersiz', 'error');
                setIsSubmitting(false);
                return;
            }

            if (!updateResponse.ok) {
                showToast('Öğün eklenirken bir hata oluştu: ' + (updateResult.message || 'Bilinmeyen hata'), 'error');
            } else {
                showToast('Öğün başarıyla eklendi', 'success');
                // Güncel öğün planını yeniden yükle
                fetchTodayMealPlan();
            }

            setShowMealPopup(false);
            setNewMeal('');
            setNewPortion('');
            if (mealTypes.length > 0) {
                setSelectedMealType(mealTypes[0].name);
            }
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
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                showToast('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.', 'error');
                setIsExerciseSubmitting(false);
                return;
            }

            // Güncel egzersiz planını getir
            const response = await fetch(`${config[config.environment].apiUrl}/client/getExercisePlan`, {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            // API yanıtını kontrol et
            if (!response.ok) {
                console.error('Egzersiz planı alınamadı');
                showToast('Egzersiz planı alınamadı. Lütfen tekrar deneyin.', 'error');
                setIsExerciseSubmitting(false);
                return;
            }

            // API yanıtını JSON olarak çözümle
            const data = await response.json();

            // Türkçe gün adını al
            const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
            const today = new Date().getDay();
            const todayTurkish = days[today];

            // Mevcut egzersiz planı
            let exercisePlan = data.exercisePlan || {};

            // Bugün için egzersiz planı yoksa oluştur
            if (!exercisePlan[todayTurkish]) {
                exercisePlan[todayTurkish] = [];
            }

            // Yeni egzersizi ekle
            exercisePlan[todayTurkish].push({
                type: selectedExerciseType,
                duration: exerciseDuration,
                timestamp: new Date().toISOString()
            });

            // Tüm egzersiz planını güncelle (tüm günlerin verilerini koru)
            const updateResponse = await fetch(`${config[config.environment].apiUrl}/client/updateExercisePlan`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    exercisePlan: exercisePlan // Tüm günlerin verileri korunuyor
                })
            });

            // API yanıtını kontrol et
            if (!updateResponse.ok) {
                console.error('Egzersiz eklenirken bir hata oluştu');
                showToast('Egzersiz eklenirken bir hata oluştu. Lütfen tekrar deneyin.', 'error');
                setIsExerciseSubmitting(false);
                return;
            }

            showToast('Egzersiz başarıyla eklendi', 'success');
            setShowExercisePopup(false);
            setSelectedExerciseType('Koşu');
            setExerciseDuration('');
        } catch (e) {
            console.error('Hata:', e);
            showToast('Egzersiz eklenirken bir hata oluştu. Lütfen tekrar deneyin.', 'error');
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
                            navigation.navigate('Randevu');
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
                    if (route.name !== 'Randevu') {
                        navigation.navigate('Randevu');
                    }
                }}
                                  style={[styles.navItem, isActive('Randevu') && styles.activeNavItem]}>
                    <Icon name="calendar" size={24} color={isActive('Randevu') ? '#ffffff' : '#ffffff80'}/>
                    <Text style={[styles.label, isActive('Randevu') && styles.activeLabel]}>Randevular</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    if (route.name !== 'Egzersiz') {
                        navigation.navigate('Egzersiz');
                    }
                }}
                                  style={[styles.navItem, isActive('Egzersiz') && styles.activeNavItem]}>
                    <Icon name="dumbbell" size={24} color={isActive('Egzersiz') ? '#ffffff' : '#ffffff80'}/>
                    <Text style={[styles.label, isActive('Egzersiz') && styles.activeLabel]}>Egzersiz</Text>
                </TouchableOpacity>

                {/* TODO: Bu buton harici bir yere tıklanınca da ek butonlarını kapatması gerekiyor */}
                <TouchableOpacity onPress={toggleMenu} style={styles.navCenterButton}>
                    <Text style={styles.plusText}>+</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {
                    if (route.name !== 'Beslenme') {
                        navigation.navigate('Beslenme');
                    }
                }}
                                  style={[styles.navItem, isActive('Beslenme') && styles.activeNavItem]}>
                    <Icon name="food" size={24} color={isActive('Beslenme') ? '#ffffff' : '#ffffff80'}/>
                    <Text style={[styles.label, isActive('Beslenme') && styles.activeLabel]}>Beslenme</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    if (route.name !== 'Tarif') {
                        navigation.navigate('Tarif');
                    }
                }}
                                  style={[styles.navItem, isActive('Tarif') && styles.activeNavItem]}>
                    <Icon name="book-open-variant" size={24} color={isActive('Tarif') ? '#ffffff' : '#ffffff80'}/>
                    <Text style={[styles.label, isActive('Tarif') && styles.activeLabel]}>Tarif</Text>
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
                                    key={type.id}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginRight: 16,
                                        marginBottom: 4
                                    }}
                                    onPress={() => setSelectedMealType(type.name)}
                                >
                                    <View style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: 10,
                                        borderWidth: 2,
                                        borderColor: '#fc9e21',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 4,
                                        backgroundColor: selectedMealType === type.name ? '#fc9e21' : '#fff',
                                    }}>
                                        {selectedMealType === type.name && <View
                                            style={{width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff'}}/>}
                                    </View>
                                    <Text>{type.name}</Text>
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
                                style={[styles.closeButton, {backgroundColor: isSubmitting ? '#ccc' : '#fc9e21'}]}
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
                                        borderColor: '#fc9e21',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 4,
                                        backgroundColor: selectedExerciseType === type ? '#fc9e21' : '#fff',
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
                                style={[styles.closeButton, {backgroundColor: isExerciseSubmitting ? '#ccc' : '#fc9e21'}]}
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
        backgroundColor: '#fc9e21',
        borderTopWidth: 1,
        borderTopColor: '#cccccc',  // Turuncu çizgiyi (#ff7355) gri gölgelendirme (#cccccc) olarak değiştirdim
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
        color: '#fc9e21',
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
        paddingLeft: 30,
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
        backgroundColor: '#fc9e21',
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

