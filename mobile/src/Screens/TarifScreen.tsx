import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Text, Image, TouchableOpacity, TextInput } from 'react-native';
import Header from '../Components/Header';
import BottomNavbar from '../Components/BottomNavbar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Mock tarif data
const mockRecipes = [
  {
    id: 1,
    name: 'Avokado ve Kinoa Salatası',
    category: 'Salata',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    calories: 320,
    prepTime: '15 dk',
    description: 'Protein açısından zengin, sağlıklı yağlar içeren lezzetli bir salata. Öğle yemeği için ideal bir seçim.',
    ingredients: [
      '1 adet olgun avokado',
      '1 su bardağı pişmiş kinoa',
      '1/2 kırmızı soğan (ince doğranmış)',
      '1 avuç taze fesleğen yaprakları',
      '1 limon suyu',
      '2 yemek kaşığı zeytinyağı',
      'Tuz ve karabiber'
    ],
    steps: [
      'Kinoayı tarife göre haşlayın ve soğumaya bırakın.',
      'Avokadoyu küp küp doğrayın.',
      'Bütün malzemeleri bir kaseye alıp karıştırın.',
      'Üzerine zeytinyağı ve limon suyunu ekleyip servis edin.'
    ]
  },
  {
    id: 2,
    name: 'Fırında Baharatlı Somon',
    category: 'Ana Yemek',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    calories: 450,
    prepTime: '25 dk',
    description: 'Omega-3 bakımından zengin, akşam yemeği için ideal bir somon tarifi. Yanında yeşil salata ile servis edebilirsiniz.',
    ingredients: [
      '2 adet somon fileto',
      '2 diş sarımsak (ezilmiş)',
      '1 limon suyu',
      '1 tatlı kaşığı kekik',
      '1 tatlı kaşığı pul biber',
      '3 yemek kaşığı zeytinyağı',
      'Tuz ve karabiber'
    ],
    steps: [
      'Fırını 180 dereceye ısıtın.',
      'Somonu yağlı kağıt üzerine yerleştirin.',
      'Üzerine baharatları ve limon suyunu ekleyin.',
      'Yaklaşık 20 dakika pişirin ve sıcak servis edin.'
    ]
  },
  {
    id: 3,
    name: 'Yulaf ve Meyve Karışımı',
    category: 'Kahvaltı',
    image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    calories: 280,
    prepTime: '5 dk',
    description: 'Güne sağlıklı başlamanızı sağlayacak, lif bakımından zengin bir kahvaltı.',
    ingredients: [
      '1/2 su bardağı yulaf ezmesi',
      '1 su bardağı süt veya badem sütü',
      '1 tatlı kaşığı bal',
      '1/2 muz',
      'Bir avuç çilek',
      'Bir avuç yaban mersini',
      '1 tatlı kaşığı chia tohumu'
    ],
    steps: [
      'Yulaf ve sütü bir kaseye alın.',
      'Üzerine meyveleri ve bal ekleyin.',
      'Chia tohumlarını serpip karıştırın.'
    ]
  },
  {
    id: 4,
    name: 'Mercimek Çorbası',
    category: 'Çorba',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    calories: 220,
    prepTime: '35 dk',
    description: 'Protein açısından zengin, tok tutan lezzetli bir çorba. Kış aylarında bağışıklık sistemi için ideal.',
    ingredients: [
      '1 su bardağı kırmızı mercimek',
      '1 adet soğan (doğranmış)',
      '2 diş sarımsak',
      '1 adet havuç',
      '1 yemek kaşığı domates salçası',
      '2 yemek kaşığı zeytinyağı',
      'Tuz, karabiber ve pul biber'
    ],
    steps: [
      'Soğan ve sarımsağı zeytinyağında kavurun.',
      'Havucu ekleyip 2-3 dakika pişirin.',
      'Yıkanmış mercimeği ve salçayı ekleyin.',
      'Üzerine su ekleyip yaklaşık 30 dakika pişirin.',
      'Blenderdan geçirip, baharatlarını ekleyin.'
    ]
  },
  {
    id: 5,
    name: 'Fırında Sebze Karışımı',
    category: 'Vegan',
    image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    calories: 180,
    prepTime: '40 dk',
    description: 'Vitamin deposu sebze karışımı. Ara öğünlerde yanında yoğurt ile tüketilebilir.',
    ingredients: [
      '1 adet patlıcan',
      '2 adet kabak',
      '1 adet kırmızı biber',
      '1 adet sarı biber',
      '1 adet soğan',
      '3 yemek kaşığı zeytinyağı',
      'Kekik, tuz, karabiber'
    ],
    steps: [
      'Fırını 200 dereceye ısıtın.',
      'Sebzeleri büyük parçalar halinde doğrayın.',
      'Zeytinyağı ve baharatlarla harmanlayın.',
      'Fırın tepsisine yerleştirip yaklaşık 30-35 dakika pişirin.',
      'Ara sıra karıştırarak tüm sebzelerin eşit pişmesini sağlayın.'
    ]
  }
];

