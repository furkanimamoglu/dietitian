import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Card,
  Text,
  FAB,
  Portal,
  Provider,
  Dialog,
  Button,
  TextInput,
  Chip,
  Divider,
  Surface,
  IconButton,
  Colors,
  Avatar
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Header from '../Components/Header';
import BottomNavbar from '../Components/BottomNavbar';

const RandevuScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([
    { id: '1', date: '2025-05-10', time: '10:00', description: 'Periyodik kontrol', confirmed: true, patientName: 'Ahmet Yılmaz' },
    { id: '2', date: '2025-05-15', time: '14:30', description: 'Protein ölçümü', confirmed: false, patientName: 'Ayşe Demir' },
  ]);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [description, setDescription] = useState('');
  const [patientName, setPatientName] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const formatDate = useCallback(date => {
    return date.toISOString().split('T')[0];
  }, []);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = 8; h <= 18; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        slots.push(`${hh}:${mm}`);
      }
    }
    return slots;
  }, []);

  // Dolu saatleri kontrol et (performans için useMemo)
  const busySlots = useMemo(() => {
    return appointments.map(app => ({
      date: app.date,
      time: app.time
    }));
  }, [appointments]);

  // Dialog İşlemleri
  const openDialog = () => {
    setDialogVisible(true);
    setSelectedDate(new Date());
    setSelectedTime('');
    setDescription('');
    setPatientName('');
  };

  const closeDialog = () => {
    setDialogVisible(false);
    setShowDatePicker(false);
  };

  const addAppointment = () => {
    if (description.trim() && selectedTime && patientName.trim()) {
      const newAppointment = {
        id: Date.now().toString(),
        date: formatDate(selectedDate),
        time: selectedTime,
        description,
        patientName,
        confirmed: false
      };

      setAppointments(prev => [...prev, newAppointment]);
      closeDialog();
    }
  };

  // Date picker işlemleri
  const onChangeDate = (_, date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  // Filtreleme işlemleri
  const filteredAppointments = useMemo(() => {
    if (filterStatus === 'all') return appointments;
    return appointments.filter(app =>
      filterStatus === 'confirmed' ? app.confirmed : !app.confirmed
    );
  }, [appointments, filterStatus]);

  // Tarihe göre sıralama - en yakın tarihler önce
  const sortedAppointments = useMemo(() => {
    return [...filteredAppointments].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });
  }, [filteredAppointments]);

  // Tarih formatını daha okunabilir yap (10 Mayıs 2025 gibi)
  const formatDisplayDate = useCallback((dateStr) => {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('tr-TR', options);
  }, []);

  // Liste öğesi render fonksiyonu - performans için useCallback
  const renderItem = useCallback(({ item }) => {
    const isToday = item.date === formatDate(new Date());

    return (
      <Surface style={styles.cardSurface}>
        <Card style={[styles.card, isToday && styles.todayCard]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.dateTimeContainer}>
              <Avatar.Icon
                size={36}
                icon={isToday ? "calendar-today" : "calendar"}
                style={styles.calendarIcon}
                color={isToday ? "#ffffff" : "#2196F3"}
                backgroundColor={isToday ? "#2196F3" : "#E3F2FD"}
              />
              <View style={styles.dateTimeText}>
                <Text style={styles.dateText}>{formatDisplayDate(item.date)}</Text>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.detailsContainer}>
              <Text style={styles.patientName}>{item.patientName}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>

            <View style={styles.statusContainer}>
              <Chip
                mode="outlined"
                icon={item.confirmed ? "check-circle" : "clock-outline"}
                style={[
                  styles.statusChip,
                  item.confirmed ? styles.confirmedChip : styles.pendingChip
                ]}
                textStyle={item.confirmed ? styles.confirmedText : styles.pendingText}
              >
                {item.confirmed ? 'Onaylandı' : 'Onay Bekleniyor'}
              </Chip>

              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={() => console.log('Options')}
              />
            </View>
          </Card.Content>
        </Card>
      </Surface>
    );
  }, [formatDisplayDate, formatDate]);

  // Ana Sayfa Render
  return (
    <Provider>
      <View style={styles.container}>
        <Header navigation={navigation} />

        {/* Filtre Seçenekleri */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Randevular:</Text>
          <View style={styles.chipContainer}>
            <Chip
              selected={filterStatus === 'all'}
              onPress={() => setFilterStatus('all')}
              style={[styles.filterChip, filterStatus === 'all' && styles.activeChip]}
              textStyle={filterStatus === 'all' ? styles.activeChipText : {}}
            >
              Tümü
            </Chip>
            <Chip
              selected={filterStatus === 'confirmed'}
              onPress={() => setFilterStatus('confirmed')}
              style={[styles.filterChip, filterStatus === 'confirmed' && styles.activeChip]}
              textStyle={filterStatus === 'confirmed' ? styles.activeChipText : {}}
            >
              Onaylananlar
            </Chip>
            <Chip
              selected={filterStatus === 'pending'}
              onPress={() => setFilterStatus('pending')}
              style={[styles.filterChip, filterStatus === 'pending' && styles.activeChip]}
              textStyle={filterStatus === 'pending' ? styles.activeChipText : {}}
            >
              Bekleyenler
            </Chip>
          </View>
        </View>

        {/* Randevu Listesi */}
        <FlatList
          data={sortedAppointments}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.content}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Avatar.Icon
                size={64}
                icon="calendar-blank"
                backgroundColor="#F5F5F5"
                color="#cccccc"
              />
              <Text style={styles.empty}>Henüz randevunuz bulunmuyor.</Text>
              <Button
                mode="contained"
                onPress={openDialog}
                style={styles.emptyButton}
              >
                Yeni Randevu Oluştur
              </Button>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />

        <BottomNavbar navigation={navigation} />

        {/* Yeni Randevu FAB */}
        <FAB
          style={styles.fab}
          icon="plus"
          color="#fff"
          onPress={openDialog}
        />

        {/* Yeni Randevu Dialog */}
        <Portal>
          <Dialog visible={dialogVisible} onDismiss={closeDialog} style={styles.dialog}>
            <Dialog.Title style={styles.dialogTitle}>Yeni Randevu Oluştur</Dialog.Title>
            <Dialog.Content>
              {/* Hasta Adı */}
              <TextInput
                label="Hasta Adı"
                value={patientName}
                onChangeText={setPatientName}
                mode="outlined"
                style={styles.input}
              />

              {/* Tarih Seçici */}
              <Button
                mode="outlined"
                icon="calendar"
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
              >
                {formatDate(selectedDate)}
              </Button>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                  minimumDate={new Date()}
                />
              )}

              {/* Saat Seçici - Chip formatında */}
              <Text style={styles.timeLabel}>Saat Seçin:</Text>
              <View style={styles.timeChipContainer}>
                {timeSlots.map(time => {
                  const isDisabled = busySlots.some(
                    slot => slot.date === formatDate(selectedDate) && slot.time === time
                  );

                  return (
                    <Chip
                      key={time}
                      mode={selectedTime === time ? "flat" : "outlined"}
                      selected={selectedTime === time}
                      disabled={isDisabled}
                      onPress={() => setSelectedTime(time)}
                      style={[
                        styles.timeChip,
                        selectedTime === time && styles.selectedTimeChip,
                        isDisabled && styles.disabledTimeChip
                      ]}
                    >
                      {time}
                    </Chip>
                  );
                })}
              </View>

              {/* Açıklama */}
              <TextInput
                label="Randevu Detayı"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                multiline
                numberOfLines={2}
                style={styles.input}
              />
            </Dialog.Content>

            <Dialog.Actions>
              <Button onPress={closeDialog}>İptal</Button>
              <Button
                mode="contained"
                onPress={addAppointment}
                disabled={!selectedTime || !description.trim() || !patientName.trim()}
              >
                Randevu Oluştur
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7'
  },
  content: {
    padding: 12,
    paddingBottom: 100
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  filterLabel: {
    fontWeight: 'bold',
    marginRight: 10
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: 'transparent'
  },
  activeChip: {
    backgroundColor: '#E3F2FD'
  },
  activeChipText: {
    color: '#2196F3',
    fontWeight: 'bold'
  },
  cardSurface: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2
  },
  card: {
    borderRadius: 12
  },
  todayCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3'
  },
  cardContent: {
    padding: 8
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  calendarIcon: {
    marginRight: 12
  },
  dateTimeText: {
    flex: 1
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  timeText: {
    fontSize: 14,
    color: '#666'
  },
  divider: {
    marginVertical: 8
  },
  detailsContainer: {
    marginBottom: 8
  },
  patientName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333'
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusChip: {
    height: 30
  },
  confirmedChip: {
    borderColor: '#4CAF50'
  },
  pendingChip: {
    borderColor: '#FF9800'
  },
  confirmedText: {
    color: '#388E3C'
  },
  pendingText: {
    color: '#F57C00'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40
  },
  empty: {
    textAlign: 'center',
    color: '#777',
    marginTop: 16,
    marginBottom: 24
  },
  emptyButton: {
    paddingHorizontal: 16
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    backgroundColor: '#2196F3'
  },
  dialog: {
    borderRadius: 16
  },
  dialogTitle: {
    textAlign: 'center',
    fontWeight: 'bold'
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff'
  },
  dateButton: {
    marginBottom: 16
  },
  timeLabel: {
    fontWeight: 'bold',
    marginBottom: 8
  },
  timeChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16
  },
  timeChip: {
    margin: 4
  },
  selectedTimeChip: {
    backgroundColor: '#E3F2FD'
  },
  disabledTimeChip: {
    backgroundColor: '#f0f0f0'
  }
});

export default RandevuScreen;