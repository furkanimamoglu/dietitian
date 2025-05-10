import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import {
  Card,
  Text,
  Checkbox,
  IconButton,
  Button,
  Dialog,
  Portal,
  Provider,
  FAB,
  ProgressBar,
  RadioButton,
  Surface,
  Chip,
  Divider,
  Avatar
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
}

interface DailyMealPlan {
  Kahvaltı: string;
  'Öğle Yemeği': string;
  'Akşam Yemeği': string;
  Aparatif: string;
}

interface DailyStats {
  protein: number;
  calories: number;
}

const mealIcons: { [key: string]: string } = {
  'Kahvaltı': 'coffee',
  'Öğle': 'food-variant',
  'Akşam': 'food-fork-drink',
  'Aperatifler': 'food-apple'
};

const Beslenme = ({ navigation }: { navigation: any }) => {
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
  const [dailyStats, setDailyStats] = useState<DailyStats>({ protein: 0, calories: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);

  useEffect(() => {
    calculateDailyStats();
    fetchTodayMeal();
  }, []);

  const fetchTodayMeal = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching meal plan from:', `${config.apiUrl}/client/getTodayMeal`);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('Token Bulunamadı');
        return;
      }
      const response = await fetch(`${config.apiUrl}/client/getTodayMeal`, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Received meal plan:', data);
      
      // Check if response contains showOnScreen and message
      if (data.showOnScreen && data.message) {
        setError(data.message);
        setIsEmpty(true);
        setLoading(false);
        return;
      }
      
      updateMealsFromPlan(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      setError('Beslenme planı yüklenemedi. Lütfen tekrar deneyin.');
      setIsEmpty(true);
      setLoading(false);
    }
  };

  const updateMealsFromPlan = (dayPlan: DailyMealPlan) => {
    const newMeals: { [key: string]: MealItem[] } = {
      Kahvaltı: [],
      Öğle: [],
      Akşam: [],
      Aperatifler: []
    };
    
    // Convert API response to our meal structure
    if (dayPlan.Kahvaltı) {
      newMeals.Kahvaltı = dayPlan.Kahvaltı.split(', ').map(item => ({
        item,
        checked: false,
        portion: '1 porsiyon'
      }));
    }
    
    if (dayPlan['Öğle Yemeği']) {
      newMeals.Öğle = dayPlan['Öğle Yemeği'].split(', ').map(item => ({
        item,
        checked: false,
        portion: '1 porsiyon'
      }));
    }
    
    if (dayPlan['Akşam Yemeği']) {
      newMeals.Akşam = dayPlan['Akşam Yemeği'].split(', ').map(item => ({
        item,
        checked: false,
        portion: '1 porsiyon'
      }));
    }
    
    if (dayPlan.Aparatif) {
      newMeals.Aperatifler = dayPlan.Aparatif.split(', ').map(item => ({
        item,
        checked: false,
        portion: '1 porsiyon'
      }));
    }
    
    // Check if meal plan is empty
    const totalMealItems = Object.values(newMeals).reduce(
      (total, items) => total + items.length, 0
    );
    
    setIsEmpty(totalMealItems === 0);
    setMeals(newMeals);
  };

  const calculateDailyStats = () => {
    let totalProtein = 0;
    let totalCalories = 0;

    Object.values(meals).forEach(mealItems => {
      mealItems.forEach(meal => {
        if (meal.checked) {
          totalProtein += meal.protein || 0;
          totalCalories += meal.calorie || 0;
        }
      });
    });

    setDailyStats({ protein: totalProtein, calories: totalCalories });
  };

  const toggleCheck = (mealType: string, index: number) => {
    const newMeals = { ...meals };
    newMeals[mealType][index].checked = !newMeals[mealType][index].checked;
    setMeals(newMeals);
  };

  const openModal = () => {
    setSelectedMealType('Kahvaltı');
    setNewMeal('');
    setNewPortion('');
    setModalVisible(true);
  };

  const addMeal = () => {
    if (newMeal && selectedMealType) {
      const updatedMeals = { ...meals };
      updatedMeals[selectedMealType].push({
        item: newMeal,
        checked: false,
        portion: newPortion || '1 porsiyon'
      });
      setMeals(updatedMeals);
      setNewMeal('');
      setNewPortion('');
      setModalVisible(false);
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

  const renderWaterTracker = () => {
    return (
      <Surface style={styles.waterCard}>
        <View style={styles.waterHeader}>
          <Avatar.Icon
            size={40}
            icon="water"
            color="#2196F3"
            style={{backgroundColor: '#e3f2fd'}}
          />
          <Text style={styles.waterTitle}>Su Takibi</Text>
        </View>
        <Text style={styles.waterSubtitle}>Günlük 8 bardak hedef</Text>

        <View style={styles.waterProgressContainer}>
          <TouchableOpacity onPress={reduceWater} style={styles.waterButton}>
            <Text style={{color: '#fff', fontWeight: 'bold'}}>-</Text>
          </TouchableOpacity>

          <View style={styles.waterBadges}>
            {[...Array(maxWaterIntake)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.waterBadge,
                  i < waterIntake ? styles.waterBadgeFilled : styles.waterBadgeEmpty
                ]}
              >
                <Text style={{color: i < waterIntake ? "#fff" : "#bde0fe"}}>💧</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={addWater} style={styles.waterButton}>
            <Text style={{color: '#fff', fontWeight: 'bold'}}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.waterCount}>
          {waterIntake} / {maxWaterIntake} bardak
        </Text>
      </Surface>
    );
  };

  const renderDailyStats = () => {
    return (
      <Surface style={styles.statsCard}>
        <Text style={styles.statsTitle}>Bugünkü Besin Değerleri</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Avatar.Icon
              size={40}
              icon="fire"
              color="#ff7043"
              style={{backgroundColor: '#ffebee'}}
            />
            <Text style={styles.statValue}>{dailyStats.calories}</Text>
            <Text style={styles.statLabel}>kalori</Text>
          </View>

          <View style={styles.statItem}>
            <Avatar.Icon
              size={40}
              icon="arm-flex"
              color="#7cb342"
              style={{backgroundColor: '#f1f8e9'}}
            />
            <Text style={styles.statValue}>{dailyStats.protein}g</Text>
            <Text style={styles.statLabel}>protein</Text>
          </View>

          <View style={styles.statItem}>
            <Avatar.Icon
              size={40}
              icon="water"
              color="#29b6f6"
              style={{backgroundColor: '#e1f5fe'}}
            />
            <Text style={styles.statValue}>{waterIntake * 250}ml</Text>
            <Text style={styles.statLabel}>su</Text>
          </View>
        </View>
      </Surface>
    );
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
          <ActivityIndicator size="large" color="#4caf50" />
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
            <ProgressBar progress={progress} color="#4caf50" style={styles.progressBar} />
          </View>
        </Surface>

        {/*renderWaterTracker()*/}
        {renderDailyStats()}

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
            <Divider />
            <Card.Content style={styles.cardContent}>
              {items.map((meal, index) => (
                <View key={index} style={styles.mealItem}>
                  <Checkbox.Android
                    status={meal.checked ? 'checked' : 'unchecked'}
                    onPress={() => toggleCheck(mealType, index)}
                    color="#4caf50"
                  />
                  <View style={styles.mealInfo}>
                    <Text style={[
                      styles.mealName,
                      meal.checked && styles.mealChecked
                    ]}>
                      {meal.item}
                    </Text>
                    <View style={styles.nutritionInfo}>
                      <Chip
                        style={styles.nutritionChip}
                        textStyle={styles.chipText}
                        avatar={
                          <Avatar.Icon
                            size={16}
                            icon="scale"
                            color="#7cb342"
                            style={{backgroundColor: 'transparent'}}
                          />
                        }
                      >
                        {meal.portion}
                      </Chip>
                    </View>
                  </View>
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
        <View style={{ height: 80 }} />
      </>
    );
  };

  return (
    <Provider>
      <View style={styles.container}>
        <Header navigation={navigation} />

        <ScrollView style={styles.content} contentContainerStyle={loading || error || isEmpty ? styles.centeredContent : undefined}>
          {renderContent()}
        </ScrollView>

        {!isEmpty && (
          <FAB
            style={styles.fab}
            icon="plus"
            onPress={openModal}
            color="#fff"
          />
        )}

        <BottomNavbar navigation={navigation} />

        <Portal>
          <Dialog visible={modalVisible} onDismiss={() => setModalVisible(false)} style={styles.dialog}>
            <Dialog.Title>Yeni Öğün Ekle</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogLabel}>Öğün Türü</Text>
              <RadioButton.Group onValueChange={value => setSelectedMealType(value)} value={selectedMealType}>
                <View style={styles.radioButtonsContainer}>
                  {Object.keys(meals).map(type => (
                    <View key={type} style={styles.radioOption}>
                      <RadioButton.Android value={type} color="#4caf50" />
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
    flex: 1,
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
    color: '#ff9800',
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
    color: '#ff9800',
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
    backgroundColor: '#ff9800',
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
  mealItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  mealInfo: {
    flex: 1,
    marginLeft: 8
  },
  mealName: {
    fontSize: 16,
    marginBottom: 4
  },
  mealChecked: {
    textDecorationLine: 'line-through',
    color: '#999'
  },
  nutritionInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 8
  },
  nutritionChip: {
    marginRight: 0,
    marginBottom: 4,
    height: 32,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 0,
    justifyContent: 'center'
  },
  chipText: {
    fontSize: 13,
    lineHeight: 20,
    marginLeft: 4,
    marginRight: 4,
    color: '#424242'
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 70,
    backgroundColor: '#4caf50'
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
  waterCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2
  },
  waterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  waterTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#2196F3'
  },
  waterSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12
  },
  waterProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8
  },
  waterButton: {
    backgroundColor: '#2196F3',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  waterBadges: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginHorizontal: 8
  },
  waterBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  waterBadgeFilled: {
    backgroundColor: '#2196F3'
  },
  waterBadgeEmpty: {
    backgroundColor: '#e1f5fe',
    borderWidth: 1,
    borderColor: '#b3e5fc'
  },
  waterCount: {
    textAlign: 'center',
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8
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