import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Alert, FlatList, StyleSheet, TextInput, View} from 'react-native';
import {
    Avatar,
    Button,
    Card,
    Checkbox,
    Chip,
    Dialog,
    Divider,
    FAB,
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
import config from '../../config.js';

interface MealItem {
    name: string;
    eaten: boolean;
    portion: string | null;
}

interface MealCategory {
    [category: string]: MealItem[];
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
    // Varsayılan icon için 'food' kullanılacak
};

const Beslenme = ({navigation}: { navigation: any }) => {
    const [currentDay, setCurrentDay] = useState<string>('Pazartesi');
    const [mealPlan, setMealPlan] = useState<WeeklyMealPlan>({});
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState<string>('');
    const [selectedMealCategory, setSelectedMealCategory] = useState<string>('Ana Menü');
    const [newMeal, setNewMeal] = useState('');
    const [newPortion, setNewPortion] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEmpty, setIsEmpty] = useState(false);
    const [nutritionPlanId, setNutritionPlanId] = useState<number | null>(null);
    const [refreshing, setRefreshing] = useState(false);

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
                setNutritionPlanId(data.nutrition_plan_id);
            } else if (data.NutritionPlan && data.NutritionPlan.id) {
                setNutritionPlanId(data.NutritionPlan.id);
            }

            const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
            const today = new Date().getDay();
            const todayTurkish = days[today];

            setMealPlan(data);

            if (data && data[todayTurkish]) {
                setCurrentDay(todayTurkish);
                if (Object.keys(data[todayTurkish]).length > 0) {
                    setSelectedMealType(Object.keys(data[todayTurkish])[0]);
                }
            } else if (data && Object.keys(data).length > 0) {
                const firstAvailableDay = Object.keys(data)[0];
                setCurrentDay(firstAvailableDay);
                if (Object.keys(data[firstAvailableDay]).length > 0) {
                    setSelectedMealType(Object.keys(data[firstAvailableDay])[0]);
                }
            }

            if (!data || Object.keys(data).length === 0) {
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

    const updateMealsFromPlan = (dayPlan: DailyMeal) => {
        const newMeals: { [key: string]: MealItem[] } = {
            Kahvaltı: [],
            Öğle: [],
            Akşam: [],
            Aperatifler: []
        };

        const processMealItems = (mealData: any, mealType: string) => {
            if (!mealData) return;

            let mainItems: string[] = [];
            let alternatives: { [key: string]: string[] } = {};
            let checkedItems: { [key: string]: boolean } = {};

            if (Array.isArray(mealData) && mealData.length > 0 && mealData[0].hasOwnProperty('isim')) {
                mainItems = mealData.map(item => item.isim);
                mealData.forEach(item => {
                    checkedItems[item.isim] = item.yenildi;
                });
            } else if (mealData.main && Array.isArray(mealData.main)) {
                mainItems = [...mealData.main];
                alternatives = mealData.alternatives || {};
            } else if (Array.isArray(mealData)) {
                mainItems = [...mealData];
            } else if (typeof mealData === 'string') {
                mainItems = mealData.split(', ').map(item => item.trim()).filter(item => item !== '');
            }

            const targetMeal = convertApiMealNameToAppMealName(mealType);
            if (targetMeal && newMeals[targetMeal]) {
                newMeals[targetMeal] = mainItems.map(item => {
                    const itemAlternatives = alternatives[item] || [];
                    return {
                        item,
                        checked: checkedItems[item] || false,
                        portion: '1 porsiyon',
                        alternatives: itemAlternatives.length > 0 ? itemAlternatives : undefined
                    };
                });
            }
        };

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
                    return '';
            }
        };

        if (dayPlan.Kahvaltı) {
            processMealItems(dayPlan.Kahvaltı, 'Kahvaltı');
        }

        if (dayPlan['Öğle Yemeği']) {
            processMealItems(dayPlan['Öğle Yemeği'], 'Öğle Yemeği');
        }

        if (dayPlan['Akşam Yemeği']) {
            processMealItems(dayPlan['Akşam Yemeği'], 'Akşam Yemeği');
        }

        if (dayPlan.Aparatif) {
            processMealItems(dayPlan.Aparatif, 'Aparatif');
        }

        setMeals(newMeals);
    };

    const toggleCheck = (mealType: string, index: number) => {
        const newMeals = {...meals};
        newMeals[mealType][index].checked = !newMeals[mealType][index].checked;
        setMeals(newMeals);

        updateMealPlanOnServer(newMeals);
    };

    const openModal = () => {
        setSelectedMealType('Kahvaltı');
        setNewMeal('');
        setNewPortion('');
        setModalVisible(true);
    };

    const addMeal = () => {
        if (newMeal && selectedMealType) {
            const updatedMeals = {...meals};
            updatedMeals[selectedMealType].push({
                item: newMeal,
                checked: false,
                portion: newPortion || '1 porsiyon'
            });
            setMeals(updatedMeals);
            setNewMeal('');
            setNewPortion('');
            setModalVisible(false);

            updateMealPlanOnServer(updatedMeals);
        }
    };

    const updateMealPlanOnServer = async (updatedMeals: { [key: string]: MealItem[] }) => {
        try {
            if (nutritionPlanId === null) {
                console.error('Nutrition plan ID is missing, cannot update meal plan');
                Alert.alert('Hata', 'Beslenme planı güncellenemiyor. Plan ID bulunamadı.');
                return;
            }

            const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
            const today = new Date().getDay();
            const todayTurkish = days[today];

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

            const updatedDayPlan: DailyMeal = {
                Kahvaltı: [],
                'Öğle Yemeği': [],
                'Akşam Yemeği': [],
                Aparatif: []
            };

            Object.entries(updatedMeals).forEach(([mealType, items]) => {
                const apiMealType = convertAppMealNameToApiMealName(mealType);
                if (apiMealType) {
                    updatedDayPlan[apiMealType as keyof DailyMeal] = items.map(item => ({
                        isim: item.item,
                        yenildi: item.checked
                    }));
                }
            });

            const mealPlanUpdate = {
                nutrition_plan_id: nutritionPlanId,
                mealPlan: {
                    [todayTurkish]: updatedDayPlan
                }
            };

            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('Token Bulunamadı');
                return;
            }

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

    // Helper functions for the new meal plan structure
    const getTotalMealItems = (): number => {
        if (!mealPlan[currentDay]) return 0;

        return Object.values(mealPlan[currentDay]).reduce((total, mealType) => {
            return total + Object.values(mealType).reduce((mealTotal, category) => {
                return mealTotal + category.length;
            }, 0);
        }, 0);
    };

    const getEatenMealItems = (): number => {
        if (!mealPlan[currentDay]) return 0;

        return Object.values(mealPlan[currentDay]).reduce((total, mealType) => {
            return total + Object.values(mealType).reduce((mealTotal, category) => {
                return mealTotal + category.filter(item => item.eaten).length;
            }, 0);
        }, 0);
    };

    const toggleMealItemEaten = (mealType: string, category: string, index: number) => {
        if (!mealPlan[currentDay] || !mealPlan[currentDay][mealType]) return;

        const updatedMealPlan = {...mealPlan};
        updatedMealPlan[currentDay][mealType][category][index].eaten =
            !updatedMealPlan[currentDay][mealType][category][index].eaten;

        setMealPlan(updatedMealPlan);
        // Gerçek uygulamada burada sunucuya güncelleme gönderilir
    };

    const addMealItem = () => {
        if (!newMeal || !selectedMealType || !selectedMealCategory) return;

        const updatedMealPlan = {...mealPlan};

        // Eğer seçili gün veya öğün yoksa oluştur
        if (!updatedMealPlan[currentDay]) {
            updatedMealPlan[currentDay] = {};
        }

        if (!updatedMealPlan[currentDay][selectedMealType]) {
            updatedMealPlan[currentDay][selectedMealType] = {};
        }

        if (!updatedMealPlan[currentDay][selectedMealType][selectedMealCategory]) {
            updatedMealPlan[currentDay][selectedMealType][selectedMealCategory] = [];
        }

        // Yeni yemeği ekle
        updatedMealPlan[currentDay][selectedMealType][selectedMealCategory].push({
            name: newMeal,
            eaten: false,
            portion: newPortion || null
        });

        setMealPlan(updatedMealPlan);
        setModalVisible(false);
        setNewMeal('');
        setNewPortion('');

        // Gerçek uygulamada burada sunucuya güncelleme gönderilir
    };

    const handleDayChange = (day: string) => {
        setCurrentDay(day);
        // Eğer seçilen günde öğün varsa, ilk öğünü seç
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
                            titleStyle={styles.cardTitle}
                            left={(props) => (
                                <Avatar.Icon
                                    size={40}
                                    icon={mealIcons[mealType] || 'food'}
                                    color="#4caf50"
                                    style={{backgroundColor: '#e8f5e9'}}
                                />
                            )}
                            right={(props) => (
                                <IconButton
                                    {...props}
                                    icon="plus"
                                    iconColor="#4caf50"
                                    onPress={() => {
                                        setSelectedMealType(mealType);
                                        setSelectedMealCategory('Ana Menü');
                                        setModalVisible(true);
                                    }}
                                />
                            )}
                        />
                        <Divider/>

                        {/* Öğün kategorileri */}
                        {Object.entries(mealCategories).map(([category, meals]) => (
                            <View key={`${mealType}-${category}`}>
                                {/* Eğer birden fazla kategori varsa kategori başlığını göster */}
                                {Object.keys(mealCategories).length > 1 && (
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
                                    {meals.length === 0 ? (
                                        <Text style={styles.emptyMealText}>
                                            Bu öğün için henüz yemek eklenmemiş
                                        </Text>
                                    ) : (
                                        meals.map((meal, index) => (
                                            <View key={index} style={styles.mealItemContainer}>
                                                <View style={styles.mealItem}>
                                                    <Checkbox.Android
                                                        status={meal.eaten ? 'checked' : 'unchecked'}
                                                        onPress={() => toggleMealItemEaten(mealType, category, index)}
                                                        color="#4caf50"
                                                    />
                                                    <View style={styles.mealInfo}>
                                                        <View style={styles.mealNameRow}>
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
                                                    </View>
                                                </View>
                                            </View>
                                        ))
                                    )}
                                </Card.Content>
                            </View>
                        ))}
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

    return (
        <Provider>
            <View style={styles.container}>
                <Header navigation={navigation}/>

                {renderFlatListContent()}

                {!isEmpty && (
                    <FAB
                        style={styles.fab}
                        icon="plus"
                        onPress={openModal}
                        color="#fff"
                    />
                )}

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
    headerCard: {
        padding: 16,
        marginBottom: 16,
        borderRadius: 12,
        elevation: 2,
        backgroundColor: '#fff'
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
    progressContainer: {
        marginTop: 8
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
    progressBar: {
        height: 10,
        borderRadius: 10
    },
    mealCard: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600'
    },
    cardContent: {
        paddingVertical: 8
    },
    mealItemContainer: {
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 8
    },
    mealItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 8
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
        color: '#666'
    },
    alternativesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingLeft: 46, // Align with the text next to checkbox
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
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#f9f9f9',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0'
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333'
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
});

export default Beslenme;