const Tarif = ({navigation}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [activeRecipe, setActiveRecipe] = useState(null);

    // Tüm tarif kategorilerini al
    const allCategories = ['Tümü', ...new Set(mockRecipes.map(recipe => recipe.category))];

    // Tarif arama ve filtreleme
    const filteredRecipes = mockRecipes.filter(recipe => {
        const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Tümü' || recipe.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleRecipePress = (recipe) => {
        setActiveRecipe(recipe);
    };

    const handleBack = () => {
        setActiveRecipe(null);
    };

    return (
        <View style={styles.container}>
            <Header navigation={navigation}/>

            <ScrollView style={styles.content}>
                {!activeRecipe ? (
                    <>
                        <Text style={styles.pageTitle}>Tarifler</Text>

                        {/* Arama çubuğu */}
                        <View style={styles.searchBar}>
                            <Icon name="magnify" size={20} color="#666" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Tarif ara..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        {/* Kategori filtreleme */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.categoriesContainer}
                        >
                            {allCategories.map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    style={[
                                        styles.categoryButton,
                                        selectedCategory === category && styles.categoryButtonActive
                                    ]}
                                    onPress={() => setSelectedCategory(category)}
                                >
                                    <Text
                                        style={[
                                            styles.categoryText,
                                            selectedCategory === category && styles.categoryTextActive
                                        ]}
                                    >
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Tarif kartları */}
                        {filteredRecipes.length > 0 ? (
                            <View style={styles.recipeGrid}>
                                {filteredRecipes.map((recipe) => (
                                    <TouchableOpacity
                                        key={recipe.id}
                                        style={styles.recipeCard}
                                        onPress={() => handleRecipePress(recipe)}
                                    >
                                        <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
                                        <View style={styles.recipeInfo}>
                                            <View style={styles.recipeBadge}>
                                                <Text style={styles.recipeBadgeText}>{recipe.category}</Text>
                                            </View>
                                            <Text style={styles.recipeName}>{recipe.name}</Text>
                                            <View style={styles.recipeDetails}>
                                                <View style={styles.recipeDetail}>
                                                    <Icon name="fire" size={16} color="#fc9e21" />
                                                    <Text style={styles.recipeDetailText}>{recipe.calories} kcal</Text>
                                                </View>
                                                <View style={styles.recipeDetail}>
                                                    <Icon name="clock-outline" size={16} color="#fc9e21" />
                                                    <Text style={styles.recipeDetailText}>{recipe.prepTime}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Icon name="food-variant-off" size={60} color="#ccc" />
                                <Text style={styles.emptyStateText}>Tarif bulunamadı</Text>
                            </View>
                        )}
                    </>
                ) : (
                    // Tarif detay sayfası
                    <View style={styles.recipeDetailContainer}>
                        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                            <Icon name="arrow-left" size={24} color="#fc9e21" />
                            <Text style={styles.backButtonText}>Tariflere Dön</Text>
                        </TouchableOpacity>

                        <Image source={{ uri: activeRecipe.image }} style={styles.recipeDetailImage} />

                        <View style={styles.recipeDetailHeader}>
                            <View style={styles.recipeBadge}>
                                <Text style={styles.recipeBadgeText}>{activeRecipe.category}</Text>
                            </View>
                            <Text style={styles.recipeDetailName}>{activeRecipe.name}</Text>

                            <View style={styles.recipeDetailInfo}>
                                <View style={styles.recipeDetail}>
                                    <Icon name="fire" size={18} color="#fc9e21" />
                                    <Text style={styles.recipeDetailInfoText}>{activeRecipe.calories} kcal</Text>
                                </View>
                                <View style={styles.recipeDetail}>
                                    <Icon name="clock-outline" size={18} color="#fc9e21" />
                                    <Text style={styles.recipeDetailInfoText}>{activeRecipe.prepTime}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.recipeSection}>
                            <Text style={styles.recipeDetailDescription}>
                                {activeRecipe.description}
                            </Text>
                        </View>

                        <View style={styles.recipeSection}>
                            <Text style={styles.recipeSectionTitle}>Malzemeler</Text>
                            <View style={styles.ingredientsList}>
                                {activeRecipe.ingredients.map((ingredient, index) => (
                                    <View key={index} style={styles.ingredient}>
                                        <Icon name="circle-small" size={20} color="#fc9e21" />
                                        <Text style={styles.ingredientText}>{ingredient}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={styles.recipeSection}>
                            <Text style={styles.recipeSectionTitle}>Hazırlanışı</Text>
                            <View style={styles.stepsList}>
                                {activeRecipe.steps.map((step, index) => (
                                    <View key={index} style={styles.step}>
                                        <View style={styles.stepNumber}>
                                            <Text style={styles.stepNumberText}>{index + 1}</Text>
                                        </View>
                                        <Text style={styles.stepText}>{step}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            <BottomNavbar navigation={navigation}/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#f8f9fa'},
    content: {flex: 1, padding: 16},
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 16,
        height: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
    },
    searchInput: {
        flex: 1,
        paddingLeft: 8,
        fontSize: 15,
        color: '#333',
    },
    categoriesContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 50,
        backgroundColor: '#f0f0f0',
        marginRight: 8,
    },
    categoryButtonActive: {
        backgroundColor: '#fc9e21',
    },
    categoryText: {
        color: '#666',
        fontWeight: '500',
    },
    categoryTextActive: {
        color: '#ffffff',
    },
    recipeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    recipeCard: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    recipeImage: {
        width: '100%',
        height: 180,
    },
    recipeInfo: {
        padding: 12,
    },
    recipeBadge: {
        backgroundColor: '#e8f5e9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    recipeBadgeText: {
        color: '#388e3c',
        fontSize: 12,
        fontWeight: 'bold',
    },
    recipeName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    recipeDetails: {
        flexDirection: 'row',
    },
    recipeDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    recipeDetailText: {
        marginLeft: 4,
        fontSize: 13,
        color: '#666',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyStateText: {
        marginTop: 16,
        fontSize: 16,
        color: '#999',
    },
    recipeDetailContainer: {
        padding: 0,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    backButtonText: {
        marginLeft: 8,
        color: '#fc9e21',
        fontWeight: '500',
        fontSize: 16,
    },
    recipeDetailImage: {
        width: '100%',
        height: 250,
        borderRadius: 12,
    },
    recipeDetailHeader: {
        padding: 16,
    },
    recipeDetailName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginVertical: 8,
        color: '#333',
    },
    recipeDetailInfo: {
        flexDirection: 'row',
        marginTop: 8,
    },
    recipeDetailInfoText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#666',
    },
    recipeSection: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 16,
        borderRadius: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    recipeDetailDescription: {
        fontSize: 15,
        lineHeight: 22,
        color: '#555',
    },
    recipeSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    ingredientsList: {
        marginTop: 8,
    },
    ingredient: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    ingredientText: {
        fontSize: 15,
        color: '#444',
    },
    stepsList: {
        marginTop: 8,
    },
    step: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#fc9e21',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    stepNumberText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    stepText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
        color: '#444',
    },
});

export default Tarif;