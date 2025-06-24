import React, {useEffect, useState} from 'react';
import './Tarifler.css';
import Default from "../../Components/Layouts/Default.jsx";
import axios from "axios";
import config from "../../config.js";
import {showErrorToast} from '../../utils/toastUtil';
import {saveRecipe, updateRecipe} from './helpers.js';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from "@mui/icons-material/Description";
import NoteIcon from '@mui/icons-material/Note';

import {Document, Font, Page, PDFDownloadLink, StyleSheet, Text, View} from '@react-pdf/renderer';

import {
    Avatar,
    Box,
    CircularProgress,
    Divider,
    InputAdornment,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    TextField,
    Typography
} from '@mui/material';

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
        background: 'linear-gradient(135deg, #087708 0%, #0a9a0a 100%)',
        padding: 20,
        marginBottom: 20,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5
    },
    headerContent: {
        flex: 1
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 6,
        letterSpacing: 0.5
    },
    headerInfo: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    logoContainer: {
        width: 60,
        height: 60,
        backgroundColor: 'white',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    logo: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#087708',
        letterSpacing: 0.5
    },
    infoSection: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 15
    },
    infoCard: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e1e5e9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8
    },
    infoCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    infoIcon: {
        width: 20,
        height: 20,
        backgroundColor: '#087708',
        borderRadius: 10,
        marginRight: 8
    },
    infoTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#087708',
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    infoContent: {
        fontSize: 9,
        color: '#495057',
        lineHeight: 1.4,
        marginBottom: 2
    },
    recipeDetails: {
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12
    },
    recipeHeader: {
        backgroundColor: '#ff9800',
        background: 'linear-gradient(90deg, #ff9800 0%, #ffb74d 100%)',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center'
    },
    recipeHeaderIcon: {
        width: 24,
        height: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        marginRight: 10
    },
    recipeHeaderText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 0.3
    },
    recipeContent: {
        padding: 20,
        backgroundColor: '#f8f9fa'
    },
    nutritionSection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
        gap: 10
    },
    nutritionCard: {
        flex: '1 1 45%',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#ff9800',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4
    },
    nutritionLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#6c757d',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4
    },
    nutritionValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#212529'
    },
    ingredientsSection: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
        marginBottom: 15
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 2,
        borderBottomColor: '#ff9800',
        borderBottomStyle: 'solid'
    },
    sectionIcon: {
        width: 16,
        height: 16,
        backgroundColor: '#ff9800',
        borderRadius: 8,
        marginRight: 8
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#ff9800',
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    ingredientsList: {
        fontSize: 9,
        lineHeight: 1.6,
        color: '#495057'
    },
    ingredientItem: {
        flexDirection: 'row',
        marginBottom: 4
    },
    bulletPoint: {
        marginRight: 5,
        color: '#ff9800'
    },
    ingredientText: {
        flex: 1
    },
    instructionsSection: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef'
    },
    instructionStep: {
        flexDirection: 'row',
        marginBottom: 8
    },
    stepNumber: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#ff9800',
        marginRight: 8,
        minWidth: 16,
        textAlign: 'center',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        borderRadius: 10,
        paddingVertical: 2,
        paddingHorizontal: 5
    },
    stepText: {
        fontSize: 9,
        lineHeight: 1.6,
        color: '#495057',
        flex: 1
    },
    notesSection: {
        marginTop: 20,
        padding: 16,
        backgroundColor: '#fff8e1',
        borderRadius: 12,
        borderLeftWidth: 6,
        borderLeftColor: '#ff9800',
        shadowColor: '#ff9800',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8
    },
    notesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    notesIcon: {
        width: 16,
        height: 16,
        backgroundColor: '#ff9800',
        borderRadius: 8,
        marginRight: 8
    },
    notesTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#ff9800',
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    notesContent: {
        fontSize: 9,
        color: '#5d4037',
        lineHeight: 1.5,
        fontStyle: 'italic'
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
        borderTopWidth: 2,
        borderTopColor: '#e9ecef',
        borderTopStyle: 'solid'
    },
    footerLeft: {
        flex: 1
    },
    footerText: {
        fontSize: 8,
        color: '#087708',
        fontWeight: 'bold'
    },
    footerWebsite: {
        fontSize: 8,
        color: '#ff9800',
        fontWeight: 'bold',
        marginTop: 2
    },
    footerRight: {
        alignItems: 'flex-end'
    },
    footerLogo: {
        fontSize: 10,
        color: '#087708',
        fontWeight: 'bold'
    },
    badge: {
        backgroundColor: '#ff9800',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start'
    },
    badgeText: {
        color: 'white',
        fontSize: 7,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5
    }
});


