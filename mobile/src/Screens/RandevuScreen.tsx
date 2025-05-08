import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  Avatar
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Header from '../Components/Header';
import BottomNavbar from '../Components/BottomNavbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';

interface Appointment {
  id: number;
  title: string;
  status: 'pending' | 'confirmed';
  start: string;
  end: string;
  dietitian_id: number;
  client_id: number;
}

interface NavigationProps {
  navigation: any;
}

const RandevuScreen = ({ navigation }: NavigationProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('Token Bulunamadı');
        return;
      }

      const response = await fetch(`${config.apiUrl}/appointment/fetchClientAppointments`, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 500) {
        setAppointments([]);
        return;
      }

      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        setAppointments(data);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setAppointments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAppointments();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [description, setDescription] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const formatDate = useCallback((date: Date) => {
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
      date: new Date(app.start).toISOString().split('T')[0],
      time: new Date(app.start).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    }));
  }, [appointments]);

  // Dialog İşlemleri
  const openDialog = () => {
    setDialogVisible(true);
    setSelectedDate(new Date());
    setSelectedTime('');
    setDescription('');
  };

  const closeDialog = () => {
    setDialogVisible(false);
    setShowDatePicker(false);
  };

  const addAppointment = () => {
    if (description.trim() && selectedTime) {
      const newAppointment: Appointment = {
        id: Date.now(),
        title: description,
        status: 'pending' as const,
        start: new Date(`${formatDate(selectedDate)}T${selectedTime}`).toISOString(),
        end: new Date(`${formatDate(selectedDate)}T${selectedTime}`).toISOString(),
        dietitian_id: 1, // Bu değer API'den alınmalı
        client_id: 3 // Bu değer API'den alınmalı
      };

      setAppointments(prev => [...prev, newAppointment]);
      closeDialog();
    }
  };

  // Date picker işlemleri
  const onChangeDate = (_: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  // Filtreleme işlemleri
  const filteredAppointments = useMemo(() => {
    if (filterStatus === 'all') return appointments;
    return appointments.filter(app =>
      filterStatus === 'confirmed' ? app.status === 'confirmed' : app.status === 'pending'
    );
  }, [appointments, filterStatus]);

  // Tarihe göre sıralama - en yakın tarihler önce
  const sortedAppointments = useMemo(() => {
    return [...filteredAppointments].sort((a, b) => {
      const dateA = new Date(a.start);
      const dateB = new Date(b.start);
      return dateA.getTime() - dateB.getTime();
    });
  }, [filteredAppointments]);

  // Tarih formatını daha okunabilir yap (10 Mayıs 2025 gibi)
  const formatDisplayDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('tr-TR', options);
  }, []);

  // Liste öğesi render fonksiyonu - performans için useCallback
  const renderItem = useCallback(({ item }: { item: Appointment }) => {
    const isToday = new Date(item.start).toISOString().split('T')[0] === formatDate(new Date());

    return (
      <Surface style={styles.cardSurface}>
        <Card style={[styles.card, isToday && styles.todayCard]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.dateTimeContainer}>
              <Avatar.Icon
                size={36}
                icon={isToday ? "calendar-today" : "calendar"}
                style={[styles.calendarIcon, { backgroundColor: isToday ? "#2196F3" : "#E3F2FD" }]}
                color={isToday ? "#ffffff" : "#2196F3"}
              />
              <View style={styles.dateTimeText}>
                <Text style={styles.dateText}>{formatDisplayDate(item.start)}</Text>
                <Text style={styles.timeText}>
                  {new Date(item.start).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.detailsContainer}>
              <Text style={styles.description}>{item.title}</Text>
            </View>

            <View style={styles.statusContainer}>
              <Chip
                mode="outlined"
                icon={item.status === 'confirmed' ? "check-circle" : "clock-outline"}
                style={[
                  styles.statusChip,
                  item.status === 'confirmed' ? styles.confirmedChip : styles.pendingChip
                ]}
                textStyle={item.status === 'confirmed' ? styles.confirmedText : styles.pendingText}
              >
                {item.status === 'confirmed' ? 'Onaylandı' : 'Onay Bekleniyor'}
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
              Onaylı
            </Chip>
            <Chip
              selected={filterStatus === 'pending'}
              onPress={() => setFilterStatus('pending')}
              style={[styles.filterChip, filterStatus === 'pending' && styles.activeChip]}
              textStyle={filterStatus === 'pending' ? styles.activeChipText : {}}
            >
              Bekleyen
            </Chip>
          </View>
        </View>

        {/* Randevu Listesi */}
        <FlatList
          data={sortedAppointments}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.content}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Avatar.Icon
                size={64}
                icon="calendar-blank"
                style={{ backgroundColor: "#F5F5F5" }}
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
                disabled={!selectedTime || !description.trim()}
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