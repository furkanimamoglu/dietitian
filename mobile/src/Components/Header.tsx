// components/Header.tsx
import React from 'react';
import { Appbar } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default function Header({ navigation }: Props) {
  return (
    <Appbar.Header style={styles.appbar}>
      <View style={styles.rightIcons}>
        <Text style={styles.icon} onPress={() => console.log('Bildirim')}>🔔</Text>
        <Text style={styles.icon} onPress={() => console.log('Ayarlar')}>⚙️</Text>
        <Text style={styles.icon} onPress={() => navigation.navigate('Mesaj')}>✉️</Text>
      </View>
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  appbar: {
    backgroundColor: '#f57c00',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  icon: {
    fontSize: 22,
    color: '#ffffff',
    marginLeft: 12,
  }
});