const RecipeDocument = ({recipe, assignmentData, dietitianInfo}) => {
    if (!recipe) {
        return null;
    }

    const today = new Date();
    const dateStr = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`;
    const dietitianName = "Belirtilmemiş";

    const ingredientsArray = recipe.malzemeler && typeof recipe.malzemeler === 'string'
        ? recipe.malzemeler.split(',').map(item => item.trim()).filter(Boolean)
        : [];

    const instructionsArray = recipe.hazirlanis && typeof recipe.hazirlanis === 'string'
        ? recipe.hazirlanis.split(/\r?\n/)
            .filter(line => line && line.trim().length > 0)
            .map(line => line.trim())
        : [];

    return (
        <Document>
            <Page size="A4" style={pdfStyles.page}>
                {/* Enhanced Header */}
                <View style={pdfStyles.header}>
                    <View style={pdfStyles.headerContent}>
                        <Text style={pdfStyles.headerTitle}>{recipe.title}</Text>
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
                        <Text style={pdfStyles.infoContent}>{dietitianInfo.name}</Text>
                        <Text style={pdfStyles.infoContent}>{dietitianInfo.phoneNumber || "Belirtilmemiş"}</Text>
                        <Text style={pdfStyles.infoContent}>{dietitianInfo.email || "Belirtilmemiş"}</Text>
                    </View>

                    {assignmentData && (
                        <View style={pdfStyles.infoCard}>
                            <View style={pdfStyles.infoCardHeader}>
                                <View style={pdfStyles.infoIcon}></View>
                                <Text style={pdfStyles.infoTitle}>Tarif Detayları</Text>
                            </View>
                            <Text style={pdfStyles.infoContent}>👤 {assignmentData.clientName || "Belirtilmemiş"}</Text>
                            <Text style={pdfStyles.infoContent}>🗓️ Atanma: {assignmentData.assignmentDate ? new Date(assignmentData.assignmentDate).toLocaleDateString('tr-TR') : "Belirtilmemiş"}</Text>
                            <Text style={pdfStyles.infoContent}>🏷️ Kategori: {recipe.category_name || "Belirtilmemiş"}</Text>
                        </View>
                    )}
                </View>

                {/* Recipe Description */}
                {recipe.description && (
                    <View style={pdfStyles.recipeDetails}>
                        <View style={pdfStyles.recipeHeader}>
                            <View style={pdfStyles.recipeHeaderIcon}></View>
                            <Text style={pdfStyles.recipeHeaderText}>Tarif Hakkında</Text>
                        </View>
                        <View style={pdfStyles.recipeContent}>
                            <Text style={{...pdfStyles.stepText, marginBottom: 10}}>
                                {recipe.description}
                            </Text>
                </View>
                    </View>
                )}

                {/* Nutrition Information */}
                <View style={pdfStyles.recipeDetails}>
                    <View style={pdfStyles.recipeHeader}>
                        <View style={pdfStyles.recipeHeaderIcon}></View>
                        <Text style={pdfStyles.recipeHeaderText}>Besin Değerleri</Text>
                            </View>
                    <View style={pdfStyles.recipeContent}>
                        <View style={pdfStyles.nutritionSection}>
                            <View style={pdfStyles.nutritionCard}>
                                <Text style={pdfStyles.nutritionLabel}>Kalori</Text>
                                <Text style={pdfStyles.nutritionValue}>{recipe.kcal || 0} kcal</Text>
                            </View>
                            <View style={pdfStyles.nutritionCard}>
                                <Text style={pdfStyles.nutritionLabel}>Protein</Text>
                                <Text style={pdfStyles.nutritionValue}>{recipe.protein || 0} g</Text>
                            </View>
                            <View style={pdfStyles.nutritionCard}>
                                <Text style={pdfStyles.nutritionLabel}>Karbonhidrat</Text>
                                <Text style={pdfStyles.nutritionValue}>{recipe.karbonhidrat || 0} g</Text>
                                </View>
                            <View style={pdfStyles.nutritionCard}>
                                <Text style={pdfStyles.nutritionLabel}>Yağ</Text>
                                <Text style={pdfStyles.nutritionValue}>{recipe.yag || 0} g</Text>
                        </View>
                            </View>
                    </View>
                </View>

                {/* Ingredients */}
                <View style={pdfStyles.ingredientsSection}>
                    <View style={pdfStyles.sectionHeader}>
                        <View style={pdfStyles.sectionIcon}></View>
                        <Text style={pdfStyles.sectionTitle}>Malzemeler</Text>
                    </View>
                    <View style={pdfStyles.ingredientsList}>
                        {recipe.malzemeler}
                    </View>
                </View>

                {/* Instructions */}
                <View style={pdfStyles.instructionsSection}>
                    <View style={pdfStyles.sectionHeader}>
                        <View style={pdfStyles.sectionIcon}></View>
                        <Text style={pdfStyles.sectionTitle}>Hazırlanışı</Text>
                        </View>
                    <View>
                        {recipe.hazirlanis}
                    </View>
                </View>

                {/* Notes Section */}
                {assignmentData && assignmentData.note && (
                    <View style={pdfStyles.notesSection}>
                        <View style={pdfStyles.notesHeader}>
                            <View style={pdfStyles.notesIcon}></View>
                            <Text style={pdfStyles.notesTitle}>Özel Notlar</Text>
                        </View>
                        <Text style={pdfStyles.notesContent}>"{assignmentData.note}"</Text>
                    </View>
                )}

                {/* Enhanced Footer */}
                <View style={pdfStyles.footer}>
                    <View style={pdfStyles.footerLeft}>
                        <Text style={pdfStyles.footerText}>Afiyet olsun!</Text>
                        <Text style={pdfStyles.footerWebsite}>www.diyetia.com</Text>
                    </View>
                    <View style={pdfStyles.footerRight}>
                        <Text style={pdfStyles.footerLogo}>Diyetia</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

const CategoryItem = ({category, isChecked, onCheck, onDelete}) => {
    return (<div
            className={`category-item ${isChecked ? 'checked' : ''}`}
            onClick={onCheck}
        >
            <div className="category-checkbox">
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={onCheck}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
            <div className="category-title">{category.name || category.title}</div>
            <button
                className="category-delete-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(category.id);
                }}
            >
                <DeleteIcon/>
            </button>
        </div>);
};

const RecipeCard = ({item, onPrint, onEdit, onDelete, onView, onAssign, dietitianInfo}) => {
    return (<div className="recipe-card">
            <div className="card-image-container" onClick={() => onView(item)}>
                <img
                    src={item.image || "/placeholder.png"}
                    alt={item.title}
                    className="card-image"
                />
            </div>
            <div className="card-content">
                <h3 className="card-title">{item.title}</h3>
                <p className="card-description">{item.description}</p>

                {item.nutritional_info && Object.values(item.nutritional_info).some((val) => val !== null && val !== undefined && val !== '') && (
                    <div className="card-nutritional-info">
                        {item.nutritional_info.calories !== null && item.nutritional_info.calories !== undefined && item.nutritional_info.calories !== '' && (
                            <span className="nutri-badge calories">
                            {item.nutritional_info.calories} Kcal
                          </span>)}
                        {item.nutritional_info.protein !== null && item.nutritional_info.protein !== undefined && item.nutritional_info.protein !== '' && (
                            <span className="nutri-badge protein">
                            {item.nutritional_info.protein}g Protein
                          </span>)}
                        {item.nutritional_info.carbs !== null && item.nutritional_info.carbs !== undefined && item.nutritional_info.carbs !== '' && (
                            <span className="nutri-badge carbs">
                                {item.nutritional_info.carbs}g Karbonhidrat
                              </span>)}
                        {item.nutritional_info.fat !== null && item.nutritional_info.fat !== undefined && item.nutritional_info.fat !== '' && (
                                        <span className="nutri-badge fat">
                        {item.nutritional_info.fat}g Yağ
                      </span>)}
                    </div>)}


                <div className="card-actions">
                    <button
                        className="action-button add-user-btn"
                        title="Danışana Ata"
                        onClick={() => onAssign(item)}
                    >
                        <PersonAddIcon />
                    </button>
                    <PDFDownloadLink
                        document={<RecipeDocument recipe={item} assignmentData={null} dietitianInfo={dietitianInfo}/>}
                        fileName={`${item.title ? item.title.replace(/\s+/g, '_') : 'tarif'}_tarifi.pdf`}
                        style={{textDecoration: 'none'}}
                    >
                        {({blob, url, loading, error}) => (
                            <button
                                className="action-button print-btn"
                                title="Yazdır"
                                disabled={loading}
                                onClick={(e) => {
                                    if (loading) e.preventDefault();
                                    else onPrint(item);
                                }}
                            >
                                <PrintIcon/>
                            </button>
                        )}
                    </PDFDownloadLink>
                    <button
                        className="action-button edit-btn"
                        title="Düzenle"
                        onClick={() => onEdit(item)}
                    >
                        <EditIcon/>
                    </button>
                    <button
                        className="action-button delete-btn"
                        title="Sil"
                        onClick={() => onDelete(item)}
                    >
                        <DeleteIcon/>
                    </button>
                </div>
            </div>
        </div>);
};

const Modal = ({isOpen, title, onClose, children, fullWidth = false}) => {
    if (!isOpen) return null;

    return (<div className="modal-overlay">
            <div className={`modal-container ${fullWidth ? 'full-width' : ''}`}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <CloseIcon/>
                    </button>
                </div>
                <div className="modal-content">
                    {children}
                </div>
            </div>
        </div>);
};

export default function Tarifler() {
    const [categoryData, setCategoryData] = useState([]);
    const [checkedCategories, setCheckedCategories] = useState([]);
    const [danisanList, setDanisanList] = useState([]);
    const [recipeData, setRecipeData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [recipeSearchTerm, setRecipeSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const [danisanSearchTerm, setDanisanSearchTerm] = useState('');
    const [filteredDanisanList, setFilteredDanisanList] = useState([]);

    const [clientRecipesModal, setClientRecipesModal] = useState(false);
    const [selectedClientRecipes, setSelectedClientRecipes] = useState([]);
    const [loadingClientRecipes, setLoadingClientRecipes] = useState(false);
    const [selectedClientInfo, setSelectedClientInfo] = useState(null);

    const [addToUserModal, setAddToUserModal] = useState(false);
    const [detailModal, setDetailModal] = useState(false);
    const [addCategoryModal, setAddCategoryModal] = useState(false);
    const [addRecipeModal, setAddRecipeModal] = useState(false);
    const [editRecipeModal, setEditRecipeModal] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [detailItem, setDetailItem] = useState(null);
    const [newCategoryTitle, setNewCategoryTitle] = useState('');
    const [assignmentNote, setAssignmentNote] = useState('');

    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editIngredients, setEditIngredients] = useState('');
    const [editInstructions, setEditInstructions] = useState('');
    const [editCategoryId, setEditCategoryId] = useState('');
    const [editImage, setEditImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [editNutritionalInfo, setEditNutritionalInfo] = useState({
        calories: '', protein: '', carbs: '', fat: ''
    });

    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [newRecipe, setNewRecipe] = useState({
        title: '',
        description: '',
        ingredients: '',
        instructions: '',
        category_id: '',
        image: null,
        nutritional_info: {
            calories: '', protein: '', carbs: '', fat: ''
        }
    });

    const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteCategoryConfirmModal, setDeleteCategoryConfirmModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [deleteMultiCategoriesConfirmModal, setDeleteMultiCategoriesConfirmModal] = useState(false);
    const [affectedRecipes, setAffectedRecipes] = useState([]);

    const [dietitianInfo, setDietitianInfo] = useState({});

    useEffect(() => {
        axios
            .get(`${config[config.environment].apiUrl}/dietitian/getDietitianInfo`, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            })
            .then((response) => {
                console.log("Dietitian Info:", response.data);
                setDietitianInfo(response.data);
            })
            .catch((error) => {
                console.error("Error fetching clients:", error);
            });
    }, []);


    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (showSuccessPopup) {
            const timer = setTimeout(() => {
                setShowSuccessPopup(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [showSuccessPopup]);

    useEffect(() => {
        if (showErrorPopup) {
            const timer = setTimeout(() => {
                setShowErrorPopup(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [showErrorPopup]);

    useEffect(() => {
        axios
            .get(`${config[config.environment].apiUrl}/dietitian/getAllMyClients`, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            })
            .then((response) => {
                setDanisanList(response.data);
            })
            .catch((error) => {
                console.error("Error fetching clients:", error);
            });
    }, []);

    useEffect(() => {
        axios
            .get(`${config[config.environment].apiUrl}/recipe/getMyRecipeCategories`, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            })
            .then((response) => {
                setCategoryData(response.data);
            })
            .catch((error) => {
                console.error("Error fetching categories:", error);
                showErrorToast("Kategoriler yüklenirken bir hata oluştu.");
            });
    }, []);

    const fetchRecipes = () => {
        setLoading(true);
        axios
            .get(`${config[config.environment].apiUrl}/recipe/getMyRecipes`, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            })
            .then((response) => {
                const mappedRecipes = response.data.map(recipe => ({
                    id: recipe.id,
                    title: recipe.name,
                    description: recipe.description || "",
                    category_id: recipe.category_id,
                    image: recipe.image || "/placeholder.png",
                    ingredients: recipe.malzemeler,
                    instructions: recipe.hazirlanis,
                    nutritional_info: {
                        calories: recipe.kcal, protein: recipe.protein, carbs: recipe.karbonhidrat, fat: recipe.yag
                    }
                }));
                setRecipeData(mappedRecipes);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching recipes:", error);
                showErrorToast("Tarifler yüklenirken bir hata oluştu.");
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchRecipes();
    }, []);

    const filteredCategories = categoryData?.filter(category => (category?.name || category?.title || "").toLowerCase().includes(searchTerm.toLowerCase()));

    const filteredRecipeData = recipeData.filter(item => {
        const passesCategory = checkedCategories.length === 0 || checkedCategories.includes(item.category_id);

        const passesSearch = !recipeSearchTerm ||
            item.title.toLowerCase().includes(recipeSearchTerm.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(recipeSearchTerm.toLowerCase())) ||
            (item.ingredients && item.ingredients.toLowerCase().includes(recipeSearchTerm.toLowerCase()));

        return passesCategory && passesSearch;
    });

    const handleCategoryCheck = (categoryId) => {
        setCheckedCategories(prev => prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]);
    };

    const handleOpenMultiDeleteConfirm = () => {
        if (checkedCategories.length === 0) return;

        const recipesToDelete = recipeData.filter(recipe => checkedCategories.includes(recipe.category_id));

        setAffectedRecipes(recipesToDelete);
        setDeleteMultiCategoriesConfirmModal(true);
    };

    const handleOpenCategoryDeleteConfirm = (categoryId) => {
        const category = categoryData.find(cat => cat.id === categoryId);
        if (!category) return;

        const recipesToDelete = recipeData.filter(recipe => recipe.category_id === categoryId);

        setCategoryToDelete(category);
        setAffectedRecipes(recipesToDelete);
        setDeleteCategoryConfirmModal(true);
    };

    const handleOpenDetailModal = (item) => {
        setDetailItem(item);
        setDetailModal(true);
    };

    const handleOpenAddToUserModal = (item) => {
        setSelectedRecipe(item);
        setAssignmentNote('');
        setSelectedUser(null);
        setAddToUserModal(true);
    };

    const handlePrint = (item) => {
    };

    const handleEdit = (item) => {
        setSelectedRecipe(item);

        setEditTitle(item.title || '');
        setEditDescription(item.description || '');
        setEditIngredients(item.ingredients || '');
        setEditInstructions(item.instructions || '');
        setEditCategoryId(item.category_id || '');
        setEditImage(item.image || '');

        const nutritionalInfo = item.nutritional_info || {};
        setEditNutritionalInfo({
            calories: nutritionalInfo.calories || '',
            protein: nutritionalInfo.protein || '',
            carbs: nutritionalInfo.carbs || '',
            fat: nutritionalInfo.fat || ''
        });

        setEditRecipeModal(true);
    };

    const handleViewRecipe = (item) => {
        handleOpenDetailModal(item);
    };

    const handleOpenDeleteConfirm = (item) => {
        setItemToDelete(item);
        setDeleteConfirmModal(true);
    };

    useEffect(() => {
        if (danisanList.length > 0) {
            setFilteredDanisanList(
                danisanList.filter(danisan =>
                    danisan.name.toLowerCase().includes(danisanSearchTerm.toLowerCase())
                )
            );
        }
    }, [danisanList, danisanSearchTerm]);

    const getClientRecipes = (clientId) => {
        const danisan = danisanList.find(d => d.id === clientId);
        setSelectedClientInfo(danisan);
        setLoadingClientRecipes(true);

        axios.get(`${config[config.environment].apiUrl}/recipe/getAssignedRecipesByClient?client_id=${clientId}`, {
            headers: {Authorization: localStorage.getItem("token")}
        })
            .then(response => {
                setSelectedClientRecipes(response.data || []);
                setLoadingClientRecipes(false);
                setClientRecipesModal(true);
            })
            .catch(error => {
                console.error("Error fetching client recipes:", error);
                setLoadingClientRecipes(false);
                setErrorMessage("Danışan tarifleri yüklenirken bir hata oluştu.");
                setShowErrorPopup(true);
            });
    }

    return (<Default>
            <div className="tarifler-container">
                {/* Left Panel - Categories */}
                <div className="categories-panel">
                    <div className="panel-header">
                        <div className="search-container">
                            <SearchIcon className="search-icon"/>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="category-actions">
                            <button
                                className="action-btn add-plan-btn"
                                title="Tarif Ekle"
                                onClick={() => {
                                    setImagePreview('');
                                    setAddRecipeModal(true);
                                }}
                                disabled={categoryData.length === 0}
                            >
                                <AddIcon/>
                                <span className="btn-text">Tarif</span>
                            </button>
                            <button
                                className="action-btn add-btn"
                                title="Kategori Ekle"
                                onClick={() => setAddCategoryModal(true)}
                            >
                                <AddIcon/>
                                <span className="btn-text">Kategori</span>
                            </button>
                            <button
                                className="action-btn delete-btn"
                                title="Seçilenleri Sil"
                                onClick={handleOpenMultiDeleteConfirm}
                                disabled={checkedCategories.length === 0}
                            >
                                <DeleteIcon/>
                            </button>
                        </div>
                    </div>

                    <div className="categories-list">
                        {filteredCategories && filteredCategories.length > 0 ? (filteredCategories.map((category) => (
                                <CategoryItem
                                    key={category.id}
                                    category={category}
                                    isChecked={checkedCategories.includes(category.id)}
                                    onCheck={() => handleCategoryCheck(category.id)}
                                    onDelete={handleOpenCategoryDeleteConfirm}
                                />))) : (<div className="no-categories">Kategori bulunamadı.</div>)}
                    </div>
                </div>

                {/* Middle Panel - Recipe Cards */}
                <div className="recipes-panel">
                    {/* Arama çubuğu */}
                    <div className="recipe-search-container enhanced-search" style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff' }}>
                        <div className="search-box enhanced-search-box">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Tariflerde ara..."
                                value={recipeSearchTerm}
                                onChange={(e) => setRecipeSearchTerm(e.target.value)}
                            />
                            {recipeSearchTerm && (
                                <button
                                    className="clear-search-btn"
                                    onClick={() => setRecipeSearchTerm('')}
                                    tabIndex={-1}
                                >
                                    <CloseIcon fontSize="small" />
                                </button>
                            )}
                        </div>
                        <div className="search-divider" />
                        {filteredRecipeData.length > 0 && (
                            <div className="recipe-count enhanced-recipe-count">
                                <span>{filteredRecipeData.length}</span> tarif gösteriliyor.
                            </div>
                        )}
                    </div>
                    <div className="recipe-cards-grid">
                        {loading ? (<div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p>Tarifler yükleniyor...</p>
                            </div>) : filteredRecipeData.length > 0 ? (filteredRecipeData.map((item) => (<RecipeCard
                                    key={item.id}
                                    item={item}
                                    onPrint={handlePrint}
                                    onEdit={handleEdit}
                                    onDelete={handleOpenDeleteConfirm}
                                    onView={handleViewRecipe}
                                    onAssign={handleOpenAddToUserModal}
                                    dietitianInfo={dietitianInfo}
                                />))) : (<div className="no-recipes">
                                <p>Bu kategoriye ait tarif bulunamadı.</p>
                            </div>)}
                    </div>
                </div>

                {/* Right Panel - Sidebar */}
                <Paper
                    elevation={3}
                    sx={{
                        flex: '0 0 260px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        height: 'calc(76vh)',
                        maxHeight: 'calc(100vh - 100px)'
                    }}
                    className="right-sidebar-panel"
                >
                    <Box sx={{padding: '16px 0', color: 'white', backgroundColor: '#2d4149'}}>
                        <Typography variant="h6" sx={{
                            textAlign: 'center',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <PersonIcon sx={{mr: 1}}/> Tarif Yönetimi
                        </Typography>
                    </Box>

                    <Box sx={{padding: '16px'}}>
                        <TextField
                            variant="outlined"
                            placeholder="Danışan ara..."
                            value={danisanSearchTerm}
                            onChange={(e) => setDanisanSearchTerm(e.target.value)}
                            size="small"
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{color: "rgba(0, 0, 0, 0.54)"}}/>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{mb: 2}}
                        />

                        {loading ? (
                            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3}}>
                                <CircularProgress size={28} sx={{mb: 2}}/>
                                <Typography variant="body2" color="text.primary">
                                    Danışanlar yükleniyor...
                                </Typography>
                            </Box>
                        ) : (
                            <List
                                sx={{
                                    width: '100%',
                                    maxHeight: 'calc(100vh - 200px)',
                                    overflowY: 'auto',
                                    '&::-webkit-scrollbar': {
                                        width: '6px',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: 'rgba(0,0,0,0.2)',
                                        borderRadius: '3px'
                                    }
                                }}
                                dense
                            >
                                {filteredDanisanList.length > 0 ? (
                                    filteredDanisanList.map((danisan) => (
                                        <React.Fragment key={danisan.id}>
                                            <ListItem
                                                component="div"
                                                onClick={() => getClientRecipes(danisan.id)}
                                                sx={{
                                                    borderRadius: '8px',
                                                    my: 0.5,
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(25, 118, 210, 0.08)'
                                                    }
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: danisan.profilePhoto ? 'transparent' : '#087708',
                                                            width: 40,
                                                            height: 40
                                                        }}
                                                        src={danisan.profilePhoto || ''}
                                                    >
                                                        {!danisan.profilePhoto && danisan.name.charAt(0)}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={danisan.name}
                                                    primaryTypographyProps={{fontWeight: 'medium'}}
                                                />
                                            </ListItem>
                                            <Divider variant="inset" component="li"/>
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        py: 4
                                    }}>
                                        <PersonIcon sx={{fontSize: 40, color: 'text.disabled', mb: 1}}/>
                                        <Typography variant="body2" color="text.secondary" align="center">
                                            Danışan bulunamadı.
                                        </Typography>
                                    </Box>
                                )}
                            </List>
                        )}
                    </Box>
                </Paper>
            </div>

            {/* Detail Modal */}
            <Modal
                isOpen={detailModal}
                title={detailItem?.title}
                onClose={() => setDetailModal(false)}
            >
                <div className="recipe-detail-modal">
                    {detailItem?.image && (<img
                            src={detailItem.image}
                            alt={detailItem.title}
                            className="recipe-detail-image"
                        />)}

                    <div className="recipe-detail-content">
                        {detailItem?.description && (<p className="recipe-description">{detailItem.description}</p>)}

                        {detailItem?.nutritional_info && (
                            <div className="recipe-detail-section nutritional-info-section">
                                <h3>Besin Değerleri</h3>
                                <div className="nutritional-info-grid">
                                    {detailItem.nutritional_info.calories && (<div className="nutritional-info-item">
                                            <span className="info-label">Kalori:</span>
                                            <span
                                                className="info-value">{detailItem.nutritional_info.calories} kcal</span>
                                        </div>)}
                                    {detailItem.nutritional_info.protein && (<div className="nutritional-info-item">
                                            <span className="info-label">Protein:</span>
                                            <span className="info-value">{detailItem.nutritional_info.protein} g</span>
                                        </div>)}
                                    {detailItem.nutritional_info.carbs && (<div className="nutritional-info-item">
                                            <span className="info-label">Karbonhidrat:</span>
                                            <span className="info-value">{detailItem.nutritional_info.carbs} g</span>
                                        </div>)}
                                    {detailItem.nutritional_info.fat && (<div className="nutritional-info-item">
                                            <span className="info-label">Yağ:</span>
                                            <span className="info-value">{detailItem.nutritional_info.fat} g</span>
                                        </div>)}
                                </div>
                            </div>)}

                        <div className="recipe-detail-section">
                            <h3>Malzemeler</h3>
                            <ul className="recipe-ingredients-list">
                                {detailItem?.ingredients?.split(',').map((ingredient, index) => (
                                    <li key={index}>{ingredient.trim()}</li>))}
                            </ul>
                        </div>

                        <div className="recipe-detail-section">
                            <h3>Hazırlanışı</h3>
                            <p className="recipe-instructions">{detailItem?.instructions}</p>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button
                        className="modal-btn close-btn"
                        onClick={() => setDetailModal(false)}
                    >
                        Kapat
                    </button>
                    <button
                        className="modal-btn confirm-btn"
                        onClick={() => handlePrint(detailItem)}
                    >
                        <PrintIcon style={{marginRight: '5px'}}/> PDF Oluştur
                    </button>
                </div>
            </Modal>

            {/* Add Recipe Modal */}
            <Modal
                isOpen={addRecipeModal}
                title="Tarif Ekle"
                onClose={() => setAddRecipeModal(false)}
            >
                <div className="modal-body styled-form">
                    <div className="input-container">
                        <label htmlFor="recipeTitle">Tarif Adı *</label>
                        <input
                            type="text"
                            id="recipeTitle"
                            className="text-input"
                            value={newRecipe.title}
                            onChange={(e) => setNewRecipe({...newRecipe, title: e.target.value})}
                            placeholder="Tarif adını giriniz"
                            required
                        />
                    </div>
                    <div className="input-container">
                        <label htmlFor="recipeDescription">Kısa Açıklama</label>
                        <textarea
                            id="recipeDescription"
                            className="text-input textarea"
                            value={newRecipe.description}
                            onChange={(e) => setNewRecipe({...newRecipe, description: e.target.value})}
                            placeholder="Tarif hakkında kısa açıklama giriniz"
                            rows={2}
                        />
                    </div>
                    <div className="input-container">
                        <label htmlFor="recipeImage">Tarif Resmi</label>
                        <input
                            type="file"
                            id="recipeImage"
                            className="text-input"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setNewRecipe({...newRecipe, image: file});
                                        setImagePreview(reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        <label htmlFor="recipeImage" className={`file-upload-label ${imagePreview ? 'has-file' : ''}`}>
                            <span className="file-upload-icon">📷</span>
                            {imagePreview ? 'Resim seçildi - Değiştirmek için tıklayın' : 'Resim seçmek için tıklayın'}
                        </label>
                        {imagePreview && (
                            <div className="image-preview-container">
                                <img src={imagePreview} alt="Tarif önizleme" className="image-preview" />
                                <button
                                    type="button"
                                    className="remove-image-btn"
                                    onClick={() => {
                                        setNewRecipe({...newRecipe, image: null});
                                        setImagePreview('');
                                        document.getElementById('recipeImage').value = '';
                                    }}
                                >
                                    ✖
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="nutritional-info-container">
                        <h3 className="form-section-title">Besin Değerleri</h3>
                        <div className="nutritional-info-grid-form">
                            <div className="input-container half-width">
                                <label htmlFor="recipeCalories">Kalori (kcal)</label>
                                <input
                                    type="number"
                                    id="recipeCalories"
                                    className="text-input"
                                    value={newRecipe.nutritional_info.calories}
                                    onChange={(e) => setNewRecipe({
                                        ...newRecipe, nutritional_info: {
                                            ...newRecipe.nutritional_info, calories: e.target.value
                                        }
                                    })}
                                    placeholder="Örn: 250"
                                />
                            </div>
                            <div className="input-container half-width">
                                <label htmlFor="recipeProtein">Protein (g)</label>
                                <input
                                    type="number"
                                    id="recipeProtein"
                                    className="text-input"
                                    value={newRecipe.nutritional_info.protein}
                                    onChange={(e) => setNewRecipe({
                                        ...newRecipe, nutritional_info: {
                                            ...newRecipe.nutritional_info, protein: e.target.value
                                        }
                                    })}
                                    placeholder="Örn: 15"
                                />
                            </div>
                            <div className="input-container half-width">
                                <label htmlFor="recipeCarbs">Karbonhidrat (g)</label>
                                <input
                                    type="number"
                                    id="recipeCarbs"
                                    className="text-input"
                                    value={newRecipe.nutritional_info.carbs}
                                    onChange={(e) => setNewRecipe({
                                        ...newRecipe, nutritional_info: {
                                            ...newRecipe.nutritional_info, carbs: e.target.value
                                        }
                                    })}
                                    placeholder="Örn: 30"
                                />
                            </div>
                            <div className="input-container half-width">
                                <label htmlFor="recipeFat">Yağ (g)</label>
                                <input
                                    type="number"
                                    id="recipeFat"
                                    className="text-input"
                                    value={newRecipe.nutritional_info.fat}
                                    onChange={(e) => setNewRecipe({
                                        ...newRecipe, nutritional_info: {
                                            ...newRecipe.nutritional_info, fat: e.target.value
                                        }
                                    })}
                                    placeholder="Örn: 10"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="input-container">
                        <label htmlFor="recipeIngredients">Malzemeler *</label>
                        <textarea
                            id="recipeIngredients"
                            className="text-input textarea"
                            value={newRecipe.ingredients}
                            onChange={(e) => setNewRecipe({...newRecipe, ingredients: e.target.value})}
                            placeholder="Malzemeleri virgülle ayırarak giriniz"
                            rows={4}
                            required
                        />
                    </div>
                    <div className="input-container">
                        <label htmlFor="recipeInstructions">Hazırlanışı *</label>
                        <textarea
                            id="recipeInstructions"
                            className="text-input textarea"
                            value={newRecipe.instructions}
                            onChange={(e) => setNewRecipe({...newRecipe, instructions: e.target.value})}
                            placeholder="Hazırlanışını adım adım yazınız"
                            rows={6}
                            required
                        />
                    </div>
                    <div className="input-container">
                        <label htmlFor="recipeCategory">Kategori *</label>
                        <select
                            id="recipeCategory"
                            className="text-input"
                            value={newRecipe.category_id}
                            onChange={(e) => setNewRecipe({...newRecipe, category_id: e.target.value})}
                            required
                        >
                            <option value="">Kategori Seçin</option>
                            {categoryData.map(category => (<option key={category.id} value={category.id}>
                                    {category.name || category.title}
                                </option>))}
                        </select>
                    </div>
                </div>
                <div className="modal-footer">
                    <button
                        className="modal-btn cancel-btn"
                        onClick={() => setAddRecipeModal(false)}
                    >
                        Vazgeç
                    </button>
                    <button
                        className="modal-btn confirm-btn"
                        onClick={() => {
                            if (!newRecipe.title.trim()) {
                                setErrorMessage("Lütfen tarif adını giriniz.");
                                setShowErrorPopup(true);
                                return;
                            }

                            if (!newRecipe.category_id) {
                                setErrorMessage("Lütfen bir kategori seçiniz.");
                                setShowErrorPopup(true);
                                return;
                            }

                            if (!newRecipe.ingredients.trim()) {
                                setErrorMessage("Lütfen malzemeleri giriniz.");
                                setShowErrorPopup(true);
                                return;
                            }

                            if (!newRecipe.instructions.trim()) {
                                setErrorMessage("Lütfen hazırlanışı giriniz.");
                                setShowErrorPopup(true);
                                return;
                            }

                            if (newRecipe.image && newRecipe.image instanceof File) {
                                setIsSaving(true);

                                const formData = new FormData();
                                formData.append('image', newRecipe.image);

                                axios.post(`${config[config.environment].apiUrl}/upload?type=recipe`, formData, {
                                    headers: {
                                        Authorization: localStorage.getItem("token"),
                                        'Content-Type': 'multipart/form-data'
                                    },
                                })
                                .then(response => {
                                    const imageUrl = response.data.imageUrl;
                                    const requestData = {
                                        category_id: parseInt(newRecipe.category_id),
                                        name: newRecipe.title,
                                        description: newRecipe.description,
                                        hazirlanis: newRecipe.instructions,
                                        malzemeler: newRecipe.ingredients,
                                        kcal: newRecipe.nutritional_info.calories || 0,
                                        protein: newRecipe.nutritional_info.protein || 0,
                                        karbonhidrat: newRecipe.nutritional_info.carbs || 0,
                                        yag: newRecipe.nutritional_info.fat || 0,
                                        image: imageUrl
                                    };

                                    saveRecipe(requestData, {
                                        setSuccessMessage,
                                        setShowSuccessPopup,
                                        setNewRecipe,
                                        setImagePreview,
                                        setAddRecipeModal,
                                        setIsSaving,
                                        setErrorMessage,
                                        setShowErrorPopup,
                                        fetchRecipes
                                    });
                                })
                                .catch(error => {
                                    console.error("Error uploading image:", error);
                                    setErrorMessage("Resim yüklenirken bir hata oluştu.");
                                    setShowErrorPopup(true);
                                    setIsSaving(false);
                                });
                            } else {
                                const requestData = {
                                    category_id: parseInt(newRecipe.category_id),
                                    name: newRecipe.title,
                                    description: newRecipe.description,
                                    hazirlanis: newRecipe.instructions,
                                    malzemeler: newRecipe.ingredients,
                                    kcal: newRecipe.nutritional_info.calories || 0,
                                    protein: newRecipe.nutritional_info.protein || 0,
                                    karbonhidrat: newRecipe.nutritional_info.carbs || 0,
                                    yag: newRecipe.nutritional_info.fat || 0,
                                    image: "/placeholder.png"
                                };

                                saveRecipe(requestData, {
                                    setSuccessMessage,
                                    setShowSuccessPopup,
                                    setNewRecipe,
                                    setImagePreview,
                                    setAddRecipeModal,
                                    setIsSaving,
                                    setErrorMessage,
                                    setShowErrorPopup,
                                    fetchRecipes
                                });
                            }
                        }}
                        disabled={!newRecipe.title.trim() || !newRecipe.category_id || isSaving}
                    >
                        {isSaving ? 'Kaydediliyor...' : 'Ekle'}
                    </button>
                </div>
            </Modal>

            {/* Add Category Modal */}
            <Modal
                isOpen={addCategoryModal}
                title="Kategori Ekle"
                onClose={() => setAddCategoryModal(false)}
            >
                <div className="modal-body">
                    <div className="input-container">
                        <label htmlFor="categoryTitle">Kategori Adı *</label>
                        <input
                            type="text"
                            id="categoryTitle"
                            className="text-input"
                            value={newCategoryTitle}
                            onChange={(e) => setNewCategoryTitle(e.target.value)}
                            placeholder="Kategori adını giriniz"
                            required
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button
                        className="modal-btn cancel-btn"
                        onClick={() => setAddCategoryModal(false)}
                    >
                        Vazgeç
                    </button>
                    <button
                        className="modal-btn confirm-btn"
                        onClick={() => {
                            if (!newCategoryTitle.trim()) {
                                setErrorMessage("Lütfen kategori adını giriniz.");
                                setShowErrorPopup(true);
                                return;
                            }

                            const categoryData = {
                                recipe_category_name: newCategoryTitle.trim()
                            };

                            axios.post(`${config[config.environment].apiUrl}/recipe/addRecipeCategory`, categoryData, {
                                headers: {
                                    Authorization: localStorage.getItem("token"),
                                },
                            })
                                .then(response => {
                                    axios
                                        .get(`${config[config.environment].apiUrl}/recipe/getMyRecipeCategories`, {
                                            headers: {
                                                Authorization: localStorage.getItem("token"),
                                            },
                                        })
                                        .then((response) => {
                                            setCategoryData(response.data);
                                        });

                                    setSuccessMessage(`"${newCategoryTitle}" kategorisi başarıyla eklendi.`);
                                    setShowSuccessPopup(true);

                                    setNewCategoryTitle("");
                                    setAddCategoryModal(false);
                                })
                                .catch(error => {
                                    console.error("Error adding category:", error);
                                    setErrorMessage("Kategori eklenirken bir hata oluştu.");
                                    setShowErrorPopup(true);
                                });
                        }}
                        disabled={!newCategoryTitle.trim()}
                    >
                        Ekle
                    </button>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteConfirmModal}
                title="Tarifi Sil"
                onClose={() => {
                    setDeleteConfirmModal(false);
                    setItemToDelete(null);
                }}
            >
                <div className="modal-body delete-confirm-modal">
                    <div className="delete-warning">
                        <WarningIcon className="warning-icon"/>
                        <p className="warning-text">
                            <strong>{itemToDelete?.title}</strong> tarifini silmek istediğinize emin misiniz?
                        </p>
                    </div>
                    <p className="delete-note">Bu işlem geri alınamaz.</p>
                </div>
                <div className="modal-footer">
                    <button
                        className="modal-btn cancel-btn"
                        onClick={() => {
                            setDeleteConfirmModal(false);
                            setItemToDelete(null);
                        }}
                    >
                        Vazgeç
                    </button>
                    <button
                        className="modal-btn delete-confirm-btn"
                        onClick={() => {
                            if (!itemToDelete || !itemToDelete.id) {
                                setErrorMessage("Silinecek tarif bulunamadı.");
                                setShowErrorPopup(true);
                                return;
                            }

                            axios.delete(`${config[config.environment].apiUrl}/recipe/deleteRecipe?recipe_id=${itemToDelete.id}`, {
                                headers: {
                                    Authorization: localStorage.getItem("token"),
                                },
                            })
                                .then(response => {
                                    if (response.data.success) {
                                        setRecipeData(prevData => prevData.filter(recipe => recipe.id !== itemToDelete.id));

                                        setSuccessMessage(`"${itemToDelete.title}" tarifi başarıyla silindi.`);
                                        setShowSuccessPopup(true);
                                    } else {
                                        setErrorMessage("Tarif silinirken bir hata oluştu.");
                                        setShowErrorPopup(true);
                                    }

                                    setDeleteConfirmModal(false);
                                    setItemToDelete(null);
                                })
                                .catch(error => {
                                    console.error("Error deleting recipe:", error);
                                    setErrorMessage("Tarif silinirken bir hata oluştu.");
                                    setShowErrorPopup(true);
                                });
                        }}
                    >
                        Sil
                    </button>
                </div>
            </Modal>

            {/* Edit Recipe Modal */}
            <Modal
                isOpen={editRecipeModal}
                title="Tarif Düzenle"
                onClose={() => setEditRecipeModal(false)}
            >
                <div className="modal-body styled-form">
                    <div className="input-container">
                        <label htmlFor="editTitle">Tarif Adı *</label>
                        <input
                            type="text"
                            id="editTitle"
                            className="text-input"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Tarif adını giriniz"
                            required
                        />
                    </div>
                    <div className="input-container">
                        <label htmlFor="editDescription">Kısa Açıklama</label>
                        <textarea
                            id="editDescription"
                            className="text-input textarea"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Tarif hakkında kısa açıklama giriniz"
                            rows={2}
                        />
                    </div>
                    <div className="input-container">
                        <label htmlFor="editImage">Tarif Resmi</label>
                        <input
                            type="file"
                            id="editImage"
                            className="text-input"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setEditImage(file);
                                        setImagePreview(reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        <label htmlFor="editImage" className={`file-upload-label ${imagePreview ? 'has-file' : ''}`}>
                            <span className="file-upload-icon">📷</span>
                            {imagePreview ? 'Resim seçildi - Değiştirmek için tıklayın' : 'Resim seçmek için tıklayın veya sürükleyin'}
                        </label>
                        {imagePreview && (
                            <div className="image-preview-container">
                                <img src={imagePreview} alt="Tarif önizleme" className="image-preview" />
                                <button
                                    type="button"
                                    className="remove-image-btn"
                                    onClick={() => {
                                        setEditImage(null);
                                        setImagePreview('');
                                        document.getElementById('editImage').value = '';
                                    }}
                                >
                                    ✖
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="nutritional-info-container">
                        <h3 className="form-section-title">Besin Değerleri</h3>
                        <div className="nutritional-info-grid-form">
                            <div className="input-container half-width">
                                <label htmlFor="editCalories">Kalori (kcal)</label>
                                <input
                                    type="number"
                                    id="editCalories"
                                    className="text-input"
                                    value={editNutritionalInfo.calories}
                                    onChange={(e) => setEditNutritionalInfo({
                                        ...editNutritionalInfo, calories: e.target.value
                                    })}
                                    placeholder="Örn: 250"
                                />
                            </div>
                            <div className="input-container half-width">
                                <label htmlFor="editProtein">Protein (g)</label>
                                <input
                                    type="number"
                                    id="editProtein"
                                    className="text-input"
                                    value={editNutritionalInfo.protein}
                                    onChange={(e) => setEditNutritionalInfo({
                                        ...editNutritionalInfo, protein: e.target.value
                                    })}
                                    placeholder="Örn: 15"
                                />
                            </div>
                            <div className="input-container half-width">
                                <label htmlFor="editCarbs">Karbonhidrat (g)</label>
                                <input
                                    type="number"
                                    id="editCarbs"
                                    className="text-input"
                                    value={editNutritionalInfo.carbs}
                                    onChange={(e) => setEditNutritionalInfo({
                                        ...editNutritionalInfo, carbs: e.target.value
                                    })}
                                    placeholder="Örn: 30"
                                />
                            </div>
                            <div className="input-container half-width">
                                <label htmlFor="editFat">Yağ (g)</label>
                                <input
                                    type="number"
                                    id="editFat"
                                    className="text-input"
                                    value={editNutritionalInfo.fat}
                                    onChange={(e) => setEditNutritionalInfo({
                                        ...editNutritionalInfo, fat: e.target.value
                                    })}
                                    placeholder="Örn: 10"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="input-container">
                        <label htmlFor="editIngredients">Malzemeler *</label>
                        <textarea
                            id="editIngredients"
                            className="text-input textarea"
                            value={editIngredients}
                            onChange={(e) => setEditIngredients(e.target.value)}
                            placeholder="Malzemeleri virgülle ayırarak giriniz"
                            rows={4}
                            required
                        />
                    </div>
                    <div className="input-container">
                        <label htmlFor="editInstructions">Hazırlanışı *</label>
                        <textarea
                            id="editInstructions"
                            className="text-input textarea"
                            value={editInstructions}
                            onChange={(e) => setEditInstructions(e.target.value)}
                            placeholder="Hazırlanışını adım adım yazınız"
                            rows={6}
                            required
                        />
                    </div>
                    <div className="input-container">
                        <label htmlFor="editCategory">Kategori *</label>
                        <select
                            id="editCategory"
                            className="text-input"
                            value={editCategoryId}
                            onChange={(e) => setEditCategoryId(e.target.value)}
                            required
                        >
                            <option value="">Kategori Seçin</option>
                            {categoryData.map(category => (<option key={category.id} value={category.id}>
                                    {category.name || category.title}
                                </option>))}
                        </select>
                    </div>
                </div>
                <div className="modal-footer">
                    <button
                        className="modal-btn cancel-btn"
                        onClick={() => setEditRecipeModal(false)}
                    >
                        İptal
                    </button>
                    <button
                        className="modal-btn confirm-btn"
                        onClick={() => {
                            if (!editTitle.trim()) {
                                setErrorMessage("Lütfen tarif adını giriniz.");
                                setShowErrorPopup(true);
                                return;
                            }

                            if (!editCategoryId) {
                                setErrorMessage("Lütfen bir kategori seçiniz.");
                                setShowErrorPopup(true);
                                return;
                            }

                            if (!editIngredients.trim()) {
                                setErrorMessage("Lütfen malzemeleri giriniz.");
                                setShowErrorPopup(true);
                                return;
                            }

                            if (!editInstructions.trim()) {
                                setErrorMessage("Lütfen hazırlanışı giriniz.");
                                setShowErrorPopup(true);
                                return;
                            }

                            setIsSaving(true);

                            if (editImage && editImage instanceof File) {
                                const formData = new FormData();
                                formData.append('image', editImage);

                                axios.post(`${config[config.environment].apiUrl}/upload?type=recipe`, formData, {
                                    headers: {
                                        Authorization: localStorage.getItem("token"),
                                        'Content-Type': 'multipart/form-data'
                                    },
                                })
                                .then(response => {
                                    const imageUrl = response.data.imageUrl;

                                    const recipeData = {
                                        recipe_id: selectedRecipe.id,
                                        category_id: parseInt(editCategoryId),
                                        name: editTitle,
                                        description: editDescription,
                                        image: imageUrl,
                                        hazirlanis: editInstructions,
                                        malzemeler: editIngredients,
                                        kcal: editNutritionalInfo.calories || 0,
                                        protein: editNutritionalInfo.protein || 0,
                                        karbonhidrat: editNutritionalInfo.carbs || 0,
                                        yag: editNutritionalInfo.fat || 0
                                    };

                                    updateRecipe(recipeData, {
                                        setRecipeData,
                                        setSuccessMessage,
                                        setShowSuccessPopup,
                                        setIsSaving,
                                        setEditRecipeModal,
                                        setErrorMessage,
                                        setShowErrorPopup
                                    });
                                })
                                .catch(error => {
                                    console.error("Error uploading image:", error);
                                    setErrorMessage("Resim yüklenirken bir hata oluştu.");
                                    setShowErrorPopup(true);
                                    setIsSaving(false);
                                });
                            } else {
                                const recipeData = {
                                    recipe_id: selectedRecipe.id,
                                    category_id: parseInt(editCategoryId),
                                    name: editTitle,
                                    description: editDescription,
                                    image: typeof editImage === 'string' && editImage ? editImage : (selectedRecipe.image || "/placeholder.png"),
                                    hazirlanis: editInstructions,
                                    malzemeler: editIngredients,
                                    kcal: editNutritionalInfo.calories || 0,
                                    protein: editNutritionalInfo.protein || 0,
                                    karbonhidrat: editNutritionalInfo.carbs || 0,
                                    yag: editNutritionalInfo.fat || 0
                                };

                                updateRecipe(recipeData, {
                                    setRecipeData,
                                    setSuccessMessage,
                                    setShowSuccessPopup,
                                    setIsSaving,
                                    setEditRecipeModal,
                                    setErrorMessage,
                                    setShowErrorPopup
                                });
                            }
                        }}
                        disabled={!editTitle.trim() || !editCategoryId || isSaving}
                    >
                        {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </div>
            </Modal>

            {/* Delete Category Confirmation Modal */}
            <Modal
                isOpen={deleteCategoryConfirmModal}
                title="Kategoriyi Sil"
                onClose={() => {
                    setDeleteCategoryConfirmModal(false);
                    setCategoryToDelete(null);
                    setAffectedRecipes([]);
                }}
            >
                <div className="modal-body delete-confirm-modal">
                    <div className="delete-warning">
                        <WarningIcon className="warning-icon"/>
                        <p className="warning-text">
                            <strong>{categoryToDelete?.name || categoryToDelete?.title}</strong> kategorisini silmek
                            istediğinize emin misiniz?
                        </p>
                    </div>
                    <p className="delete-note">Bu işlem geri alınamaz.</p>

                    {affectedRecipes.length > 0 && (<div className="affected-recipes">
                            <p className="delete-note important">
                                <strong>Önemli:</strong> Bu kategori ile
                                ilişkili <strong>{affectedRecipes.length}</strong> tarif silinecektir:
                            </p>
                            <ul className="affected-recipes-list">
                                {affectedRecipes.map(recipe => (
                                    <li key={recipe.id}><span className="recipe-title">{recipe.title}</span></li>))}
                            </ul>
                        </div>)}
                </div>
                <div className="modal-footer">
                    <button
                        className="modal-btn cancel-btn"
                        onClick={() => {
                            setDeleteCategoryConfirmModal(false);
                            setCategoryToDelete(null);
                            setAffectedRecipes([]);
                        }}
                    >
                        Vazgeç
                    </button>
                    <button
                        className="modal-btn delete-confirm-btn"
                        onClick={() => {
                            if (!categoryToDelete || !categoryToDelete.id) {
                                setErrorMessage("Silinecek kategori bulunamadı.");
                                setShowErrorPopup(true);
                                return;
                            }

                            axios.delete(`${config[config.environment].apiUrl}/recipe/deleteRecipeCategory?recipe_category_id=${categoryToDelete.id}`, {
                                headers: {
                                    Authorization: localStorage.getItem("token"),
                                },
                            })
                                .then(response => {
                                    if (response.data.success) {
                                        setCategoryData(prevData => prevData.filter(category => category.id !== categoryToDelete.id));

                                        setCheckedCategories(prev => prev.filter(id => id !== categoryToDelete.id));

                                        fetchRecipes();

                                        setSuccessMessage(`"${categoryToDelete.name}" kategorisi başarıyla silindi.`);
                                        setShowSuccessPopup(true);
                                    } else {
                                        setErrorMessage("Kategori silinirken bir hata oluştu.");
                                        setShowErrorPopup(true);
                                    }

                                    setDeleteCategoryConfirmModal(false);
                                    setCategoryToDelete(null);
                                    setAffectedRecipes([]);
                                })
                                .catch(error => {
                                    console.error("Error deleting category:", error);
                                    setErrorMessage("Kategori silinirken bir hata oluştu.");
                                    setShowErrorPopup(true);
                                });
                        }}
                    >
                        Sil
                    </button>
                </div>
            </Modal>

            {/* Delete Multiple Categories Confirmation Modal */}
            <Modal
                isOpen={deleteMultiCategoriesConfirmModal}
                title="Kategorileri Sil"
                onClose={() => {
                    setDeleteMultiCategoriesConfirmModal(false);
                    setAffectedRecipes([]);
                }}
            >
                <div className="modal-body delete-confirm-modal">
                    <div className="delete-warning">
                        <WarningIcon className="warning-icon"/>
                        <p className="warning-text">
                            <strong>{checkedCategories.length}</strong> kategoriyi silmek istediğinize emin misiniz?
                        </p>
                    </div>
                    <p className="delete-note">Bu işlem geri alınamaz.</p>

                    {affectedRecipes.length > 0 && (<div className="affected-recipes">
                            <p className="delete-note important">
                                <strong>Önemli:</strong> Bu kategoriler ile
                                ilişkili <strong>{affectedRecipes.length}</strong> tarif silinecektir:
                            </p>
                            <ul className="affected-recipes-list">
                                {affectedRecipes.map(recipe => (
                                    <li key={recipe.id}><span className="recipe-title">{recipe.title}</span></li>))}
                            </ul>
                        </div>)}
                </div>
                <div className="modal-footer">
                    <button
                        className="modal-btn cancel-btn"
                        onClick={() => {
                            setDeleteMultiCategoriesConfirmModal(false);
                            setAffectedRecipes([]);
                        }}
                    >
                        Vazgeç
                    </button>
                    <button
                        className="modal-btn delete-confirm-btn"
                        onClick={() => {
                            if (checkedCategories.length === 0) {
                                setErrorMessage("Silinecek kategori seçilmedi.");
                                setShowErrorPopup(true);
                                return;
                            }

                            const deletePromises = checkedCategories.map(categoryId => axios.delete(`${config[config.environment].apiUrl}/recipe/deleteRecipeCategory?recipe_category_id=${categoryId}`, {
                                headers: {
                                    Authorization: localStorage.getItem("token"),
                                },
                            }));

                            Promise.all(deletePromises)
                                .then(responses => {
                                    const allSuccessful = responses.every(response => response.data.success);

                                    if (allSuccessful) {
                                        setCategoryData(prevData => prevData.filter(category => !checkedCategories.includes(category.id)));
                                        setCheckedCategories([]);
                                        fetchRecipes();
                                        setSuccessMessage(`${checkedCategories.length} kategori başarıyla silindi.`);
                                        setShowSuccessPopup(true);
                                    } else {
                                        setErrorMessage("Bazı kategoriler silinemedi.");
                                        setShowErrorPopup(true);

                                        axios
                                            .get(`${config[config.environment].apiUrl}/recipe/getMyRecipeCategories`, {
                                                headers: {
                                                    Authorization: localStorage.getItem("token"),
                                                },
                                            })
                                            .then((response) => {
                                                setCategoryData(response.data);
                                                setCheckedCategories([]);
                                            });
                                    }

                                    setDeleteMultiCategoriesConfirmModal(false);
                                    setAffectedRecipes([]);
                                })
                                .catch(error => {
                                    console.error("Error deleting categories:", error);
                                    setErrorMessage("Kategoriler silinirken bir hata oluştu.");
                                    setShowErrorPopup(true);

                                    setDeleteMultiCategoriesConfirmModal(false);
                                    setAffectedRecipes([]);
                                });
                        }}
                    >
                        Sil
                    </button>
                </div>
            </Modal>

            {/* Danışana Ata Modal */}
            <Modal
                isOpen={addToUserModal}
                title="Danışana Tarif Ata"
                onClose={() => setAddToUserModal(false)}
            >
                <div className="modal-body styled-form">
                    <div className="input-container">
                        <label htmlFor="selectUser">Danışan Seçin *</label>
                        <select
                            id="selectUser"
                            className="text-input"
                            value={selectedUser || ""}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            required
                        >
                            <option value="">Danışan Seçin</option>
                            {danisanList.map(client => (
                                <option key={client.id} value={client.id}>
                                    {client.name} {client.surname}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="input-container">
                        <label htmlFor="assignmentNote">Not (İsteğe bağlı)</label>
                        <textarea
                            id="assignmentNote"
                            className="text-input textarea"
                            value={assignmentNote}
                            onChange={(e) => setAssignmentNote(e.target.value)}
                            placeholder="Danışana özel not ekleyebilirsiniz"
                            rows={3}
                        />
                    </div>

                    {selectedRecipe && (
                        <div className="recipe-preview">
                            <h3 className="preview-title">Seçilen Tarif:</h3>
                            <div className="preview-content">
                                <p className="preview-recipe-name">{selectedRecipe.title}</p>
                                {selectedRecipe.description && (
                                    <p className="preview-description">{selectedRecipe.description}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button
                        className="modal-btn cancel-btn"
                        onClick={() => setAddToUserModal(false)}
                    >
                        İptal
                    </button>
                    <button
                        className="modal-btn confirm-btn"
                        onClick={() => {
                            if (!selectedUser) {
                                setErrorMessage("Lütfen bir danışan seçin.");
                                setShowErrorPopup(true);
                                return;
                            }

                            axios.post(`${config[config.environment].apiUrl}/recipe/assignRecipeToClient?recipe_id=${selectedRecipe.id}&client_id=${selectedUser}`,
                                { note: assignmentNote },
                                {
                                    headers: {
                                        Authorization: localStorage.getItem("token"),
                                    },
                                })
                                .then(response => {
                                    const selectedClientName = danisanList.find(client => client.id == selectedUser)?.name;

                                    axios.post(`${config[config.environment].apiUrl}/notification/sendRecipeAssignedNotification`,
                                        { client_id: selectedUser },
                                        {
                                            headers: {
                                                Authorization: localStorage.getItem("token"),
                                            }
                                        })
                                        .catch(error => {
                                            console.error("Error sending notification:", error);
                                        });

                                    setSuccessMessage(`"${selectedRecipe.title}" tarifi "${selectedClientName}" danışanına başarıyla atandı.`);
                                    setShowSuccessPopup(true);

                                    setSelectedUser(null);
                                    setAssignmentNote('');
                                    setAddToUserModal(false);
                                })
                                .catch(error => {
                                    console.error("Error assigning recipe:", error);
                                    if (error.response && error.response.data && error.response.data.message) {
                                        setErrorMessage(error.response.data.message);
                                    } else {
                                        setErrorMessage("Tarif atanırken bir hata oluştu.");
                                    }
                                    setShowErrorPopup(true);
                                });
                        }}
                        disabled={!selectedUser}
                    >
                        Ata
                    </button>
                </div>
            </Modal>

            {/* Danışana Atanmış Tarifler Modalı */}
            <Modal
                isOpen={clientRecipesModal}
                title={`${selectedClientInfo?.name || 'Danışan'} - Atanmış Tarifler`}
                onClose={() => setClientRecipesModal(false)}
            >
                <div className="modal-body">
                    {loadingClientRecipes ? (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 5
                        }}>
                            <CircularProgress size={40} sx={{color: '#087708', mb: 2}}/>
                            <Typography variant="body1" color="text.secondary">Tarifler yükleniyor...</Typography>
                        </Box>
                    ) : selectedClientRecipes.length > 0 ? (
                        <Box sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            <List sx={{width: '100%'}}>
                                {selectedClientRecipes.map((item) => (
                                    <React.Fragment key={item.id}>
                                        <ListItem
                                            alignItems="flex-start"
                                            sx={{
                                                py: 2,
                                                transition: 'background-color 0.2s',
                                                '&:hover': {
                                                    backgroundColor: '#f5f5f5'
                                                }
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{
                                                    bgcolor: '#ff9e25',
                                                    width: 48,
                                                    height: 48,
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}>
                                                    {item.Recipe?.name?.charAt(0) || "T"}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Typography
                                                        variant="h6"
                                                        fontWeight="500"
                                                        sx={{
                                                            color: '#ff9800',
                                                            fontSize: '1.1rem',
                                                            mb: 0.5
                                                        }}
                                                    >
                                                        {item.Recipe?.name || "Tarif"}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <React.Fragment>
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            color="text.primary"
                                                            sx={{display: 'block', mb: 1}}
                                                        >
                                                            {item.Recipe?.description || "Bu tarif için açıklama bulunmamaktadır."}
                                                        </Typography>

                                                        {item.note && (
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'flex-start',
                                                                bgcolor: '#fffde7',
                                                                borderRadius: '8px',
                                                                p: 1.5,
                                                                mt: 1,
                                                                borderLeft: '3px solid #fbc02d'
                                                            }}>
                                                                <NoteIcon fontSize="small" sx={{
                                                                    mr: 1,
                                                                    color: '#f57f17',
                                                                    fontSize: '18px',
                                                                    mt: 0.3
                                                                }}/>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {item.note}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </React.Fragment>
                                                }
                                            />
                                        </ListItem>
                                        <Divider variant="inset" component="li"/>
                                    </React.Fragment>
                                ))}
                            </List>
                        </Box>
                    ) : (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 6,
                            px: 3,
                            bgcolor: '#f8f9fa',
                            borderRadius: 2,
                            border: '1px dashed #bdbdbd'
                        }}>
                            <DescriptionIcon sx={{fontSize: 60, color: '#bdbdbd', mb: 2}}/>
                            <Typography variant="h6" color="text.secondary" align="center" gutterBottom>
                                Bu danışana atanmış tarif bulunmamaktadır
                            </Typography>
                            <Typography variant="body2" color="text.secondary" align="center"
                                        sx={{mt: 1, maxWidth: 500}}>
                                Tariflere göz atarak danışanınıza uygun tarifler atayabilirsiniz.
                            </Typography>
                        </Box>
                    )}
                </div>
                <div className="modal-footer">
                    <button
                        className="modal-btn close-btn"
                        onClick={() => setClientRecipesModal(false)}
                    >
                        Kapat
                    </button>
                </div>
            </Modal>

            {/* Success and Error Popups */}
            {showSuccessPopup && (<div className="success-popup">
                    <div className="success-popup-content">
                        <CheckCircleIcon className="success-icon"/>
                        <p>{successMessage}</p>
                    </div>
                </div>)}

            {showErrorPopup && (<div className="error-popup">
                    <div className="error-popup-content">
                        <ErrorIcon className="error-icon"/>
                        <p>{errorMessage}</p>
                    </div>
                </div>)}
        </Default>);
}
