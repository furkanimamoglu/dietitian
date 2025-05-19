import React, {useRef} from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    SafeAreaView,
    TouchableOpacity,
    StatusBar
} from 'react-native';
import {Text} from 'react-native-paper';
import Swiper from 'react-native-swiper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useMemo} from 'react';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const {width, height} = Dimensions.get('window');

// Performans için onboarding içeriğini memo olarak tanımla
const OnboardingContent = [
    {
        icon: "nutrition",
        title: "Hoş Geldiniz!",
        description: "Bu uygulama sayesinde danışanlarının beslenmesini kolayca takip edebilir, öğünlerini planlayabilir ve hedeflerine ulaşmalarında rehberlik edebilirsin."
    },
    {
        icon: "account-supervisor",
        title: "Danışanlarını Yönet",
        description: "Tüm danışanlarını tek bir yerden takip et, beslenme programlarını düzenle ve ilerleme raporlarını anında gör."
    },
    {
        icon: "chart-line",
        title: "Gelişimi Takip Et",
        description: "Danışanlarının kilo, vücut ölçüleri ve beslenme alışkanlıklarındaki değişimleri analiz et ve daha iyi sonuçlar için öneriler sun."
    }
];

const OnboardingScreen = ({navigation}: Props) => {
    // Swiper referansı
    const swiperRef = useRef<Swiper>(null);

    // Memoize edilen slide sayfaları
    const slides = useMemo(() => OnboardingContent.map((slide, index) => (
        <View key={index} style={styles.slide}>
            <View style={styles.iconContainer}>
                <Icon name={slide.icon} size={72} color="#FF6B00"/>
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
        </View>
    )), []);

    // Son slide gösterilip gösterilmediğini kontrol et
    const isLastSlide = (index: number) => {
        return index === slides.length - 1;
    };

    // Giriş sayfasına git
    const goToLogin = () => {
        navigation.replace('Login');
    };

    // Bir sonraki sayfaya geç
    const goToNextSlide = (index: number) => {
        if (isLastSlide(index)) {
            goToLogin();
        } else {
            swiperRef.current?.scrollBy(1);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF"/>

            <Swiper
                ref={swiperRef}
                loop={false}
                showsButtons={false}
                dotStyle={styles.dot}
                activeDotStyle={styles.activeDot}
                paginationStyle={styles.pagination}
                onIndexChanged={(index) => {
                    // Slide değişimlerini burada izleyebilirsiniz
                    console.log(`Slide changed to ${index}`);
                }}
            >
                {slides}
            </Swiper>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={goToLogin}
                >
                    <Text style={styles.skipText}>Geç</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={() => goToNextSlide(swiperRef.current?.state.index || 0)}
                >
                    <Text style={styles.nextButtonText}>
                        {isLastSlide(swiperRef.current?.state.index || 0) ? "Başla" : "İlerle"}
                    </Text>
                    <Icon name="arrow-right" size={20} color="#FFFFFF" style={styles.nextIcon}/>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff9f2',
    },
    slide: {
        flex: 1,
        width,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingTop: height * 0.1,
        paddingBottom: height * 0.2,
    },
    iconContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255, 107, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        shadowColor: "#FF6B00",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 6,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333333',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    pagination: {
        bottom: height * 0.15,
    },
    dot: {
        backgroundColor: '#E0E0E0',
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#FF6B00',
        width: 24,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    skipButton: {
        padding: 8,
    },
    skipText: {
        color: '#666666',
        fontSize: 16,
        fontWeight: '500',
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF6B00',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 30,
        shadowColor: "#FF6B00",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    nextIcon: {
        marginLeft: 8,
    }
});

export default OnboardingScreen;