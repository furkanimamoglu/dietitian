import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Alert, FlatList, StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
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
    item: string;
    checked: boolean;
    portion: string;
    protein?: number;
    calorie?: number;
    alternatives?: string[];
}

interface DailyMealPlan {
    Kahvaltı: string[] | string | { main: string[], alternatives: { [key: string]: string[] } } | {
        isim: string,
        yenildi: boolean
    }[];
    'Öğle Yemeği': string[] | string | { main: string[], alternatives: { [key: string]: string[] } } | {
        isim: string,
        yenildi: boolean
    }[];
    'Akşam Yemeği': string[] | string | { main: string[], alternatives: { [key: string]: string[] } } | {
        isim: string,
        yenildi: boolean
    }[];
    Aparatif: string[] | string | { main: string[], alternatives: { [key: string]: string[] } } | {
        isim: string,
        yenildi: boolean
    }[];
}

const mealIcons: { [key: string]: string } = {
    'Kahvaltı': 'coffee',
    'Öğle': 'food-variant',
    'Akşam': 'food-fork-drink',
    'Aperatifler': 'food-apple'
};

const Beslenme = ({navigation}: { navigation: any }) => {
    const [meals, setMeals] = useState<{ [key: string]: MealItem[] }>({
        Kahvaltı: [],
        Öğle: [],
        Akşam: [],
        Aperatifler: [],
    });

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState('Kahvaltı');
    const [newMeal, setNewMeal] = useState('');
    const [newPortion, setNewPortion] = useState('');
    const [waterIntake, setWaterIntake] = useState(2);
    const [maxWaterIntake, setMaxWaterIntake] = useState(8);
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
            const response = await fetch(`${config[config.environment].apiUrl}/client/getTodayMeal`, {
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

            let mealPlanData = null;

            if (data.mealPlan) {
                console.log('Found mealPlan directly in response');
                mealPlanData = data.mealPlan;
            }
            else if (data.NutritionPlan && data.NutritionPlan.mealPlan) {
                console.log('Found mealPlan inside NutritionPlan object');
                mealPlanData = data.NutritionPlan.mealPlan;
            }
            else if (data.Kahvaltı || data['Öğle Yemeği'] || data['Akşam Yemeği'] || data.Aparatif) {
                console.log('The response itself appears to be the meal plan for a day');
                updateMealsFromPlan(data);
                setLoading(false);
                return;
            }

            if (mealPlanData) {
                console.log('Available days in meal plan:', Object.keys(mealPlanData));

                if (mealPlanData[todayTurkish]) {
                    console.log('Found meal plan for today:', JSON.stringify(mealPlanData[todayTurkish], null, 2));
                    updateMealsFromPlan(mealPlanData[todayTurkish]);
                } else {
                    const anyDay = Object.keys(mealPlanData)[0];
                    if (anyDay) {
                        console.log('No meal plan for today, using first available day instead:', anyDay);
                        updateMealsFromPlan(mealPlanData[anyDay]);
                    } else {
                        console.log('No meal plan found for any day');
                        setError('Beslenme planı bulunamadı.');
                        setIsEmpty(true);
                    }
                }
            } else {
                console.log('No meal plan structure found in response');
                setError('Beslenme planı verisi bulunamadı.');
                setIsEmpty(true);
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

    const updateMealsFromPlan = (dayPlan: DailyMealPlan) => {
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
            }
            else if (mealData.main && Array.isArray(mealData.main)) {
                mainItems = [...mealData.main];
                alternatives = mealData.alternatives || {};
            }
            else if (Array.isArray(mealData)) {
                mainItems = [...mealData];
            }
            else if (typeof mealData === 'string') {
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

            const updatedDayPlan: DailyMealPlan = {
                Kahvaltı: [],
                'Öğle Yemeği': [],
                'Akşam Yemeği': [],
                Aparatif: []
            };

            Object.entries(updatedMeals).forEach(([mealType, items]) => {
                const apiMealType = convertAppMealNameToApiMealName(mealType);
                if (apiMealType) {
                    updatedDayPlan[apiMealType as keyof DailyMealPlan] = items.map(item => ({
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

    const totalItems = Object.values(meals).flat().length;
    const checkedItems = Object.values(meals).flat().filter(m => m.checked).length;
    const progress = totalItems > 0 ? checkedItems / totalItems : 0;

    const addWater = () => {
        if (waterIntake < maxWaterIntake) {
            setWaterIntake(waterIntake + 1);
        }
    };

    const reduceWater = () => {
        if (waterIntake > 0) {
            setWaterIntake(waterIntake - 1);
        }
    };

    const getCompletionText = () => {
        const percentage = Math.round(progress * 100);
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
                <View style={styles.noticeContainer}>
                    <Avatar.Icon
                        size={60}
                        icon="information"
                        color="#ff9800"
                        style={{backgroundColor: '#fff3e0'}}
                    />
                    <Text style={styles.noticeText}>{error}</Text>
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

        if (isEmpty) {
            return renderEmptyMealPlan();
        }

        return (
            <>
                <Surface style={styles.headerCard}>
                    <Text style={styles.sectionTitle}>Günlük Beslenme Planın</Text>
                    <Text style={styles.sectionSubtitle}>Dengeli beslen, enerjik hisset</Text>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressTextRow}>
                            <Text style={styles.progressPercentage}>%{Math.round(progress * 100)}</Text>
                            <Text style={styles.progressDescription}>{getCompletionText()}</Text>
                        </View>
                        <ProgressBar progress={progress} color="#4caf50" style={styles.progressBar}/>
                    </View>
                </Surface>

                {/* Yemek kategorileri */}
                {Object.entries(meals).map(([mealType, items]) => (
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
                                        setModalVisible(true);
                                    }}
                                />
                            )}
                        />
                        <Divider/>
                        <Card.Content style={styles.cardContent}>
                            {items.map((meal, index) => (
                                <View key={index} style={styles.mealItemContainer}>
                                    <View style={styles.mealItem}>
                                        <Checkbox.Android
                                            status={meal.checked ? 'checked' : 'unchecked'}
                                            onPress={() => toggleCheck(mealType, index)}
                                            color="#4caf50"
                                        />
                                        <View style={styles.mealInfo}>
                                            <View style={styles.mealNameRow}>
                                                <Text style={[
                                                    styles.mealName,
                                                    meal.checked && styles.mealChecked
                                                ]}>
                                                    {meal.item}
                                                </Text>
                                                <Text style={styles.portionText}>
                                                    {meal.portion}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Show alternatives as chips */}
                                    {meal.alternatives && meal.alternatives.length > 0 && (
                                        <View style={styles.alternativesContainer}>
                                            {meal.alternatives.map((alt, altIndex) => (
                                                <Chip
                                                    key={altIndex}
                                                    icon="swap-horizontal"
                                                    mode="outlined"
                                                    style={styles.alternativeChip}
                                                    textStyle={styles.alternativeChipText}
                                                >
                                                    {alt}
                                                </Chip>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            ))}

                            {items.length === 0 && (
                                <Text style={styles.emptyMealText}>
                                    Bu öğün için henüz yemek eklenmemiş
                                </Text>
                            )}
                        </Card.Content>
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
                        <Dialog.Title>Yeni Öğün Ekle</Dialog.Title>
                        <Dialog.Content>
                            <Text style={styles.dialogLabel}>Öğün Türü</Text>
                            <RadioButton.Group onValueChange={value => setSelectedMealType(value)}
                                               value={selectedMealType}>
                                <View style={styles.radioButtonsContainer}>
                                    {Object.keys(meals).map(type => (
                                        <View key={type} style={styles.radioOption}>
                                            <RadioButton.Android value={type} color="#4caf50"/>
                                            <Text>{type}</Text>
                                        </View>
                                    ))}
                                </View>
                            </RadioButton.Group>

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
                            <Button onPress={addMeal} mode="contained" buttonColor="#4caf50">Ekle</Button>
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
    }
});

export default Beslenme;