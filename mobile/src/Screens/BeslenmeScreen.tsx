import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Header from '../Components/Header';
import BottomNavbar from '../Components/BottomNavbar';

const Beslenme = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Header navigation={navigation} />

      <ScrollView style={styles.content}>
        <Card style={styles.mealCard}>
          <Card.Title title="Kahvaltı" titleStyle={styles.title} />
          <Card.Content>
            <Text>- 2 haşlanmış yumurta</Text>
            <Text>- 1 dilim tam buğday ekmeği</Text>
            <Text>- Salatalık, domates</Text>
          </Card.Content>
        </Card>

        <Card style={styles.mealCard}>
          <Card.Title title="Öğle" titleStyle={styles.title} />
          <Card.Content>
            <Text>- Tavuk göğsü</Text>
            <Text>- Bulgur pilavı</Text>
            <Text>- Yoğurt</Text>
          </Card.Content>
        </Card>

        <Card style={styles.mealCard}>
          <Card.Title title="Akşam" titleStyle={styles.title} />
          <Card.Content>
            <Text>- Zeytinyağlı sebze yemeği</Text>
            <Text>- 1 dilim ekmek</Text>
            <Text>- Salata</Text>
          </Card.Content>
        </Card>

        <Card style={styles.mealCard}>
          <Card.Title title="Aperatifler" titleStyle={styles.title} />
          <Card.Content>
            <Text>- 1 avuç badem</Text>
            <Text>- 1 orta boy elma</Text>
            <Text>- Bitki çayı</Text>
          </Card.Content>
        </Card>
      </ScrollView>

      <BottomNavbar navigation={navigation} />
    </View>
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
  }
});

export default Beslenme;