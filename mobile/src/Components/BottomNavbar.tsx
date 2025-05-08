import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const BottomNav = ({ navigation }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showMealPopup, setShowMealPopup] = useState(false);
  const [showExercisePopup, setShowExercisePopup] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <View>
      {menuOpen && (
        <View style={styles.floatingMenuRow}>
          <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.replace('Randevu')}>
            <Icon name="calendar-check" size={24} color="#f57c00" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatingButton} onPress={() => setShowMealPopup(true)}>
            <Icon name="silverware-fork-knife" size={24} color="#f57c00" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatingButton} onPress={() => setShowExercisePopup(true)}>
            <Icon name="run" size={24} color="#f57c00" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.bottomNavbar}>
        <TouchableOpacity onPress={() => navigation.replace('Egzersiz')} style={styles.navItem}>
          <Icon name="dumbbell" size={24} color="#ffffff" />
          <Text style={styles.label}>Egzersiz</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.replace('Rapor')} style={styles.navItem}>
          <Icon name="chart-line" size={24} color="#ffffff" />
          <Text style={styles.label}>Raporlar</Text>
        </TouchableOpacity>

        {/* TODO: Bu buton harici bir yere tıklanınca da ek butonlarını kapatması gerekiyor */}
        <TouchableOpacity onPress={toggleMenu} style={styles.navCenterButton}>
          <Text style={styles.plusText}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.replace('Beslenme')} style={styles.navItem}>
          <Icon name="food" size={24} color="#ffffff" />
          <Text style={styles.label}>Beslenme</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.replace('AnaSayfa')} style={styles.navItem}>
          <Icon name="home" size={24} color="#ffffff" />
          <Text style={styles.label}>Ana Sayfa</Text>
        </TouchableOpacity>
      </View>

      {/* Öğün Ekle Popup */}
      <Modal
        transparent
        visible={showMealPopup}
        animationType="fade"
        onRequestClose={() => setShowMealPopup(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.popupBox}>
            <Text style={styles.popupText}>Öğün eklemek için bu alanı özelleştirin.</Text>
            <TouchableOpacity onPress={() => setShowMealPopup(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Egzersiz Ekle Popup */}
      <Modal
        transparent
        visible={showExercisePopup}
        animationType="fade"
        onRequestClose={() => setShowExercisePopup(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.popupBox}>
            <Text style={styles.popupText}>Egzersiz eklemek için bu alanı özelleştirin.</Text>
            <TouchableOpacity onPress={() => setShowExercisePopup(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 6,
    elevation: 12,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center'
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
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 14,
  },
  plusText: {
    fontSize: 38,
    color: '#f57c00',
    marginTop: -2,
  },
  floatingMenuRow: {
    position: 'absolute',
    bottom: 95,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 10,
    gap: 10,
    paddingLeft: 0,
    paddingRight: 15,
  },
  floatingButton: {
    backgroundColor: '#ffffff',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  popupText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#f57c00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default BottomNav;
