import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Alert, FlatList, StyleSheet, TextInput, View, Platform, PermissionsAndroid} from 'react-native';
import {
    Avatar,
    Button,
    Card,
    Checkbox,
    Chip,
    Dialog,
    Divider,
    IconButton,
    Portal,
    ProgressBar,
    Provider,
    RadioButton,
    Surface,
    Text
} from 'react-native-paper';
import Header from '../Components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavbar from '../Components/BottomNavbar';
import {launchCamera, launchImageLibrary, ImagePickerResponse, Asset} from 'react-native-image-picker';
import config from '../../config.js';

interface MealItem {
    name: string;
    eaten: boolean;
    portion: string | null;
}

interface MealInfo {
    image: string;
    time: string;
}

interface MealCategory {
    [category: string]: MealItem[];
    info?: MealInfo;
}

interface DailyMeal {
    [mealName: string]: MealCategory;
}

interface WeeklyMealPlan {
    [day: string]: DailyMeal;
}

const mealIcons: { [key: string]: string } = {
    'Kahvaltı': 'coffee',
    'Öğle Yemeği': 'food-variant',
    'Akşam Yemeği': 'food-fork-drink',
    'Aparatif': 'food-apple',
    'Ara Öğün': 'food',
    'Ara Öğün Deneme': 'food-apple-outline',
};

