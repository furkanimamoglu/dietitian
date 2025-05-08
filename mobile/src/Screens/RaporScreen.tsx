import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Card, Text, Button, Divider, Avatar, Chip } from 'react-native-paper';
import Header from '../Components/Header';
import BottomNavbar from '../Components/BottomNavbar';

// Ana bileşen
const RaporEkrani = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('genel');

  const danisanBilgisi = {
    ad: 'Ayşe Yılmaz',
    yas: 32,
    baslangicTarihi: '15 Ocak 2025',
    sonRandevu: '1 Mayıs 2025',
    gelecekRandevu: '15 Mayıs 2025'
  };

  const olcumler = {
    kilo: [78, 76, 74, 73, 72, 71],
    tarihler: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
    boy: 168,
    yagOrani: [28, 27, 26, 25, 24, 24],
    kasOrani: [32, 33, 34, 35, 36, 36],
    bki: [27.6, 26.9, 26.2, 25.9, 25.5, 25.2]
  };

  const diyetRaporlari = [
    {
      id: 1,
      tarih: '01.05.2025',
      baslik: 'Haftalık Beslenme Analizi',
      detay: 'Protein alımınız hedeflenen seviyenin %20 altında kaldı. Karbonhidrat dengesi iyi durumda.'
    },
    {
      id: 2,
      tarih: '15.04.2025',
      baslik: 'Aylık Değerlendirme',
      detay: 'Son bir ayda 1.5 kg verdiniz. Hedeflenen değere yaklaştınız. Sıvı tüketimi artırılmalı.'
    },
    {
      id: 3,
      tarih: '01.04.2025',
      baslik: 'Haftalık Beslenme Analizi',
      detay: 'Öğün dağılımı dengeli, ara öğünlerde düzenleme yapılması önerilir.'
    }
  ];

  const diyetisyenNotlari = [
    {
      id: 1,
      tarih: '01.05.2025',
      not: 'Günlük su tüketiminin 2.5 litreye çıkarılması önerildi.'
    },
    {
      id: 2,
      tarih: '15.04.2025',
      not: 'Hafta içi protein tüketimi arttırılmalı. Yağ oranınız başarılı bir şekilde düşüyor.'
    },
    {
      id: 3,
      tarih: '01.04.2025',
      not: 'Kahvaltı öğünündeki değişikliğin olumlu etkileri görüldü. Aynı şekilde devam edilmesi önerilir.'
    }
  ];

  const sonOlcumler = useMemo(() => {
    const sonIndex = olcumler.kilo.length - 1;
    return {
      kilo: olcumler.kilo[sonIndex],
      yagOrani: olcumler.yagOrani[sonIndex],
      kasOrani: olcumler.kasOrani[sonIndex],
      bki: olcumler.bki[sonIndex]
    };
  }, [olcumler]);

  const ilerlemeOzeti = useMemo(() => {
    const ilkIndex = 0;
    const sonIndex = olcumler.kilo.length - 1;

    return {
      toplamKiloKaybi: olcumler.kilo[ilkIndex] - olcumler.kilo[sonIndex],
      yagKaybiYuzde: ((olcumler.yagOrani[ilkIndex] - olcumler.yagOrani[sonIndex]) / olcumler.yagOrani[ilkIndex] * 100).toFixed(0),
      kasArtisYuzde: ((olcumler.kasOrani[sonIndex] - olcumler.kasOrani[ilkIndex]) / olcumler.kasOrani[ilkIndex] * 100).toFixed(0)
    };
  }, [olcumler]);

  const renderGenelTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.card}>
        <Card.Title title="Özet Bilgiler" />
        <Card.Content>
          <View style={styles.ozet}>
            <View style={styles.ozetItem}>
              <Text style={styles.ozetValue}>6</Text>
              <Text style={styles.ozetLabel}>Ay</Text>
            </View>

            <View style={styles.ozetItem}>
              <Text style={styles.ozetValue}>12</Text>
              <Text style={styles.ozetLabel}>Randevu</Text>
            </View>

            <View style={styles.ozetItem}>
              <Text style={styles.ozetValue}>{ilerlemeOzeti.toplamKiloKaybi}</Text>
              <Text style={styles.ozetLabel}>Kg Kayıp</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Son Ölçümler" />
        <Card.Content>
          <View style={styles.sonOlcumler}>
            <View style={styles.sonOlcumItem}>
              <Text style={styles.sonOlcumLabel}>Kilo</Text>
              <Text style={styles.sonOlcumValue}>{sonOlcumler.kilo} kg</Text>
            </View>

            <View style={styles.sonOlcumItem}>
              <Text style={styles.sonOlcumLabel}>Yağ</Text>
              <Text style={styles.sonOlcumValue}>%{sonOlcumler.yagOrani}</Text>
            </View>

            <View style={styles.sonOlcumItem}>
              <Text style={styles.sonOlcumLabel}>BKİ</Text>
              <Text style={styles.sonOlcumValue}>{sonOlcumler.bki}</Text>
            </View>
          </View>

          <Button
            mode="contained"
            onPress={() => setActiveTab('olcumler')}
            style={styles.detayButton}
          >
            Tüm Ölçümleri Gör
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Sonraki Randevu" />
        <Card.Content>
          <View style={styles.randevuBilgi}>
            <Avatar.Icon size={48} icon="calendar" style={styles.randevuIcon} />
            <View style={styles.randevuDetay}>
              <Text style={styles.randevuTarih}>{danisanBilgisi.gelecekRandevu}</Text>
              <Text style={styles.randevuSaat}>14:30</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderOlcumlerTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.card}>
        <Card.Title title="Kilo Değişim Grafiği" />
        <Card.Content>
          <View style={styles.chartContainer}>
            {/* Y ekseni değerleri */}
            <View style={styles.yAxis}>
              {[80, 75, 70, 65].map((value) => (
                <Text key={value} style={styles.axisLabel}>{value} kg</Text>
              ))}
            </View>

            {/* Grafik alanı */}
            <View style={styles.graphArea}>
              {/* Yatay çizgiler */}
              <View style={[styles.horizontalLine, { top: '0%' }]} />
              <View style={[styles.horizontalLine, { top: '33%' }]} />
              <View style={[styles.horizontalLine, { top: '66%' }]} />
              <View style={[styles.horizontalLine, { top: '100%' }]} />

              {/* Veri çizgisi - çubuklar ve noktalar */}
              <View style={styles.dataLine}>
                {olcumler.kilo.map((value, index, array) => {
                  // Relatif Y pozisyonu: max 80 min 65 arasında normalize edilmiş
                  const yPosition = 100 - ((value - 65) / (80 - 65) * 100);
                  // X pozisyonu: eşit aralıklı
                  const xPosition = (index / (array.length - 1)) * 100;

                  // Bir sonraki değer varsa çizgi çiz
                  const nextLine = index < array.length - 1 ? (
                    <View
                      key={`line-${index}`}
                      style={[
                        styles.lineSegment,
                        {
                          left: `${xPosition}%`,
                          width: `${100 / (array.length - 1)}%`,
                          top: `${yPosition}%`,
                          height: 2,
                          transform: [{
                            rotate: `${Math.atan2(
                              ((array[index + 1] - 65) / (80 - 65) * 100) - ((value - 65) / (80 - 65) * 100),
                              100 / (array.length - 1)
                            ) * (180 / Math.PI)}deg`
                          }],
                          transformOrigin: 'left center',
                        }
                      ]}
                    />
                  ) : null;

                  return (
                    <React.Fragment key={index}>
                      {nextLine}
                      <View
                        style={[
                          styles.dataPoint,
                          {
                            left: `${xPosition}%`,
                            top: `${yPosition}%`,
                          }
                        ]}
                      />
                    </React.Fragment>
                  );
                })}
              </View>
            </View>
          </View>

          {/* X ekseni değerleri */}
          <View style={styles.xAxis}>
            {olcumler.tarihler.map((label, index) => (
              <Text
                key={label}
                style={[
                  styles.xAxisLabel,
                  { left: `${(index / (olcumler.tarihler.length - 1)) * 100}%` }
                ]}
              >
                {label}
              </Text>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Vücut Ölçümleri" />
        <Card.Content>
          <View style={styles.olcumItem}>
            <Text style={styles.olcumLabel}>Boy:</Text>
            <Text style={styles.olcumValue}>{olcumler.boy} cm</Text>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.olcumItem}>
            <Text style={styles.olcumLabel}>Güncel Kilo:</Text>
            <Text style={styles.olcumValue}>{sonOlcumler.kilo} kg</Text>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.olcumItem}>
            <Text style={styles.olcumLabel}>Yağ Oranı:</Text>
            <Text style={styles.olcumValue}>%{sonOlcumler.yagOrani}</Text>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.olcumItem}>
            <Text style={styles.olcumLabel}>Kas Oranı:</Text>
            <Text style={styles.olcumValue}>%{sonOlcumler.kasOrani}</Text>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.olcumItem}>
            <Text style={styles.olcumLabel}>Vücut Kitle İndeksi:</Text>
            <Text style={styles.olcumValue}>{sonOlcumler.bki}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="İlerleme Özeti" />
        <Card.Content>
          <View style={styles.progressSummary}>
            <View style={styles.progressItem}>
              <Text style={styles.progressValue}>-{ilerlemeOzeti.toplamKiloKaybi} kg</Text>
              <Text style={styles.progressLabel}>Toplam Kayıp</Text>
            </View>

            <View style={styles.progressItem}>
              <Text style={styles.progressValue}>-%{ilerlemeOzeti.yagKaybiYuzde}</Text>
              <Text style={styles.progressLabel}>Yağ Kaybı</Text>
            </View>

            <View style={styles.progressItem}>
              <Text style={styles.progressValue}>+%{ilerlemeOzeti.kasArtisYuzde}</Text>
              <Text style={styles.progressLabel}>Kas Artışı</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderRaporlarTab = () => (
    <View style={styles.tabContent}>
      {diyetRaporlari.map(rapor => (
        <Card key={rapor.id} style={styles.card}>
          <Card.Title
            title={rapor.baslik}
            subtitle={`Tarih: ${rapor.tarih}`}
            right={() => (
              <Button
                icon="file-pdf-box"
                mode="text"
                onPress={() => console.log(`PDF indir: ${rapor.id}`)}
                labelStyle={styles.pdfButtonLabel}
              >
                PDF
              </Button>
            )}
          />
          <Card.Content>
            <Text style={styles.raporDetay}>{rapor.detay}</Text>
          </Card.Content>
          <Card.Actions>
            <Button
              onPress={() => console.log(`Rapor detayı: ${rapor.id}`)}
              mode="outlined"
              style={styles.detayButonStyle}
            >
              Detayları Gör
            </Button>
          </Card.Actions>
        </Card>
      ))}
    </View>
  );

  const renderNotlarTab = () => (
    <View style={styles.tabContent}>
      {diyetisyenNotlari.map(not => (
        <Card key={not.id} style={styles.card}>
          <Card.Title
            title={`${not.tarih} Notu`}
            left={props => <Avatar.Icon {...props} icon="note-text" style={styles.notIcon} />}
          />
          <Card.Content>
            <Text style={styles.notDetay}>{not.not}</Text>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'genel': return renderGenelTab();
      case 'olcumler': return renderOlcumlerTab();
      case 'raporlar': return renderRaporlarTab();
      case 'notlar': return renderNotlarTab();
      default: return renderGenelTab();
    }
  };

  return (
    <View style={styles.container}>
    <Header navigation={navigation} />
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'genel' && styles.activeTabButton]}
          onPress={() => setActiveTab('genel')}
        >
          <Text style={[styles.tabText, activeTab === 'genel' && styles.activeTabText]}>Genel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'olcumler' && styles.activeTabButton]}
          onPress={() => setActiveTab('olcumler')}
        >
          <Text style={[styles.tabText, activeTab === 'olcumler' && styles.activeTabText]}>Ölçümler</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'raporlar' && styles.activeTabButton]}
          onPress={() => setActiveTab('raporlar')}
        >
          <Text style={[styles.tabText, activeTab === 'raporlar' && styles.activeTabText]}>Raporlar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'notlar' && styles.activeTabButton]}
          onPress={() => setActiveTab('notlar')}
        >
          <Text style={[styles.tabText, activeTab === 'notlar' && styles.activeTabText]}>Notlar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {renderActiveTab()}
      </ScrollView>
        <BottomNavbar navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
    color: '#2e7d32'
  },
  chartContainer: {
    height: 220,
    flexDirection: 'row',
    marginVertical: 10,
    marginRight: 10
  },
  graphArea: {
    flex: 1,
    height: 180,
    position: 'relative',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#cccccc',
    marginBottom: 5
  },
  yAxis: {
    width: 45,
    height: 180,
    justifyContent: 'space-between',
    paddingVertical: 5
  },
  axisLabel: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'right',
    paddingRight: 5
  },
  xAxis: {
    height: 20,
    marginTop: 5,
    marginLeft: 45,
    position: 'relative'
  },
  xAxisLabel: {
    fontSize: 10,
    color: '#666666',
    position: 'absolute',
    textAlign: 'center',
    width: 40,
    marginLeft: -20,
    top: 0
  },
  horizontalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#eeeeee'
  },
  dataLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  dataPoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2e7d32',
    marginLeft: -5,
    marginTop: -5
  },
  lineSegment: {
    position: 'absolute',
    backgroundColor: '#2e7d32',
    height: 2
  },
  content: {
    flex: 1,
    paddingHorizontal: 16
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    elevation: 2,
    borderRadius: 25,
    marginHorizontal: 12,
    marginBottom: 16,
    padding: 4
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25
  },
  activeTabButton: {
    backgroundColor: '#e8f5e9'
  },
  tabText: {
    fontSize: 14,
    color: '#757575'
  },
  activeTabText: {
    color: '#2e7d32',
    fontWeight: 'bold'
  },
  tabContent: {
    paddingBottom: 16
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2
  },
  ozet: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16
  },
  ozetItem: {
    alignItems: 'center'
  },
  ozetValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2e7d32'
  },
  ozetLabel: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4
  },
  sonOlcumler: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16
  },
  sonOlcumItem: {
    alignItems: 'center'
  },
  sonOlcumLabel: {
    fontSize: 14,
    color: '#757575'
  },
  sonOlcumValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 4
  },
  detayButton: {
    marginTop: 16,
    backgroundColor: '#2e7d32',
    borderRadius: 12
  },
  olcumItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12
  },
  olcumLabel: {
    fontSize: 16,
    color: '#333333'
  },
  olcumValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32'
  },
  divider: {
    marginVertical: 2
  },
  progressSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16
  },
  progressItem: {
    alignItems: 'center'
  },
  progressValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32'
  },
  progressLabel: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4
  },
  raporDetay: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 12,
    lineHeight: 20
  },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e9',
    marginBottom: 8
  },
  notDetay: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22
  },
  randevuBilgi: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8
  },
  randevuIcon: {
    backgroundColor: '#2e7d32'
  },
  randevuDetay: {
    marginLeft: 16
  },
  randevuTarih: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  randevuSaat: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500'
  },

  notIcon: {
    backgroundColor: '#2e7d32'
  },
  detayButonStyle: {
    borderColor: '#2e7d32',
    marginTop: 8
  },
  pdfButtonLabel: {
    color: '#2e7d32'
  }
});

export default RaporEkrani;