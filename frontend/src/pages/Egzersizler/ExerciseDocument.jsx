import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
    family: 'Open Sans',
    src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf'
});

const pdfStyles = StyleSheet.create({
    page: {
        padding: 30,
        backgroundColor: '#fff',
        fontFamily: 'Helvetica'
    },
    header: {
        flexDirection: 'row',
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#ff9800',
        paddingBottom: 10,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        color: '#ff9800',
        marginBottom: 5,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    headerInfo: {
        fontSize: 10,
        color: '#999',
    },
    logoContainer: {
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff9800',  // Yeşil yerine turuncu renk
    },
    infoSection: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 10,
    },
    infoCard: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 5,
    },
    infoCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    infoIcon: {
        width: 12,
        height: 12,
        backgroundColor: '#ff9800',  // Yeşil yerine turuncu renk
        borderRadius: 6,
        marginRight: 5,
    },
    infoTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
    },
    infoContent: {
        fontSize: 10,
        color: '#666',
        marginTop: 3,
    },
    exerciseDetails: {
        marginBottom: 20,
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ff9800',  // Yeşil yerine turuncu renk
        padding: 8,
        borderRadius: 5,
        marginBottom: 10,
    },
    exerciseHeaderIcon: {
        width: 12,
        height: 12,
        backgroundColor: 'white',
        borderRadius: 6,
        marginRight: 5,
    },
    exerciseHeaderText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    exerciseContent: {
        padding: 10,
    },
    exerciseRow: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    exerciseLabel: {
        width: 120,
        fontSize: 10,
        fontWeight: 'bold',
        color: '#ff9800',  // Yeşil yerine turuncu renk
    },
    exerciseValue: {
        flex: 1,
        fontSize: 10,
        color: '#333',
    },
    instructionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ff9800',  // Yeşil yerine turuncu renk
        padding: 8,
        borderRadius: 5,
        marginBottom: 10,
    },
    instructionsHeaderIcon: {
        width: 12,
        height: 12,
        backgroundColor: 'white',
        borderRadius: 6,
        marginRight: 5,
    },
    instructionsHeaderText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    instructionsContent: {
        fontSize: 10,
        color: '#333',
        lineHeight: 1.5,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#ff9800',  // Yeşil yerine turuncu renk
        paddingTop: 10,
    },
    footerText: {
        color: '#999',
        fontSize: 8,
    },
    footerHighlight: {
        color: '#ff9800',  // Yeşil yerine turuncu renk
        fontSize: 8,
        fontWeight: 'bold',
    }
});

