import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Text, TextInput, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../Components/Header';
import BottomNavbar from '../Components/BottomNavbar';

const Egzersiz = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEgzersiz, setSelectedEgzersiz] = useState(null);
  const [sure, setSure] = useState('');

  // Predefined exercise options
  const egzersizSecenekleri = useMemo(() => [
    { id: '1', isim: 'Koşu', icon: 'run' },
    { id: '2', isim: 'Yürüyüş', icon: 'walk' },
    { id: '3', isim: 'Bisiklet', icon: 'bike' },
    { id: '4', isim: 'Yüzme', icon: 'swim' },
    { id: '5', isim: 'Yoga', icon: 'yoga' },
    { id: '6', isim: 'Pilates', icon: 'human-handsdown' },
    { id: '7', isim: 'Futbol', icon: 'soccer' },
    { id: '8', isim: 'Basketbol', icon: 'basketball' },
    { id: '9', isim: 'Voleybol', icon: 'volleyball' },
    { id: '10', isim: 'Tenis', icon: 'tennis' }
  ], []);

  // Example exercise data
  const [egzersizler, setEgzersizler] = useState([
    {
      id: '1',
      isim: 'Koşu',
      sure: '30 dakika',
      tarih: '03.05.2025',
      icon: 'run'
    },
    {
      id: '2',
      isim: 'Yoga',
      sure: '45 dakika',
      tarih: '02.05.2025',
      icon: 'yoga'
    },
    {
      id: '3',
      isim: 'Bisiklet',
      sure: '25 dakika',
      tarih: '30.04.2025',
      icon: 'bike'
    }
  ]);

  const iconMap = useMemo(() => ({
    'run': 'run',
    'walk': 'walk',
    'bike': 'bike',
    'swim': 'swim',
    'yoga': 'yoga',
    'human-handsdown': 'human-handsdown',
    'soccer': 'soccer',
    'basketball': 'basketball',
    'volleyball': 'volleyball',
    'tennis': 'tennis'
  }), []);

  const ekleEgzersiz = useCallback(() => {
    if (!selectedEgzersiz || !sure) return;

    const secilenEgzersizBilgisi = egzersizSecenekleri.find(e => e.id === selectedEgzersiz);

    const yeniEgzersiz = {
      id: Date.now().toString(),
      isim: secilenEgzersizBilgisi.isim,
      sure: sure + ' dakika',
      tarih: new Date().toLocaleDateString('tr-TR'),
      icon: secilenEgzersizBilgisi.icon
    };

    setEgzersizler([yeniEgzersiz, ...egzersizler]);
    setModalVisible(false);

    // Form alanlarını temizle
    setSelectedEgzersiz(null);
    setSure('');
  }, [selectedEgzersiz, sure, egzersizler, egzersizSecenekleri]);

  const silEgzersiz = useCallback((id) => {
    setEgzersizler(prevEgzersizler => prevEgzersizler.filter(egzersiz => egzersiz.id !== id));
  }, []);

  // Haftalık toplam süre hesaplama (dakika)
  const toplamSure = useMemo(() => {
    return egzersizler.reduce((sum, egzersiz) => {
      const sureStr = egzersiz.sure;
      const sureValue = parseInt(sureStr.split(' ')[0] || 0);
      return sum + sureValue;
    }, 0);
  }, [egzersizler]);

  // Render egzersiz kartı
  const renderEgzersizKart = useCallback(({ item }) => (
    <View style={styles.egzersizCard}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Icon
              name={iconMap[item.icon] || 'run'}
              size={24}
              color="#fff"
            />
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.title}>{item.isim}</Text>
            <Text style={styles.subtitle}>{item.tarih}</Text>
          </View>
          <TouchableOpacity onPress={() => silEgzersiz(item.id)} style={styles.deleteButton}>
            <Icon name="delete-outline" size={20} color="#757575" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardDetails}>
          <View style={styles.detailItem}>
            <Icon name="clock-outline" size={20} color="#757575" />
            <Text style={styles.detailText}>{item.sure}</Text>
          </View>
        </View>
      </View>
    </View>
  ), [iconMap, silEgzersiz]);

  // Dropdown için egzersiz seçeneği
  const renderEgzersizSecenek = useCallback(({ item }) => (
    <TouchableOpacity
      style={[
        styles.dropdownItem,
        selectedEgzersiz === item.id ? styles.selectedDropdownItem : {}
      ]}
      onPress={() => setSelectedEgzersiz(item.id)}>
      <Icon name={iconMap[item.icon] || 'run'} size={20} color={selectedEgzersiz === item.id ? '#fff' : '#2e7d32'} />
      <Text style={[
        styles.dropdownItemText,
        selectedEgzersiz === item.id ? styles.selectedDropdownItemText : {}
      ]}>
        {item.isim}
      </Text>
    </TouchableOpacity>
  ), [selectedEgzersiz, iconMap]);

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />

      <View style={styles.content}>
        {/* Özet Card */}
        <View style={styles.summaryCard}>
          <View style={styles.cardContent}>
            <Text style={styles.summaryTitle}>Haftalık Özet</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Icon name="clock-outline" size={24} color="#1e88e5" />
                <Text style={styles.statValue}>{toplamSure}</Text>
                <Text style={styles.statLabel}>Dakika</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.statItem}>
                <Icon name="calendar" size={24} color="#43a047" />
                <Text style={styles.statValue}>{egzersizler.length}</Text>
                <Text style={styles.statLabel}>Aktivite</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Egzersiz Listesi */}
        <FlatList
          data={egzersizler}
          renderItem={renderEgzersizKart}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          style={styles.listContainer}
        />
      </View>

      {/* Yeni Egzersiz Ekleme Butonu */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}>
        <Icon name="plus" size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* Yeni Egzersiz Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Egzersiz Ekle</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Egzersiz Seçimi</Text>
              <View style={styles.dropdownContainer}>
                <FlatList
                  data={egzersizSecenekleri}
                  renderItem={renderEgzersizSecenek}
                  keyExtractor={item => item.id}
                  showsVerticalScrollIndicator={false}
                  style={styles.dropdown}
                  nestedScrollEnabled={true}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Süre (dakika)</Text>
              <TextInput
                value={sure}
                onChangeText={setSure}
                keyboardType="numeric"
                style={styles.input}
                placeholder="Süre"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={ekleEgzersiz}
                style={[
                  styles.saveButton,
                  (!selectedEgzersiz || !sure) ? styles.disabledButton : {}
                ]}
                disabled={!selectedEgzersiz || !sure}
              >
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavbar navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  content: {
    flex: 1,
    padding: 16
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2e7d32',
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    color: '#424242'
  },
  summaryCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  cardContent: {
    padding: 16
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#424242'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    marginTop: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#757575'
  },
  verticalDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#e0e0e0'
  },
  listContainer: {
    flex: 1
  },
  egzersizCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  cardTitleContainer: {
    flex: 1
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#424242'
  },
  subtitle: {
    fontSize: 12,
    color: '#757575'
  },
  deleteButton: {
    padding: 4
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  detailText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#616161'
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 16,
    bottom: 72,
    backgroundColor: '#2e7d32',
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#ffffff',
    width: '100%',
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2e7d32',
    textAlign: 'center'
  },
  inputContainer: {
    marginBottom: 16
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    fontSize: 16
  },
  inputLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16
  },
  cancelButton: {
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#2e7d32',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  cancelButtonText: {
    color: '#2e7d32',
    fontSize: 16
  },
  saveButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  disabledButton: {
    backgroundColor: '#bdbdbd'
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginBottom: 16,
    maxHeight: 150
  },
  dropdown: {
    width: '100%'
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  selectedDropdownItem: {
    backgroundColor: '#2e7d32'
  },
  dropdownItemText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#424242'
  },
  selectedDropdownItemText: {
    color: '#ffffff'
  }
});

export default Egzersiz;