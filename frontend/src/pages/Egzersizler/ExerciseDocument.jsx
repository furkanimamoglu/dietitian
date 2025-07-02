import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
    family: 'Open Sans',
    src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf'
});

const pdfStyles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#fff',
        padding: 20,
        fontFamily: 'Open Sans'
    },
    header: {
        backgroundColor: '#087708',
        padding: 20,
        marginBottom: 20,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerContent: {
        flex: 1
    },
    headerTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8
    },
    headerSubtitle: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 12,
        marginBottom: 10
    },
    headerInfo: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 10
    },
    logoContainer: {
        width: 60,
        height: 60,
        backgroundColor: 'white',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 15
    },
    logo: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#087708'
    },
    infoCardsSection: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 15
    },
    infoCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        border: '1px solid #e9ecef'
    },
    infoCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottom: '2px solid #ff9800'
    },
    infoCardIcon: {
        width: 12,
        height: 12,
        backgroundColor: '#ff9800',
        borderRadius: 6,
        marginRight: 8
    },
    infoCardTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ff9800',
        textTransform: 'uppercase'
    },
    infoCardContent: {
        fontSize: 11,
        color: '#495057',
        lineHeight: 1.5,
        marginBottom: 4
    },
    exerciseDetailsSection: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        border: '1px solid #e9ecef',
        marginBottom: 15
    },
    exerciseDetailsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottom: '2px solid #ff9800'
    },
    exerciseDetailsTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#ff9800',
        textTransform: 'uppercase'
    },
    exerciseDetailsContent: {
        marginTop: 8
    },
    exerciseDetailRow: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'flex-start'
    },
    exerciseDetailIcon: {
        fontSize: 12,
        color: '#ff9800',
        marginRight: 12,
        fontWeight: 'bold',
        minWidth: 20
    },
    exerciseDetailLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#087708',
        minWidth: 100,
        marginRight: 10
    },
    exerciseDetailValue: {
        flex: 1,
        fontSize: 11,
        color: '#495057',
        lineHeight: 1.4
    },
    instructionsSection: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        border: '1px solid #e9ecef',
        marginBottom: 15
    },
    instructionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottom: '2px solid #ff9800'
    },
    instructionsTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#ff9800',
        textTransform: 'uppercase'
    },
    instructionsContent: {
        marginTop: 8
    },
    instructionsText: {
        fontSize: 11,
        lineHeight: 1.6,
        color: '#495057'
    },
    difficultyBadge: {
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
        border: '1px solid rgba(255, 152, 0, 0.2)',
        alignSelf: 'flex-start'
    },
    difficultyText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#ff9800'
    },
    emptyState: {
        textAlign: 'center',
        color: '#9e9e9e',
        fontSize: 11,
        padding: 20,
        backgroundColor: '#f8f9fa',
        borderRadius: 4
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 15,
        borderTop: '2px solid #e9ecef'
    },
    footerLeft: {
        flex: 1
    },
    footerText: {
        fontSize: 10,
        color: '#087708',
        fontWeight: 'bold'
    },
    footerWebsite: {
        fontSize: 10,
        color: '#ff9800',
        fontWeight: 'bold',
        marginTop: 2
    },
    footerRight: {
        alignItems: 'flex-end'
    },
    footerLogo: {
        fontSize: 12,
        color: '#087708',
        fontWeight: 'bold'
    },
    footerDate: {
        fontSize: 8,
        color: '#6c757d',
        marginTop: 2
    }
});