const ExerciseDocument = ({exercise, assignmentData, dietitianInfo = {}}) => {
    const today = new Date();
    const dateStr = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`;

    const getDifficultyText = (difficulty) => {
        const difficultyMap = {
            1: "Çok Kolay",
            2: "Kolay",
            3: "Orta",
            4: "Zor",
            5: "Çok Zor"
        };
        return difficultyMap[difficulty] || "Belirtilmemiş";
    };

    return (
        <Document>
            <Page size="A4" style={pdfStyles.page}>
                {/* Enhanced Header */}
                <View style={pdfStyles.header}>
                    <View style={pdfStyles.headerContent}>
                        <Text style={pdfStyles.headerTitle}>{exercise?.exercise_name || "İsimsiz Egzersiz"}</Text>
                        <Text style={pdfStyles.headerSubtitle}>Kişisel Egzersiz Programı</Text>
                        <View style={pdfStyles.headerInfo}>
                            <Text>Oluşturulma: {dateStr}</Text>
                        </View>
                    </View>
                    <View style={pdfStyles.logoContainer}>
                        <Text style={pdfStyles.logo}>Diyetia</Text>
                    </View>
                </View>

                {/* Enhanced Info Cards */}
                <View style={pdfStyles.infoSection}>
                    <View style={pdfStyles.infoCard}>
                        <View style={pdfStyles.infoCardHeader}>
                            <View style={pdfStyles.infoIcon}></View>
                            <Text style={pdfStyles.infoTitle}>Diyetisyen</Text>
                        </View>
                        <Text style={pdfStyles.infoContent}>{dietitianInfo?.name || "Belirtilmemiş"}</Text>
                        <Text style={pdfStyles.infoContent}>{dietitianInfo?.phoneNumber || "Belirtilmemiş"}</Text>
                        <Text style={pdfStyles.infoContent}>{dietitianInfo?.email || "Belirtilmemiş"}</Text>
                    </View>

                    {assignmentData && (
                        <View style={pdfStyles.infoCard}>
                            <View style={pdfStyles.infoCardHeader}>
                                <View style={pdfStyles.infoIcon}></View>
                                <Text style={pdfStyles.infoTitle}>Program Detayları</Text>
                            </View>
                            <Text style={pdfStyles.infoContent}>👤 {assignmentData.clientName || "Belirtilmemiş"}</Text>
                            <Text style={pdfStyles.infoContent}>🗓️ {assignmentData.startDate ? new Date(assignmentData.startDate).toLocaleDateString('tr-TR') : "Belirtilmemiş"}</Text>
                            <Text style={pdfStyles.infoContent}>⏰ {assignmentData.endDate ? new Date(assignmentData.endDate).toLocaleDateString('tr-TR') : "Belirtilmemiş"}</Text>
                        </View>
                    )}
                </View>

                {/* Enhanced Exercise Details */}
                <View style={pdfStyles.exerciseDetails}>
                    <View style={pdfStyles.exerciseHeader}>
                        <View style={pdfStyles.exerciseHeaderIcon}></View>
                        <Text style={pdfStyles.exerciseHeaderText}>Egzersiz Özellikleri</Text>
                    </View>
                    <View style={pdfStyles.exerciseContent}>
                        <View style={pdfStyles.exerciseRow}>
                            <Text style={pdfStyles.exerciseLabel}>Kategori:</Text>
                            <Text style={pdfStyles.exerciseValue}>{exercise?.category?.name || "Belirtilmemiş"}</Text>
                        </View>
                        <View style={pdfStyles.exerciseRow}>
                            <Text style={pdfStyles.exerciseLabel}>Zorluk:</Text>
                            <Text style={pdfStyles.exerciseValue}>{getDifficultyText(exercise?.difficulty)}</Text>
                        </View>
                        <View style={pdfStyles.exerciseRow}>
                            <Text style={pdfStyles.exerciseLabel}>Kalori Yakımı:</Text>
                            <Text style={pdfStyles.exerciseValue}>{exercise?.calories_burned ? `${exercise.calories_burned} kcal` : "Belirtilmemiş"}</Text>
                        </View>
                        <View style={pdfStyles.exerciseRow}>
                            <Text style={pdfStyles.exerciseLabel}>Süre:</Text>
                            <Text style={pdfStyles.exerciseValue}>{exercise?.duration ? `${exercise.duration} dakika` : "Belirtilmemiş"}</Text>
                        </View>
                        <View style={pdfStyles.exerciseRow}>
                            <Text style={pdfStyles.exerciseLabel}>Ekipman:</Text>
                            <Text style={pdfStyles.exerciseValue}>{exercise?.equipment || "Ekipman gerekmez"}</Text>
                        </View>
                    </View>
                </View>

                {/* Instructions Section */}
                <View style={pdfStyles.exerciseDetails}>
                    <View style={pdfStyles.instructionsHeader}>
                        <View style={pdfStyles.instructionsHeaderIcon}></View>
                        <Text style={pdfStyles.instructionsHeaderText}>Egzersiz Detayi</Text>
                    </View>
                    <Text style={pdfStyles.instructionsContent}>{exercise?.instructions || "Bu egzersiz için talimat bulunmamaktadır."}</Text>
                </View>

                {/* Footer */}
                <View style={pdfStyles.footer}>
                    <Text style={pdfStyles.footerText}>
                        Bu doküman <Text style={pdfStyles.footerHighlight}>Diyetia</Text> platformu tarafından {dateStr} tarihinde üretilmiştir.
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default ExerciseDocument;

