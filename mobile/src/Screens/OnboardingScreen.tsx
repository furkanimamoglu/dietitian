import React, {useMemo, useRef, useState} from 'react';
import {Animated, Dimensions, SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';
import Swiper from 'react-native-swiper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const {width, height} = Dimensions.get('window');

const OnboardingContent = [
    {
        icon: "nutrition",
        title: "Hoş Geldin!",
        description: "Yeni bir başlangıç için hazırsın! Diyetia ile diyetisyeninin desteğini her an yanında hissedecek, sağlıklı yaşam yolculuğunda yalnız yürümeyeceksin.",
        color: ["#FFB75E", "#ED8F03"]
    },
    {
        icon: "food-apple",
        title: "Sana Özel Plan",
        description: "Diyetisyenin senin için bir beslenme planı hazırladığında. Ne zaman ne yiyeceğini kolayca görebilir, alternatifler arasından sana en uygun olanı seçebilirsin.",
        color: ["#FF8E53", "#FF6B00"]
    },
    {
        icon: "chart-line",
        title: "İlerlemeni Takip Et",
        description: "Kilon, ölçülerin ve alışkanlıkların artık seninle birlikte şekilleniyor. Küçük adımlarla büyük farklar yaratacak, her gelişmeni grafiklerle kolayca göreceksin.",
        color: ["#FFB75E", "#ED8F03"]
    },
    {
        icon: "bell-ring",
        title: "Motivasyon Hep Yanında",
        description: "Hatırlatmalar, hedefler ve diyetisyeninden gelen destek mesajlarıyla motive kal. Unutma, bu yolculukta birlikteyiz!",
        color: ["#FFA500", "#FF6347"]
    }
];


const OnboardingScreen = ({navigation}: Props) => {
    const swiperRef = useRef<Swiper>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const translateY = useRef(new Animated.Value(0)).current;

    const fadeIn = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            })
        ]).start();
    };

    const fadeOut = (callback: () => void) => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 20,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(callback);
    };

    const slides = useMemo(() => OnboardingContent.map((slide, index) => (
        <View key={index} style={styles.slide}>
            <LinearGradient
                colors={slide.color}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.gradientBg}
            />
            <View style={styles.slideContent}>
                <View style={styles.iconContainer}>
                    <Icon name={slide.icon} size={80} color="#FFFFFF"/>
                </View>
                <Animated.View style={[
                    styles.textContainer,
                    {opacity: fadeAnim, transform: [{translateY}]}
                ]}>
                    <Text style={styles.title}>{slide.title}</Text>
                    <Text style={styles.description}>{slide.description}</Text>
                </Animated.View>
            </View>
        </View>
    )), [fadeAnim, translateY]);

    const isLastSlide = (index: number) => {
        return index === slides.length - 1;
    };

    const goToLogin = () => {
        navigation.replace('Login');
    };

    const goToNextSlide = (index: number) => {
        if (isLastSlide(index)) {
            goToLogin();
        } else {
            fadeOut(() => {
                swiperRef.current?.scrollBy(1);
                fadeIn();
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#FF6B00"/>

            <Swiper
                ref={swiperRef}
                loop={false}
                showsButtons={false}
                dotStyle={styles.dot}
                activeDotStyle={styles.activeDot}
                paginationStyle={styles.pagination}
                onIndexChanged={(index) => {
                    setActiveIndex(index);
                    fadeIn();
                }}
                onTouchEnd={(e) => {
                    // Son slaytta olup olmadığımızı kontrol et
                    const currentIndex = swiperRef.current?.state.index || 0;
                    if (isLastSlide(currentIndex)) {
                        // Son slayttaysak ve parmak sağa kaydırılmışsa
                        const touchEndX = e.nativeEvent.pageX;
                        const touchStartX = e.nativeEvent.locationX;

                        // Eğer kaydırma hareketi sağa doğruysa (touchEndX < touchStartX) Login'e git
                        if (touchEndX < touchStartX - 50) {
                            goToLogin();
                        }
                    }
                }}
                onMomentumScrollEnd={(e) => {
                    const currentIndex = swiperRef.current?.state.index || 0;
                    const lastIndex = slides.length - 1;

                    // Kullanıcının ne kadar kaydırdığını hesapla
                    const offsetX = e.nativeEvent.contentOffset?.x || 0;
                    const layoutWidth = e.nativeEvent.layoutMeasurement?.width || 0;

                    // Son slayttayken sağa doğru ekstra kaydırma var mı?
                    if (currentIndex === lastIndex && offsetX > (lastIndex * layoutWidth + 20)) {
                        goToLogin();
                    }
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

                <View style={styles.indicatorContainer}>
                    {OnboardingContent.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                activeIndex === index ? styles.activeIndicator : {}
                            ]}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={() => goToNextSlide(swiperRef.current?.state.index || 0)}
                >
                    <Text style={styles.nextButtonText}>
                        {isLastSlide(activeIndex) ? "Başla" : "İlerle"}
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
        backgroundColor: '#ffffff',
    },
    slide: {
        flex: 1,
        width,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradientBg: {
        position: 'absolute',
        width: width,
        height: height * 0.6,
        top: 0,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    slideContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingTop: height * 0.05,
        paddingBottom: height * 0.15,
    },
    iconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    textContainer: {
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 25,
        borderRadius: 20,
        width: '100%',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#253237',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 10,
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
        paddingVertical: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
    },
    pagination: {
        display: 'none',
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 4,
    },
    activeIndicator: {
        width: 24,
        backgroundColor: '#FF6B00',
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
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
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