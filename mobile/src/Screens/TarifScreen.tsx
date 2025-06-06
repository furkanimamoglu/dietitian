import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, Image, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import Header from '../Components/Header';
import BottomNavbar from '../Components/BottomNavbar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import config from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PLACEHOLDER_IMAGE = require('../../public/placeholder.png');

const Tarif = ({navigation}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [activeRecipe, setActiveRecipe] = useState(null);
    const [myRecipes, setMyRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMyRecipes = async () => {
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem('token');

                if (!token) {
                    console.error('Token bulunamadı');
                    setError('Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.');
                    setLoading(false);
                    navigation.replace('Login');
                    return;
                }

                const response = await fetch(`${config[config.environment].apiUrl}/client/getMyRecipes`, {
                    method: 'GET',
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Tarifler yüklenirken bir hata oluştu.');
                }

                const data = await response.json();
                setMyRecipes(data);
                setLoading(false);
            } catch (err) {
                console.error('Tarif yükleme hatası:', err);
                setError('Tarifler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
                setLoading(false);
            }
        };

        fetchMyRecipes();
    }, []);

    const formatRecipes = () => {
        if (!myRecipes || myRecipes.length === 0) return [];

        return myRecipes.map(item => {
            const recipe = item.Recipe;

            const ingredients = recipe.malzemeler ? recipe.malzemeler.split(',').map(item => item.trim()) : [];

            const steps = recipe.hazirlanis ? recipe.hazirlanis.split('.').filter(step => step.trim() !== '').map(step => step.trim()) : [];

            return {
                id: recipe.id,
                name: recipe.name,
                category: recipe.category?.name || 'Kişisel Tarif',
                calories: recipe.kcal || 0,
                prepTime: '- dk',
                description: recipe.description || 'Açıklama bulunmuyor',
                ingredients: ingredients,
                steps: steps,
                nutritionInfo: {
                    protein: recipe.protein || 0,
                    carbs: recipe.karbonhidrat || 0,
                    fat: recipe.yag || 0
                },
                note: item.note
            };
        });
    };

    const formattedRecipes = formatRecipes();

    const allCategories = ['Tümü', ...new Set(formattedRecipes.map(recipe => recipe.category))];

    const filteredRecipes = formattedRecipes.filter(recipe => {
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
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#fc9e21" />
                        <Text style={styles.loadingText}>Tarifler yükleniyor...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Icon name="alert-circle-outline" size={60} color="#ff6b6b" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : !activeRecipe ? (
                    <>
                        <Text style={styles.pageTitle}>Tariflerim</Text>

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
                        {allCategories.length > 1 && (
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
                        )}

                        {/* Tarif kartları */}
                        {filteredRecipes.length > 0 ? (
                            <View style={styles.recipeGrid}>
                                {filteredRecipes.map((recipe) => (
                                    <TouchableOpacity
                                        key={recipe.id}
                                        style={styles.recipeCard}
                                        onPress={() => handleRecipePress(recipe)}
                                    >
                                        {recipe.image ? (
                                            <Image
                                                source={{ uri: recipe.image }}
                                                style={styles.recipeImage}
                                                defaultSource={PLACEHOLDER_IMAGE}
                                            />
                                        ) : (
                                            <Image
                                                source={PLACEHOLDER_IMAGE}
                                                style={styles.recipeImage}
                                            />
                                        )}
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

                                            {recipe.note && (
                                                <View style={styles.noteContainer}>
                                                    <Icon name="note-text-outline" size={14} color="#666" />
                                                    <Text style={styles.noteText}>Diyetisyen Notu: {recipe.note}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Icon name="food-variant-off" size={60} color="#ccc" />
                                <Text style={styles.emptyStateText}>
                                    {myRecipes.length === 0
                                        ? "Size atanan tarif bulunmamaktadır"
                                        : "Arama kriterlerinize uygun tarif bulunamadı"}
                                </Text>
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

                        {activeRecipe.image ? (
                            <Image
                                source={{ uri: activeRecipe.image }}
                                style={styles.recipeDetailImage}
                                defaultSource={PLACEHOLDER_IMAGE}
                            />
                        ) : (
                            <Image
                                source={PLACEHOLDER_IMAGE}
                                style={styles.recipeDetailImage}
                            />
                        )}

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

                            {/* Besin değerleri */}
                            <View style={styles.nutritionContainer}>
                                <View style={styles.nutritionItem}>
                                    <Text style={styles.nutritionLabel}>Protein</Text>
                                    <Text style={styles.nutritionValue}>{activeRecipe.nutritionInfo?.protein || 0}g</Text>
                                </View>
                                <View style={styles.nutritionItem}>
                                    <Text style={styles.nutritionLabel}>Karbonhidrat</Text>
                                    <Text style={styles.nutritionValue}>{activeRecipe.nutritionInfo?.carbs || 0}g</Text>
                                </View>
                                <View style={styles.nutritionItem}>
                                    <Text style={styles.nutritionLabel}>Yağ</Text>
                                    <Text style={styles.nutritionValue}>{activeRecipe.nutritionInfo?.fat || 0}g</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.recipeSection}>
                            <Text style={styles.recipeDetailDescription}>
                                {activeRecipe.description}
                            </Text>
                        </View>

                        {activeRecipe.note && (
                            <View style={styles.recipeSection}>
                                <Text style={styles.recipeSectionTitle}>Diyetisyen Notu</Text>
                                <View style={styles.noteBox}>
                                    <Text style={styles.noteBoxText}>{activeRecipe.note}</Text>
                                </View>
                            </View>
                        )}

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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: '#ff6b6b',
        textAlign: 'center',
    },
    noteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 8,
        marginTop: 8,
    },
    noteText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#666',
    },
    nutritionContainer: {
        flexDirection: 'row',
        marginTop: 12,
    },
    nutritionItem: {
        flex: 1,
        alignItems: 'center',
    },
    nutritionLabel: {
        fontSize: 12,
        color: '#888',
    },
    nutritionValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    noteBox: {
        backgroundColor: '#f0f8ff',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#bcd4e6',
    },
    noteBoxText: {
        fontSize: 14,
        color: '#333',
    },
});

export default Tarif;
