import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import {
  Card,
  Text,
  FAB,
  Portal,
  Provider,
  Dialog,
  Button as PaperButton,
  TextInput as PaperInput
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Header from '../Components/Header';
import BottomNavbar from '../Components/BottomNavbar';

const generateTimeSlots = (start = 8, end = 18) => {
  const slots = [];
  for (let h = start; h <= end; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hh = h.toString().padStart(2, '0');
      const mm = m.toString().padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
};

const RandevuScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([
    { id: '1', date: '2025-05-10', time: '10:00', description: 'Periyodik kontrol', confirmed: true },
    { id: '2', date: '2025-05-15', time: '14:30', description: 'Protein ölçümü', confirmed: false },
  ]);

  const busySlots = [
    { date: '2025-05-10', time: '10:00' },
    { date: '2025-05-12', time: '11:00' },
  ];

  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimeList, setShowTimeList] = useState(false);
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [description, setDescription] = useState('');

  const formatDate = d => d.toISOString().split('T')[0];

  const openDialog = () => setDialogVisible(true);
  const closeDialog = () => {
    setDialogVisible(false);
    setShowTimeList(false);
    setShowDatePicker(false);
  };

  // Tarih seçimi: her gün seçilebilir
  const onChangeDate = (_, date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const timeSlots = generateTimeSlots();

  const addAppointment = () => {
    const d = formatDate(selectedDate);
    if (description.trim()) {
      setAppointments([
        ...appointments,
        { id: Date.now().toString(), date: d, time: selectedTime, description, confirmed: false }
      ]);
      setDescription('');
      closeDialog();
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Title
        title={`${item.date} ${item.time}`}
        right={() => (
          <Text style={item.confirmed ? styles.confirmed : styles.pending}>
            {item.confirmed ? 'Onaylandı' : 'Onay Bekleniyor'}
          </Text>
        )}
      />
      <Card.Content>
        <Text>{item.description}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <Provider>
      <View style={styles.container}>
        <Header navigation={navigation} />
        <FlatList
          data={appointments}
          keyExtractor={item => item.id}
          ListHeaderComponent={<Text style={styles.header}>Bu Ayki Randevularınız</Text>}
          renderItem={renderItem}
          contentContainerStyle={styles.content}
          ListEmptyComponent={<Text style={styles.empty}>Henüz randevunuz yok.</Text>}
        />
        <BottomNavbar navigation={navigation} />
        <FAB style={styles.fab} icon="plus" onPress={openDialog} />
        <Portal>
          <Dialog visible={dialogVisible} onDismiss={closeDialog}>
            <Dialog.Title>Yeni Randevu Oluştur</Dialog.Title>
            <Dialog.Content>
              {/* Tarih seçici */}
              <PaperButton mode="outlined" onPress={() => setShowDatePicker(true)} style={styles.pickerButton}>
                Tarih: {formatDate(selectedDate)}
              </PaperButton>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}

              {/* Saat listesi */}
              <PaperButton
                mode="outlined"
                onPress={() => setShowTimeList(true)}
                style={[styles.pickerButton, styles.mt10]}
              >
                Saat: {selectedTime}
              </PaperButton>
              {showTimeList && (
                <ScrollView style={styles.timeList}>
                  {timeSlots.map(ts => {
                    const disabled = busySlots.some(s => s.date === formatDate(selectedDate) && s.time === ts);
                    return (
                      <PaperButton
                        key={ts}
                        mode={selectedTime === ts ? 'contained' : 'text'}
                        disabled={disabled}
                        onPress={() => { setSelectedTime(ts); setShowTimeList(false); }}
                      >
                        {ts}
                      </PaperButton>
                    );
                  })}
                </ScrollView>
              )}

              <PaperInput
                label="Açıklama"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                style={styles.mt10}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <PaperButton onPress={closeDialog}>İptal</PaperButton>
              <PaperButton onPress={addAppointment}>Kaydet</PaperButton>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 16 },
  header: { fontSize: 20, fontWeight: 'bold', margin: 16, color: '#2e7d32' },
  empty: { textAlign: 'center', marginTop: 20, color: '#777' },
  card: { marginHorizontal: 16, marginBottom: 12, borderRadius: 12, elevation: 2 },
  confirmed: { color: 'green', fontWeight: 'bold', marginRight: 16 },
  pending: { color: 'orange', fontWeight: 'bold', marginRight: 16 },
  fab: { position: 'absolute', right: 16, bottom: 80, backgroundColor: '#f57c00' },
  mt10: { marginTop: 10 },
  pickerButton: { marginTop: 10 },
  timeList: { maxHeight: 200 }
});

export default RandevuScreen;
