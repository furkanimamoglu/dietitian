import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform
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
  RadioButton
} from 'react-native-paper';
import Header from '../Components/Header';
import BottomNavbar from '../Components/BottomNavbar';

const Beslenme = ({ navigation }) => {
  const [meals, setMeals] = useState({
    Kahvaltı: [
      { item: '2 haşlanmış yumurta', checked: false },
      { item: '1 dilim tam buğday ekmeği', checked: false },
      { item: 'Salatalık, domates', checked: false },
    ],
    Öğle: [
      { item: 'Tavuk göğsü', checked: false },
      { item: 'Bulgur pilavı', checked: false },
      { item: 'Yoğurt', checked: false },
    ],
    Akşam: [
      { item: 'Zeytinyağlı sebze yemeği', checked: false },
      { item: '1 dilim ekmek', checked: false },
      { item: 'Salata', checked: false },
    ],
    Aperatifler: [
      { item: '1 avuç badem', checked: false },
      { item: '1 orta boy elma', checked: false },
      { item: 'Bitki çayı', checked: false },
    ],
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('Kahvaltı');
  const [newMeal, setNewMeal] = useState('');

  const toggleCheck = (mealType, index) => {
    const newMeals = { ...meals };
    newMeals[mealType][index].checked = !newMeals[mealType][index].checked;
    setMeals(newMeals);
  };

  const openModal = () => {
    setSelectedMealType('FAB');
    setNewMeal('');
    setModalVisible(true);
  };

  const addMeal = () => {
    if (newMeal && selectedMealType) {
      const updatedMeals = { ...meals };
      updatedMeals[selectedMealType].push({ item: newMeal, checked: false });
      setMeals(updatedMeals);
      setNewMeal('');
      setModalVisible(false);
    }
  };

  const totalItems = Object.values(meals).flat().length;
  const checkedItems = Object.values(meals).flat().filter(m => m.checked).length;
  const progress = totalItems > 0 ? checkedItems / totalItems : 0;

  return (
    <Provider>
      <View style={styles.container}>
        <Header navigation={navigation} />

        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>Bugünkü Beslenme Planın 🥗</Text>
          <Text style={styles.sectionSubtitle}>Dengeli beslen, iyi hisset.</Text>

          <View style={styles.progressBox}>
            <Text style={styles.progressText}>Tamamlanma: %{Math.round(progress * 100)}</Text>
            <ProgressBar progress={progress} color="#4caf50" style={styles.progressBar} />
          </View>

          {Object.entries(meals).map(([mealType, items]) => (
            <Card key={mealType} style={styles.mealCard}>
              <Card.Title
                title={`🍽️ ${mealType}`}
                titleStyle={styles.title}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="plus"
                    onPress={() => {
                      setSelectedMealType(mealType);
                      setModalVisible(true);
                    }}
                  />
                )}

              />
              <Card.Content>
                {items.map((meal, index) => (
                  <View key={index} style={styles.checkboxItem}>
                    <Checkbox.Android
                      status={meal.checked ? 'checked' : 'unchecked'}
                      onPress={() => toggleCheck(mealType, index)}
                      color="#4caf50"
                    />
                    <Text style={{ textDecorationLine: meal.checked ? 'line-through' : 'none' }}>{meal.item}</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          ))}
        </ScrollView>

        <FAB
          style={styles.fab}
          icon="plus"
          onPress={openModal}
          color="#fff"
        />

        <BottomNavbar navigation={navigation} />

        <Portal>
          <Dialog visible={modalVisible} onDismiss={() => setModalVisible(false)}>
            <Dialog.Title>Yeni Öğün Ekle</Dialog.Title>
            <Dialog.Content>

              {selectedMealType === 'FAB' && (
                <RadioButton.Group onValueChange={value => setSelectedMealType(value)} value={selectedMealType}>
                  {Object.keys(meals).map(type => (
                    <View key={type} style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <RadioButton value={type} />
                      <Text>{type}</Text>
                    </View>
                  ))}
                </RadioButton.Group>
              )}
              <TextInput
                style={styles.input}
                placeholder="Yemek Adı"
                value={newMeal}
                onChangeText={setNewMeal}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={addMeal}>Ekle</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f5f7' },
  content: { flex: 1, padding: 16 },
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
  progressBox: {
    paddingHorizontal: 16,
    marginBottom: 20
  },
  progressBar: {
    height: 8,
    borderRadius: 10,
    marginTop: 6
  },
  progressText: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '600'
  },
  mealCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3,
    backgroundColor: '#ffffff'
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 8
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 70,
    backgroundColor: '#4caf50'
  }
});

export default Beslenme;