const Beslenme = ({navigation}: { navigation: any }) => {
    const [currentDay, setCurrentDay] = useState<string>('Pazartesi');
    const [mealPlan, setMealPlan] = useState<WeeklyMealPlan>({});
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState<string>('');
    const [selectedMealCategory, setSelectedMealCategory] = useState<string>('Alternatif');
    const [newMeal, setNewMeal] = useState('');
    const [newPortion, setNewPortion] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEmpty, setIsEmpty] = useState(false);
    const [nutritionPlanId, setNutritionPlanId] = useState<number | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [mealToDelete, setMealToDelete] = useState<{mealType: string, category: string, index: number} | null>(null);
    const [imageResponse, setImageResponse] = useState<Asset | null>(null);

    useEffect(() => {
        fetchTodayMeal();
    }, []);

    const fetchTodayMeal = async () => {
        try {
            setLoading(true);
            setError(null);

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

            const data = await response.json();

            if (data.showOnScreen && data.message) {
                setError(data.message);
                setIsEmpty(true);
                setLoading(false);
                return;
            }

            if (data.nutrition_plan_id) {
                setNutritionPlanId(parseInt(data.nutrition_plan_id));
            } else if (data.NutritionPlan && data.NutritionPlan.id) {
                setNutritionPlanId(parseInt(data.NutritionPlan.id));
            }

            const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
            const today = new Date().getDay();
            const todayTurkish = days[today];

            const mealPlanData = data.mealPlan || {};
            setMealPlan(mealPlanData);

            if (mealPlanData && mealPlanData[todayTurkish]) {
                setCurrentDay(todayTurkish);
                if (Object.keys(mealPlanData[todayTurkish]).length > 0) {
                    setSelectedMealType(Object.keys(mealPlanData[todayTurkish])[0]);
                }
            } else if (mealPlanData && Object.keys(mealPlanData).length > 0) {
                const firstAvailableDay = Object.keys(mealPlanData)[0];
                setCurrentDay(firstAvailableDay);
                if (Object.keys(mealPlanData[firstAvailableDay]).length > 0) {
                    setSelectedMealType(Object.keys(mealPlanData[firstAvailableDay])[0]);
                }
            }

            if (!mealPlanData || Object.keys(mealPlanData).length === 0) {
                setIsEmpty(true);
                setError('Beslenme planı bulunamadı.');
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching meal plan:', error);
            setError('Beslenme planı yüklenemedi. Lütfen tekrar deneyin.');
            setIsEmpty(true);
            setLoading(false);
        } finally {
            setRefreshing(false);
        }
    };

    const updateMealPlanOnServerFromNewFormat = async (updatedMealPlan: WeeklyMealPlan) => {
        try {
            if (nutritionPlanId === null) {
                console.error('Nutrition plan ID is missing, cannot update meal plan');
                Alert.alert('Hata', 'Beslenme planı güncellenemiyor. Plan ID bulunamadı.');
                return;
            }

            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('Token Bulunamadı');
                return;
            }

            const mealPlanUpdate = {
                nutrition_plan_id: nutritionPlanId,
                mealPlan: updatedMealPlan
            };

            const response = await fetch(`${config[config.environment].apiUrl}/client/updateMealPlan`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(mealPlanUpdate)
            });

            const data = await response.json();
            console.log('Meal plan update response:', data);

            if (!response.ok) {
                Alert.alert('Hata', 'Beslenme planı güncellenirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Error updating meal plan:', error);
            Alert.alert('Hata', 'Beslenme planı güncellenirken bir hata oluştu.');
        }
    };

    const getTotalMealItems = (): number => {
        if (!mealPlan[currentDay]) return 0;

        return Object.values(mealPlan[currentDay]).reduce((total, mealType) => {
            return total + Object.entries(mealType).reduce((mealTotal, [category, items]) => {
                // "info" nesnesi olduğunda atla, çünkü bu bir dizi değil
                if (category === 'info') return mealTotal;

                // Dizi ise öğeleri say
                return mealTotal + items.length;
            }, 0);
        }, 0);
    };

    const getEatenMealItems = (): number => {
        if (!mealPlan[currentDay]) return 0;

        return Object.values(mealPlan[currentDay]).reduce((total, mealType) => {
            return total + Object.entries(mealType).reduce((mealTotal, [category, items]) => {
                // "info" nesnesi olduğunda atla, çünkü bu bir dizi değil
                if (category === 'info') return mealTotal;

                // Dizi ise yenmiş öğeleri say
                return mealTotal + items.filter(item => item.eaten).length;
            }, 0);
        }, 0);
    };

    const toggleMealItemEaten = (mealType: string, category: string, index: number) => {
        if (!mealPlan[currentDay] || !mealPlan[currentDay][mealType]) return;

        const updatedMealPlan = {...mealPlan};
        updatedMealPlan[currentDay][mealType][category][index].eaten =
            !updatedMealPlan[currentDay][mealType][category][index].eaten;

        setMealPlan(updatedMealPlan);

        updateMealPlanOnServerFromNewFormat(updatedMealPlan);
    };

    const addMealItem = () => {
        if (!newMeal || !selectedMealType || !selectedMealCategory) return;

        const updatedMealPlan = {...mealPlan};

        if (!updatedMealPlan[currentDay]) {
            updatedMealPlan[currentDay] = {};
        }

        if (!updatedMealPlan[currentDay][selectedMealType]) {
            updatedMealPlan[currentDay][selectedMealType] = {};
        }

        if (!updatedMealPlan[currentDay][selectedMealType][selectedMealCategory]) {
            updatedMealPlan[currentDay][selectedMealType][selectedMealCategory] = [];
        }

        updatedMealPlan[currentDay][selectedMealType][selectedMealCategory].push({
            name: newMeal,
            eaten: false,
            portion: newPortion || null
        });

        setMealPlan(updatedMealPlan);
        setModalVisible(false);
        setNewMeal('');
        setNewPortion('');

        updateMealPlanOnServerFromNewFormat(updatedMealPlan);
    };

    const handleDayChange = (day: string) => {
        setCurrentDay(day);
        if (mealPlan[day] && Object.keys(mealPlan[day]).length > 0) {
            setSelectedMealType(Object.keys(mealPlan[day])[0]);
        }
    };

    const getCompletionText = () => {
        const totalItems = getTotalMealItems();
        const eatenItems = getEatenMealItems();
        const percentage = totalItems > 0 ? Math.round((eatenItems / totalItems) * 100) : 0;

        if (percentage === 0) return "Henüz başlamadın";
        if (percentage < 30) return "İyi başlangıç";
        if (percentage < 70) return "İyi gidiyorsun";
        if (percentage < 100) return "Neredeyse tamamlandı";
        return "Tüm öğünler tamamlandı";
    };

    const renderEmptyMealPlan = () => {
        return (
            <View style={styles.emptyContainer}>
                <Avatar.Icon
                    size={80}
                    icon="food-off"
                    color="#ff9800"
                    style={{backgroundColor: '#fff3e0', marginBottom: 20}}
                />
                <Text style={styles.emptyTitle}>Bugün diyet yok mu?</Text>
                <Text style={styles.emptyText}>
                    {error || "Bugüne tanımlanmış bir beslenme programınız bulunmamaktadır. Diyetisyeninizden bir program tanımlamasını talep edebilirsiniz"}
                </Text>
                <Button
                    mode="contained"
                    icon="message-text"
                    onPress={() => navigation.navigate('Mesajlar')}
                    style={styles.contactButton}
                >
                    Diyetisyeninize Mesaj Gönder
                </Button>
            </View>
        );
    };

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4caf50"/>
                    <Text style={styles.loadingText}>Beslenme planı yükleniyor...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.errorContainer}>
                    <Avatar.Icon
                        size={60}
                        icon="information"
                        color="#ff9800"
                        style={{backgroundColor: '#fff3e0'}}
                    />
                    <Text style={styles.errorText}>{error}</Text>
                    <Button
                        mode="contained"
                        onPress={fetchTodayMeal}
                        style={styles.retryButton}
                    >
                        Tekrar Dene
                    </Button>
                </View>
            );
        }

        if (isEmpty || !mealPlan[currentDay]) {
            return renderEmptyMealPlan();
        }

        const totalItems = getTotalMealItems();
        const eatenItems = getEatenMealItems();
        const progress = totalItems > 0 ? eatenItems / totalItems : 0;
        const availableDays = Object.keys(mealPlan);

        return (
            <>
                {/* Gün seçimi */}
                <View style={styles.daySelector}>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={availableDays}
                        keyExtractor={(item) => item}
                        renderItem={({item}) => (
                            <Chip
                                selected={item === currentDay}
                                onPress={() => handleDayChange(item)}
                                style={[
                                    styles.dayChip,
                                    item === currentDay && styles.selectedDayChip
                                ]}
                                textStyle={item === currentDay ? styles.selectedDayText : styles.dayText}
                                mode="outlined"
                            >
                                {item}
                            </Chip>
                        )}
                        contentContainerStyle={styles.dayChipsContainer}
                    />
                </View>

                <Surface style={styles.headerCard}>
                    <Text style={styles.sectionTitle}>Beslenme Planın</Text>
                    <Text style={styles.sectionSubtitle}>{currentDay} - Dengeli beslen, enerjik hisset</Text>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressTextRow}>
                            <Text style={styles.progressPercentage}>%{Math.round(progress * 100)}</Text>
                            <Text style={styles.progressDescription}>{getCompletionText()}</Text>
                        </View>
                        <ProgressBar progress={progress} color="#4caf50" style={styles.progressBar}/>
                    </View>
                </Surface>

                {/* Öğün kartları */}
                {Object.entries(mealPlan[currentDay]).map(([mealType, mealCategories]) => (
                    <Card key={mealType} style={styles.mealCard} mode="elevated">
                        <Card.Title
                            title={mealType}
                            subtitle={
                                <View style={styles.subtitleContainer}>
                                    {mealCategories.info?.time && (
                                        <View style={styles.timeContainer}>
                                            <Avatar.Icon
                                                size={16}
                                                icon="clock-outline"
                                                color="#4caf50"
                                                style={styles.clockIcon}
                                            />
                                            <Text style={styles.timeText}>{mealCategories.info.time}</Text>
                                        </View>
                                    )}
                                </View>
                            }
                            titleStyle={styles.mealTitleText}
                            left={(props) => (
                                <Avatar.Icon
                                    size={48}
                                    icon={mealIcons[mealType] || 'food'}
                                    color="#4caf50"
                                    style={styles.mealIcon}
                                />
                            )}
                            right={(props) => (
                                <View style={styles.headerButtonsContainer}>
                                    <IconButton
                                        icon="camera"
                                        size={22}
                                        iconColor="#4caf50"
                                        style={styles.headerButton}
                                        onPress={() => {
                                            setSelectedMealType(mealType);
                                            openCamera();
                                        }}
                                    />
                                    <IconButton
                                        icon="image"
                                        size={22}
                                        iconColor="#4caf50"
                                        style={styles.headerButton}
                                        onPress={() => {
                                            setSelectedMealType(mealType);
                                            openGallery();
                                        }}
                                    />
                                </View>
                            )}
                        />

                        {/* Yemek resmi alanı */}
                        {mealCategories.info?.image ? (
                            <Card.Cover
                                source={{ uri: mealCategories.info.image }}
                                style={styles.mealImage}
                            />
                        ) : (
                            <View style={styles.emptyImageContainer}>
                                <Avatar.Icon
                                    size={60}
                                    icon="image-plus"
                                    color="#4caf50"
                                    style={styles.emptyImageIcon}
                                />
                                <Text style={styles.emptyImageText}>
                                    Öğününün resmini yükle!
                                </Text>
                                <Text style={styles.emptyImageSubText}>
                                    Yediğin yemeğin fotoğrafını çek veya galeriden seç
                                </Text>
                            </View>
                        )}

                        <Divider/>

                        {/* Öğün kategorileri */}
                        {Object.entries(mealCategories).map(([category, meals]) => {
                            // "info" nesnesi ise bu kategoriyi atla
                            if (category === 'info') return null;

                            return (
                            <View key={`${mealType}-${category}`}>
                                {/* Eğer birden fazla kategori varsa kategori başlığını göster */}
                                {Object.keys(mealCategories).filter(cat => cat !== 'info').length > 1 && (
                                    <View style={styles.categoryHeader}>
                                        <Text style={styles.categoryTitle}>{category}</Text>
                                        <IconButton
                                            icon="plus"
                                            size={16}
                                            onPress={() => {
                                                setSelectedMealType(mealType);
                                                setSelectedMealCategory(category);
                                                setModalVisible(true);
                                            }}
                                            style={styles.smallAddButton}
                                        />
                                    </View>
                                )}

                                <Card.Content style={styles.cardContent}>
                                    {Array.isArray(meals) && meals.length === 0 ? (
                                        <Text style={styles.emptyMealText}>
                                            Bu öğün için henüz yemek eklenmemiş
                                        </Text>
                                    ) : Array.isArray(meals) ? (
                                        meals.map((meal, index) => (
                                            <View key={index} style={styles.mealItemContainer}>
                                                <View style={styles.mealItem}>
                                                    <Checkbox.Android
                                                        status={meal.eaten ? 'checked' : 'unchecked'}
                                                        onPress={() => toggleMealItemEaten(mealType, category, index)}
                                                        color="#4caf50"
                                                    />
                                                    <View style={styles.mealInfo}>
                                                        <Text style={[
                                                            styles.mealName,
                                                            meal.eaten && styles.mealChecked
                                                        ]}>
                                                            {meal.name}
                                                        </Text>
                                                        {meal.portion && (
                                                            <Text style={styles.portionText}>
                                                                {meal.portion}
                                                            </Text>
                                                        )}
                                                    </View>
                                                    <IconButton
                                                        icon="delete"
                                                        iconColor="#e53935"
                                                        size={20}
                                                        onPress={() => {
                                                            setMealToDelete({mealType, category, index});
                                                            setDeleteModalVisible(true);
                                                        }}
                                                        style={styles.deleteButton}
                                                    />
                                                </View>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={styles.emptyMealText}>
                                            Bu öğün için henüz yemek eklenmemiş
                                        </Text>
                                    )}
                                </Card.Content>
                            </View>
                            );
                        })}

                        {/* Yeni Öğün Ekle butonu */}
                        <View style={styles.addMealButtonContainer}>
                            <Button
                                mode="contained"
                                icon="plus"
                                onPress={() => {
                                    setSelectedMealType(Object.keys(mealCategories)[0]);
                                    setSelectedMealCategory('Alternatif');
                                    setModalVisible(true);
                                }}
                                style={styles.addMealButton}
                            >
                                Yeni Öğün Ekle
                            </Button>
                        </View>
                    </Card>
                ))}

                {/* Ekstra boşluk - FAB button için */}
                <View style={{height: 80}}/>
            </>
        );
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTodayMeal();
    }, []);

    const renderFlatListContent = () => {
        const contentArray = [{key: 'content'}];
        return (
            <FlatList
                data={contentArray}
                keyExtractor={(item) => item.key}
                renderItem={() => (
                    <View>
                        {renderContent()}
                    </View>
                )}
                refreshing={refreshing}
                onRefresh={onRefresh}
                contentContainerStyle={loading || error || isEmpty ? styles.centeredContent : styles.content}
                showsVerticalScrollIndicator={false}
            />

        );
    };

    // Kamera izinlerini kontrol et ve gerekirse iste
    const requestCameraPermission = async (): Promise<boolean> => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: "Kamera İzni",
                        message: "Fotoğraf çekebilmek için kamera izni gerekiyor.",
                        buttonPositive: "Tamam",
                        buttonNegative: "İptal",
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true; // iOS otomatik olarak izin isteyeceği için true dönüyoruz
    };

    // Depolama izinlerini kontrol et ve gerekirse iste (Android için)
    const requestStoragePermission = async (): Promise<boolean> => {
        if (Platform.OS === 'android') {
            try {
                // Android 13 (API 33) ve üzeri sürümlerde farklı bir izin gerekiyor
                const permission = parseInt(Platform.Version.toString(), 10) >= 33
                    ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                    : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

                const granted = await PermissionsAndroid.request(
                    permission,
                    {
                        title: "Galeri Erişim İzni",
                        message: "Galeri erişim izni olmadan fotoğraflarınıza erişilemez.",
                        buttonPositive: "Tamam",
                        buttonNegative: "İptal",
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true; // iOS otomatik olarak izin isteyeceği için true dönüyoruz
    };

    // Kamerayı başlat
    const openCamera = async () => {
        const hasPermission = await requestCameraPermission();

        if (!hasPermission) {
            Alert.alert('İzin Reddedildi', 'Kamera izni olmadan fotoğraf çekemezsiniz.');
            return;
        }

        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 1200,
            maxWidth: 1200,
            quality: 0.8,
            saveToPhotos: true,
        };

        launchCamera(options, (response: ImagePickerResponse) => {
            if (response.didCancel) {
                console.log('Kullanıcı kamerayı iptal etti');
            } else if (response.errorCode) {
                console.log('ImagePicker Hatası: ', response.errorMessage);
                Alert.alert('Hata', response.errorMessage || 'Kamera açılırken bir hata oluştu');
            } else if (response.assets && response.assets.length > 0) {
                console.log('Çekilen fotoğraf: ', response.assets[0]);
                setImageResponse(response.assets[0]);
                handleImageSelected(response.assets[0]);
            }
        });
    };

    // Galeriyi aç
    const openGallery = async () => {
        const hasPermission = await requestStoragePermission();

        if (!hasPermission) {
            Alert.alert('İzin Reddedildi', 'Galeri erişim izni olmadan fotoğraf seçemezsiniz.');
            return;
        }

        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 1200,
            maxWidth: 1200,
            quality: 0.8,
        };

        launchImageLibrary(options, (response: ImagePickerResponse) => {
            if (response.didCancel) {
                console.log('Kullanıcı galeriyi iptal etti');
            } else if (response.errorCode) {
                console.log('ImagePicker Hatası: ', response.errorMessage);
                Alert.alert('Hata', response.errorMessage || 'Galeri açılırken bir hata oluştu');
            } else if (response.assets && response.assets.length > 0) {
                console.log('Seçilen fotoğraf: ', response.assets[0]);
                setImageResponse(response.assets[0]);
                handleImageSelected(response.assets[0]);
            }
        });
    };

    // Fotoğraf seçildiğinde yapılacak işlemler
    const handleImageSelected = async (asset: Asset) => {
        try {
            if (!asset.uri) {
                Alert.alert("Hata", "Fotoğraf yüklenemedi, geçerli bir resim seçiniz.");
                return;
            }

            // Hangi öğün için resim yüklendiğinin kontrolü
            if (!selectedMealType || !mealPlan[currentDay] || !mealPlan[currentDay][selectedMealType]) {
                Alert.alert("Hata", "Lütfen önce bir öğün seçiniz.");
                return;
            }

            // Yüklenme durumu için loading göster
            setLoading(true);

            // FormData oluştur
            const formData = new FormData();
            formData.append('image', {
                uri: asset.uri,
                type: asset.type || 'image/jpeg',
                name: asset.fileName || 'photo.jpg',
            } as any);

            // Token al
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('Token Bulunamadı');
                setLoading(false);
                return;
            }

            // Resmi yükle
            const response = await fetch(`${config[config.environment].apiUrl}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok || !data.imageUrl) {
                throw new Error(data.message || 'Resim yüklenemedi.');
            }

            // MealPlan nesnesini güncelle
            const updatedMealPlan = {...mealPlan};

            if (!updatedMealPlan[currentDay][selectedMealType].info) {
                updatedMealPlan[currentDay][selectedMealType].info = {
                    time: updatedMealPlan[currentDay][selectedMealType].info?.time || '',
                    image: data.imageUrl
                };
            } else {
                updatedMealPlan[currentDay][selectedMealType].info.image = data.imageUrl;
            }

            setMealPlan(updatedMealPlan);

            await updateMealPlanOnServerFromNewFormat(updatedMealPlan);
        } catch (error) {
            console.error('Resim yükleme hatası:', error);
            Alert.alert("Hata", error instanceof Error ? error.message : "Resim yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Provider>
            <View style={styles.container}>
                <Header navigation={navigation}/>

                {renderFlatListContent()}

                <BottomNavbar navigation={navigation}/>

                <Portal>
                    <Dialog visible={modalVisible} onDismiss={() => setModalVisible(false)} style={styles.dialog}>
                        <Dialog.Title>Yeni Yemek Ekle</Dialog.Title>
                        <Dialog.Content>
                            <Text style={styles.dialogLabel}>Öğün Türü</Text>
                            {mealPlan[currentDay] && (
                                <RadioButton.Group onValueChange={value => setSelectedMealType(value)}
                                                value={selectedMealType}>
                                    <View style={styles.radioButtonsContainer}>
                                        {Object.keys(mealPlan[currentDay]).map(type => (
                                            <View key={type} style={styles.radioOption}>
                                                <RadioButton.Android value={type} color="#4caf50"/>
                                                <Text>{type}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </RadioButton.Group>
                            )}

                            {selectedMealType && mealPlan[currentDay] && mealPlan[currentDay][selectedMealType] && (
                                <>
                                    <Text style={styles.dialogLabel}>Kategori</Text>
                                    <RadioButton.Group onValueChange={value => setSelectedMealCategory(value)}
                                                    value={selectedMealCategory}>
                                        <View style={styles.radioButtonsContainer}>
                                            {Object.keys(mealPlan[currentDay][selectedMealType]).map(category => (
                                                <View key={category} style={styles.radioOption}>
                                                    <RadioButton.Android value={category} color="#4caf50"/>
                                                    <Text>{category}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </RadioButton.Group>
                                </>
                            )}

                            <Text style={styles.dialogLabel}>Yemek Adı</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Örn: Mercimek çorbası"
                                value={newMeal}
                                onChangeText={setNewMeal}
                            />

                            <Text style={styles.dialogLabel}>Porsiyon/Adet/Gram</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Örn: 1 porsiyon, 2 adet, 150g"
                                value={newPortion}
                                onChangeText={setNewPortion}
                            />
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => setModalVisible(false)} textColor="#666">İptal</Button>
                            <Button onPress={addMealItem} mode="contained" buttonColor="#4caf50">Ekle</Button>
                        </Dialog.Actions>
                    </Dialog>

                    {/* Silme onayı için modal */}
                    <Dialog visible={deleteModalVisible} onDismiss={() => setDeleteModalVisible(false)} style={styles.dialog}>
                        <Dialog.Title>Yemek Sil</Dialog.Title>
                        <Dialog.Content>
                            <Text>Bu öğünü silmek istediğinize emin misiniz?</Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => setDeleteModalVisible(false)} textColor="#666">İptal</Button>
                            <Button
                                onPress={() => {
                                    if (mealToDelete) {
                                        const {mealType, category, index} = mealToDelete;
                                        const updatedMealPlan = {...mealPlan};
                                        updatedMealPlan[currentDay][mealType][category].splice(index, 1);

                                        setMealPlan(updatedMealPlan);
                                        setDeleteModalVisible(false);

                                        updateMealPlanOnServerFromNewFormat(updatedMealPlan);
                                    }
                                }}
                                mode="contained" buttonColor="#e53935"
                            >
                                Sil
                            </Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </View>
        </Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    content: {
        flexGrow: 1,
        padding: 16
    },
    centeredContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666'
    },
    noticeContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    noticeText: {
        marginTop: 16,
        marginBottom: 16,
        fontSize: 16,
        color: '#fc9e21',
        textAlign: 'center'
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fc9e21',
        marginBottom: 12
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24
    },
    contactButton: {
        marginTop: 16,
        backgroundColor: '#fc9e21',
        paddingHorizontal: 16
    },
    retryButton: {
        marginTop: 16,
        backgroundColor: '#4caf50'
    },

    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 4,
        textAlign: 'center'
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        textAlign: 'center'
    },
    progressTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 4
    },
    progressPercentage: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4caf50',
        minWidth: 60
    },
    progressDescription: {
        fontSize: 14,
        color: '#666',
        flex: 1,
        textAlign: 'right',
        marginLeft: 12
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600'
    },
    mealInfo: {
        flex: 1,
        marginLeft: 8
    },
    mealNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    mealName: {
        fontSize: 16,
        marginBottom: 4
    },
    mealChecked: {
        textDecorationLine: 'line-through',
        color: '#999'
    },
    portionText: {
        fontSize: 14,
        color: '#fb8c00',
        fontWeight: '500',
        marginLeft: 8
    },
    alternativesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingLeft: 46,
        marginTop: -4,
        marginBottom: 8,
        gap: 8
    },
    alternativeChip: {
        backgroundColor: '#fff8e1',
        borderColor: '#ffb300',
        height: 28
    },
    alternativeChipText: {
        fontSize: 12,
        color: '#f57c00'
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 70,
        backgroundColor: '#fc9e21'
    },
    dialog: {
        borderRadius: 12
    },
    dialogLabel: {
        fontSize: 14,
        marginTop: 12,
        marginBottom: 4,
        color: '#666',
        fontWeight: '500'
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#f9f9f9'
    },
    radioButtonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginVertical: 8
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        marginVertical: 4
    },
    statsCard: {
        padding: 16,
        marginBottom: 16,
        borderRadius: 12,
        elevation: 2
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
        color: '#424242',
        textAlign: 'center'
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    statItem: {
        alignItems: 'center'
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 4
    },
    statLabel: {
        fontSize: 12,
        color: '#666'
    },
    emptyMealText: {
        fontStyle: 'italic',
        color: '#999',
        textAlign: 'center',
        paddingVertical: 12
    },
    daySelector: {
        paddingVertical: 16,
        paddingHorizontal: 8,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        elevation: 2
    },
    dayChipsContainer: {
        paddingVertical: 8
    },
    dayChip: {
        marginRight: 8,
        borderRadius: 16
    },
    selectedDayChip: {
        backgroundColor: '#4caf50',
        borderColor: '#388e3c'
    },
    selectedDayText: {
        color: '#fff',
        fontWeight: 'bold'
    },
    dayText: {
        color: '#4caf50',
        fontWeight: '500'
    },
    smallAddButton: {
        marginLeft: 8,
        backgroundColor: '#e8f5e9'
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
    mealTimeText: {
        fontSize: 14,
        color: '#666'
    },
    deleteButton: {
        margin: 0,
        padding: 0,
        marginLeft: 5
    },
    mealCard: {
        marginBottom: 18,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    mealIcon: {
        backgroundColor: '#e8f5e9',
        marginRight: 8,
        elevation: 2,
        shadowColor: '#4caf50',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    mealTitleText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2e7d32',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    subtitleContainer: {
        marginTop: 4,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f8e9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 2,
    },
    clockIcon: {
        backgroundColor: 'transparent',
        marginRight: 4,
    },
    timeText: {
        fontSize: 14,
        color: '#2e7d32',
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    headerButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },
    headerButton: {
        marginLeft: 4,
        backgroundColor: '#e8f5e9',
        elevation: 1,
        shadowColor: '#4caf50',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
    },
    cardContent: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#fafafa',
    },
    mealItemContainer: {
        marginBottom: 12,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    mealItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#495057',
        letterSpacing: 0.3,
    },
    addMealButtonContainer: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        backgroundColor: '#ffffff',
    },
    addMealButton: {
        width: '100%',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        backgroundColor: '#4caf50',
        elevation: 2,
        shadowColor: '#4caf50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    // Header card iyileştirmesi
    headerCard: {
        padding: 20,
        marginBottom: 20,
        borderRadius: 16,
        elevation: 4,
        backgroundColor: '#ffffff',
        shadowColor: '#4caf50',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#4caf50',
    },
    progressContainer: {
        marginTop: 12,
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
    },
    progressBar: {
        height: 12,
        borderRadius: 12,
        backgroundColor: '#e9ecef',
    },
    mealImage: {
        height: 150,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    emptyImageContainer: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        height: 150,
        backgroundColor: '#f9f9f9',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    emptyImageIcon: {
        backgroundColor: '#e8f5e9',
        marginBottom: 8,
    },
    emptyImageText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#4caf50',
        marginBottom: 4,
        textAlign: 'center'
    },
    emptyImageSubText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20
    }
});

export default Beslenme;
