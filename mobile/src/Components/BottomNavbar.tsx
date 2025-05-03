import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const BottomNav = ({ navigation }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <View>
      {menuOpen && (
        <View style={styles.floatingMenu}>
          <TouchableOpacity style={styles.floatingButton} onPress={() => console.log('Sol')}>
            <Text style={styles.floatingText}>📋</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatingButton} onPress={() => console.log('Orta')}>
            <Text style={styles.floatingText}>📝</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatingButton} onPress={() => console.log('Sağ')}>
            <Text style={styles.floatingText}>📷</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.bottomNavbar}>
        <TouchableOpacity onPress={() => navigation.navigate('DailyExercise')} style={styles.navItem}>
          <Text style={styles.navText}>🏋️‍♂️</Text>
          <Text style={styles.label}>Egzersiz</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Tarifler')} style={styles.navItem}>
          <Text style={styles.navText}>🍲</Text>
          <Text style={styles.label}>Tarifler</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleMenu} style={styles.navCenterButton}>
          <Text style={styles.plusText}>➕</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Beslenme')} style={styles.navItem}>
          <Text style={styles.navText}>🍽️</Text>
          <Text style={styles.label}>Beslenme</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Raporlar')} style={styles.navItem}>
          <Text style={styles.navText}>📈</Text>
          <Text style={styles.label}>Raporlar</Text>
        </TouchableOpacity>
      </View>
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
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  navText: {
    fontSize: 22,
    color: '#ffffff'
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
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 10,
  },
  plusText: {
    fontSize: 38,
    color: '#f57c00',
  },
  floatingMenu: {
    position: 'absolute',
    bottom: 90,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 10,
  },
  floatingButton: {
    backgroundColor: '#ffffff',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 6,
  },
  floatingText: {
    fontSize: 24,
    color: '#f57c00'
  }
});

export default BottomNav;
