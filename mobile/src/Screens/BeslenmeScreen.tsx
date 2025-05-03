import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Card, Text, Checkbox, IconButton, Button, Dialog, Portal, Provider } from 'react-native-paper';
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
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [newMeal, setNewMeal] = useState('');

  const toggleCheck = (mealType, index) => {
    const newMeals = { ...meals };
    newMeals[mealType][index].checked = !newMeals[mealType][index].checked;
    setMeals(newMeals);
  };

  const openModal = (mealType) => {
    setSelectedMealType(mealType);
    setNewMeal('');
    setModalVisible(true);
  };

  const addMeal = () => {
    if (newMeal && selectedMealType) {
      const updatedMeals = { ...meals };
      updatedMeals[selectedMealType].push({ item: newMeal, checked: false });
      setMeals(updatedMeals);
      setModalVisible(false);
    }
  };

  return (
    <Provider>
      <View style={styles.container}>
        <Header navigation={navigation} />

        <ScrollView style={styles.content}>
          {Object.entries(meals).map(([mealType, items]) => (
            <Card key={mealType} style={styles.mealCard}>
              <Card.Title
                title={mealType}
                titleStyle={styles.title}
                right={(props) => (
                  <IconButton {...props} icon="plus" onPress={() => openModal(mealType)} />
                )}
              />
              <Card.Content>
                {items.map((meal, index) => (
                  <View key={index} style={styles.checkboxItem}>
                    <Checkbox
                      status={meal.checked ? 'checked' : 'unchecked'}
                      onPress={() => toggleCheck(mealType, index)}
                    />
                    <Text>{meal.item}</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          ))}
        </ScrollView>

        <BottomNavbar navigation={navigation} />

        <Portal>
          <Dialog visible={modalVisible} onDismiss={() => setModalVisible(false)}>
            <Dialog.Title>Yeni Öğün Ekle</Dialog.Title>
            <Dialog.Content>
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
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { flex: 1, padding: 16 },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#2e7d32'
  },
  mealCard: {
    marginBottom: 16,
    borderRadius: 12,
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
  }
});

export default Beslenme;