const ExerciseDocument = ({exercise, assignmentData, dietitian}) => {
    if (!exercise) {
        return null;
    }

    const today = new Date();
    const dateStr = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`;
    const timeStr = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;

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

    const getDifficultyColor = (difficulty) => {
        const colorMap = {
            1: "#4caf50", // Yeşil
            2: "#8bc34a", // Açık yeşil
            3: "#ff9800", // Turuncu
            4: "#ff5722", // Kırmızı-turuncu
            5: "#f44336"  // Kırmızı
        };
        return colorMap[difficulty] || "#9e9e9e";
    };

    return (
        <Document>
            <Page size="A4" style={pdfStyles.page}>
                {/* Modern Header */}
                <View style={pdfStyles.header}>
                    <View style={pdfStyles.headerContent}>
                        <Text style={pdfStyles.headerTitle}>
                            {exercise?.exercise_name || "İsimsiz Egzersiz"}
                        </Text>
                        <Text style={pdfStyles.headerInfo}>
                            Diyetisyen: {dietitian?.name || "Belirtilmemiş"}
                        </Text>
                        <Text style={pdfStyles.headerInfo}>
                            Oluşturulma: {dateStr} - {timeStr}
                        </Text>
                    </View>
                    <View style={pdfStyles.logoContainer}>
                        <Text style={pdfStyles.logo}>Diyetia</Text>
                    </View>
                </View>

                {/* Info Cards Section */}
                <View style={pdfStyles.infoCardsSection}>
                    {assignmentData && (
                        <View style={pdfStyles.infoCard}>
                            <View style={pdfStyles.infoCardHeader}>
                                <View style={pdfStyles.infoCardIcon}></View>
                                <Text style={pdfStyles.infoCardTitle}>Program Detayları</Text>
                            </View>
                            <Text style={pdfStyles.infoCardContent}>
                                {assignmentData.clientName || "Belirtilmemiş"}
                            </Text>
                            <Text style={pdfStyles.infoCardContent}>
                                Başlangıç: {assignmentData.startDate ?
                                new Date(assignmentData.startDate).toLocaleDateString('tr-TR') :
                                "Belirtilmemiş"}
                            </Text>
                            <Text style={pdfStyles.infoCardContent}>
                                Bitiş: {assignmentData.endDate ?
                                new Date(assignmentData.endDate).toLocaleDateString('tr-TR') :
                                "Belirtilmemiş"}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Exercise Details Section */}
                <View style={pdfStyles.exerciseDetailsSection}>
                    <View style={pdfStyles.exerciseDetailsHeader}>
                        <Text style={pdfStyles.exerciseDetailsTitle}>Egzersiz Özellikleri</Text>
                    </View>
                    <View style={pdfStyles.exerciseDetailsContent}>
                        <View style={pdfStyles.exerciseDetailRow}>
                            <Text style={pdfStyles.exerciseDetailLabel}>Zorluk Seviyesi:</Text>
                            <View style={[pdfStyles.difficultyBadge, {
                                backgroundColor: `${getDifficultyColor(exercise?.difficulty)}20`,
                                borderColor: `${getDifficultyColor(exercise?.difficulty)}40`
                            }]}>
                                <Text style={[pdfStyles.difficultyText, {
                                    color: getDifficultyColor(exercise?.difficulty)
                                }]}>
                                    {getDifficultyText(exercise?.difficulty)}
                                </Text>
                            </View>
                        </View>

                        <View style={pdfStyles.exerciseDetailRow}>
                            <Text style={pdfStyles.exerciseDetailLabel}>Kalori Yakımı:</Text>
                            <Text style={pdfStyles.exerciseDetailValue}>
                                {exercise?.calories_burned ? `${exercise.calories_burned} kcal` : "Belirtilmemiş"}
                            </Text>
                        </View>

                        <View style={pdfStyles.exerciseDetailRow}>
                            <Text style={pdfStyles.exerciseDetailLabel}>Süre:</Text>
                            <Text style={pdfStyles.exerciseDetailValue}>
                                {exercise?.duration ? `${exercise.duration} dakika` : "Belirtilmemiş"}
                            </Text>
                        </View>

                        <View style={pdfStyles.exerciseDetailRow}>
                            <Text style={pdfStyles.exerciseDetailLabel}>Ekipman:</Text>
                            <Text style={pdfStyles.exerciseDetailValue}>
                                {exercise?.equipment || "Ekipman gerekmez"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Instructions Section */}
                <View style={pdfStyles.instructionsSection}>
                    <View style={pdfStyles.instructionsHeader}>
                        <Text style={pdfStyles.instructionsTitle}>Egzersiz Talimatları</Text>
                    </View>
                    <View style={pdfStyles.instructionsContent}>
                        {exercise?.instructions ? (
                            <Text style={pdfStyles.instructionsText}>
                                {exercise.instructions}
                            </Text>
                        ) : (
                            <Text style={pdfStyles.emptyState}>
                                Bu egzersiz için detaylı talimat bulunmamaktadır.
                            </Text>
                        )}
                    </View>
                </View>

                {/* Footer */}
                <View style={pdfStyles.footer}>
                    <View style={pdfStyles.footerLeft}>
                        <Text style={pdfStyles.footerText}>Sağlıklı kalın!</Text>
                        <Text style={pdfStyles.footerWebsite}>www.diyetia.com</Text>
                    </View>
                    <View style={pdfStyles.footerRight}>
                        <Text style={pdfStyles.footerLogo}>Diyetia</Text>
                        <Text style={pdfStyles.footerDate}>{dateStr} - {timeStr}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default ExerciseDocument;