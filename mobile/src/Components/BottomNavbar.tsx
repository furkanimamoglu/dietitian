import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const BottomNav = ({ navigation }: Props) => {
  return (
    <View style={styles.bottomNavbar}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.navItem}>
        <Text style={styles.navText}>🏠</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => console.log('+ Menu')} style={styles.navCenterButton}>
        <Text style={styles.plusText}>➕</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Profil')} style={styles.navItem}>
        <Text style={styles.navText}>👤</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 70,
    backgroundColor: '#f57c00',
    paddingHorizontal: 40,
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
  },
  navText: {
    fontSize: 24,
    color: '#ffffff',
  },
  navCenterButton: {
    backgroundColor: '#ffffff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 10,
  },
  plusText: {
    fontSize: 32,
    color: '#f57c00',
  },
});

export default BottomNav;
