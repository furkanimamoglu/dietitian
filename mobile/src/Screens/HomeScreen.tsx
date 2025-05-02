import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, Button, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      {/* AppBar */}
      <Appbar.Header>
        <Appbar.Content title="Ana Sayfa" />
        <Appbar.Action icon="account" onPress={() => console.log('Profil')} />
      </Appbar.Header>

      {/* İçerik */}
      <View style={styles.content}>
        <Text variant="headlineMedium">Ana Sayfa</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginTop: 20,
  },
});

export default HomeScreen;
