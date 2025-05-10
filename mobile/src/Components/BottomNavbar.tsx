import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal, TextInput, Alert, TouchableWithoutFeedback } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute } from '@react-navigation/native';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const BottomNav = ({ navigation }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showMealPopup, setShowMealPopup] = useState(false);
  const [showExercisePopup, setShowExercisePopup] = useState(false);
  const route = useRoute();
  const [selectedMealType, setSelectedMealType] = useState('Kahvaltı');
  const [newMeal, setNewMeal] = useState('');
  const [newPortion, setNewPortion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedExerciseType, setSelectedExerciseType] = useState('Koşu');
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [isExerciseSubmitting, setIsExerciseSubmitting] = useState(false);

  const mealTypes = ['Kahvaltı', 'Öğle', 'Akşam', 'Aperatifler'];
  const exerciseTypes = [
    'Koşu',
    'Yürüyüş',
    'Bisiklet',
    'Yüzme',
    'Yoga',
    'Pilates',
    'Futbol',
    'Basketbol',
    'Voleybol',
    'Tenis',
  ];

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const isActive = (routeName: string) => {
    return route.name === routeName;
  };

  const handleAddMeal = async () => {
    if (!newMeal || !newPortion || !selectedMealType) return;
    setIsSubmitting(true);
    try {
      await fetch('https://your-api-endpoint.com/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealType: selectedMealType,
          item: newMeal,
          portion: newPortion,
        }),
      });
      setShowMealPopup(false);
      setNewMeal('');
      setNewPortion('');
      setSelectedMealType('Kahvaltı');
    } catch (e) {
      console.log('Hata:', 'Hızlı Öğün Ekle butonunda bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddExercise = async () => {
    if (!selectedExerciseType || !exerciseDuration) return;
    setIsExerciseSubmitting(true);
    try {
      await fetch('https://your-api-endpoint.com/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseType: selectedExerciseType,
          duration: exerciseDuration,
        }),
      });
      setShowExercisePopup(false);
      setSelectedExerciseType('Koşu');
      setExerciseDuration('');
    } catch (e) {
      console.log('Hata:', 'Hızlı Egzersiz Ekle butonunda bir hata oluştu.');
    } finally {
      setIsExerciseSubmitting(false);
    }
  };

  return (
    <View>
      {menuOpen && (
        <View style={styles.floatingMenuRow}>
          <TouchableOpacity 
            style={styles.floatingButton} 
            onPress={() => {
              navigation.replace('Randevu');
              setMenuOpen(false);
            }}
            activeOpacity={0.8}
          >
            <Icon name="calendar-check" size={24} color="#f57c00" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.floatingButton} 
            onPress={() => {
              setShowMealPopup(true);
              setMenuOpen(false);
            }}
            activeOpacity={0.8}
          >
            <Icon name="silverware-fork-knife" size={24} color="#f57c00" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.floatingButton} 
            onPress={() => {
              setShowExercisePopup(true);
              setMenuOpen(false);
            }}
            activeOpacity={0.8}
          >
            <Icon name="run" size={24} color="#f57c00" />
          </TouchableOpacity>
        </View>
      )}

      {/* Overlay to close menu when clicked outside */}
      {menuOpen && (
        <TouchableWithoutFeedback onPress={() => setMenuOpen(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <View style={styles.bottomNavbar}>
        <TouchableOpacity onPress={() => navigation.replace('Egzersiz')} style={[styles.navItem, isActive('Egzersiz') && styles.activeNavItem]}>
          <Icon name="dumbbell" size={24} color={isActive('Egzersiz') ? '#ffffff' : '#ffffff80'} />
          <Text style={[styles.label, isActive('Egzersiz') && styles.activeLabel]}>Egzersiz</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.replace('Randevu')} style={[styles.navItem, isActive('Randevu') && styles.activeNavItem]}>
          <Icon name="calendar" size={24} color={isActive('Randevu') ? '#ffffff' : '#ffffff80'} />
          <Text style={[styles.label, isActive('Randevu') && styles.activeLabel]}>Randevular</Text>
        </TouchableOpacity>

        {/* TODO: Bu buton harici bir yere tıklanınca da ek butonlarını kapatması gerekiyor */}
        <TouchableOpacity onPress={toggleMenu} style={styles.navCenterButton}>
          <Text style={styles.plusText}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.replace('Beslenme')} style={[styles.navItem, isActive('Beslenme') && styles.activeNavItem]}>
          <Icon name="food" size={24} color={isActive('Beslenme') ? '#ffffff' : '#ffffff80'} />
          <Text style={[styles.label, isActive('Beslenme') && styles.activeLabel]}>Beslenme</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.replace('AnaSayfa')} style={[styles.navItem, isActive('AnaSayfa') && styles.activeNavItem]}>
          <Icon name="home" size={24} color={isActive('AnaSayfa') ? '#ffffff' : '#ffffff80'} />
          <Text style={[styles.label, isActive('AnaSayfa') && styles.activeLabel]}>Ana Sayfa</Text>
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
            <Text style={styles.popupText}>Yeni Öğün Ekle</Text>
            <Text style={styles.dialogLabel}>Öğün Türü</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              {mealTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 4 }}
                  onPress={() => setSelectedMealType(type)}
                >
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: '#f57c00',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 4,
                    backgroundColor: selectedMealType === type ? '#f57c00' : '#fff',
                  }}>
                    {selectedMealType === type && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' }} />}
                  </View>
                  <Text>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.dialogLabel}>Yemek Adı</Text>
            <View style={{ width: '100%', marginBottom: 8 }}>
              <TextInput
                style={styles.input}
                placeholder="Örn: Mercimek çorbası"
                value={newMeal}
                onChangeText={setNewMeal}
              />
            </View>
            <Text style={styles.dialogLabel}>Porsiyon/Adet/Gram</Text>
            <View style={{ width: '100%', marginBottom: 16 }}>
              <TextInput
                style={styles.input}
                placeholder="Örn: 1 porsiyon, 2 adet, 150g"
                value={newPortion}
                onChangeText={setNewPortion}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '100%' }}>
              <TouchableOpacity onPress={() => setShowMealPopup(false)} style={[styles.closeButton, { marginRight: 8 }]}> 
                <Text style={styles.closeButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddMeal}
                style={[styles.closeButton, { backgroundColor: isSubmitting ? '#ccc' : '#f57c00' }]}
                disabled={isSubmitting}
              >
                <Text style={styles.closeButtonText}>{isSubmitting ? 'Ekleniyor...' : 'Ekle'}</Text>
              </TouchableOpacity>
            </View>
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
            <Text style={styles.popupText}>Yeni Egzersiz Ekle</Text>
            <Text style={styles.dialogLabel}>Egzersiz Türü</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              {exerciseTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 4 }}
                  onPress={() => setSelectedExerciseType(type)}
                >
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: '#f57c00',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 4,
                    backgroundColor: selectedExerciseType === type ? '#f57c00' : '#fff',
                  }}>
                    {selectedExerciseType === type && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' }} />}
                  </View>
                  <Text>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.dialogLabel}>Süre (dakika)</Text>
            <View style={{ width: '100%', marginBottom: 16 }}>
              <TextInput
                style={styles.input}
                placeholder="Örn: 30"
                value={exerciseDuration}
                onChangeText={setExerciseDuration}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '100%' }}>
              <TouchableOpacity onPress={() => setShowExercisePopup(false)} style={[styles.closeButton, { marginRight: 8 }]}> 
                <Text style={styles.closeButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddExercise}
                style={[styles.closeButton, { backgroundColor: isExerciseSubmitting ? '#ccc' : '#f57c00' }]}
                disabled={isExerciseSubmitting}
              >
                <Text style={styles.closeButtonText}>{isExerciseSubmitting ? 'Ekleniyor...' : 'Ekle'}</Text>
              </TouchableOpacity>
            </View>
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
    zIndex: 11,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 9,
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
  activeNavItem: {
    opacity: 1,
  },
  activeLabel: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  dialogLabel: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 4,
    color: '#666',
    fontWeight: '500',
    alignSelf: 'flex-start',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
    width: '100%',
    marginBottom: 0,
  },
});

export default BottomNav;
