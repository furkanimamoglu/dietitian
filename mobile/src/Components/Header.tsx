import {React, useEffect} from 'react';
import { BackHandler, TouchableOpacity, Image } from 'react-native';
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
      <TouchableOpacity onPress={() => navigation.navigate('Profil')} style={styles.avatarWrapper}>
        <View style={styles.avatarContent}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100' }}
            style={styles.avatar}
          />
          <Text style={styles.avatarLabel}>Furkan İmamoğlu</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.rightIcons}>
        <TouchableOpacity onPress={() => console.log('Bildirim')}>
          <Text style={styles.icon}>🔔</Text>
        </TouchableOpacity>
      </View>
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  appbar: {
    backgroundColor: '#f57c00',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  avatarWrapper: {
    marginLeft: 8,
  },
  avatarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff22',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 28,
    gap: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
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
