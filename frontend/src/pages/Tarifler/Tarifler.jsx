import React, {useEffect, useState} from 'react';
import './Tarifler.css';
import Default from "../../Components/Layouts/Default.jsx";
import axios from "axios";
import config from "../../config.js";
import {showErrorToast} from '../../utils/toastUtil';
import { saveRecipe, updateRecipe } from './helpers.js';

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

import {jsPDF} from "jspdf";
import 'jspdf-autotable';
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

const generatePDF = (recipe) => {
    const doc = new jsPDF({
        orientation: 'portrait', unit: 'mm', format: 'a4'
    });

    doc.addFont('https://fonts.cdnfonts.com/s/15051/unicode.helvetica.ttf', 'Helvetica', 'normal');
    doc.addFont('https://fonts.cdnfonts.com/s/15051/unicode.helvetica.bold.ttf', 'Helvetica', 'bold');
    doc.addFont('https://fonts.cdnfonts.com/s/15051/unicode.helvetica.italic.ttf', 'Helvetica', 'italic');

    const greenColor = [76, 175, 80];
    const orangeColor = [255, 152, 0];

    doc.setFillColor(greenColor[0], greenColor[1], greenColor[2]);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('Helvetica', 'bold');

    let title = recipe.title || "Tarif";
    const titleWidth = doc.getStringUnitWidth(title) * 24 / doc.internal.scaleFactor;
    const availableWidth = doc.internal.pageSize.getWidth() - 40;
    if (titleWidth > availableWidth) {
        title = title.substring(0, Math.floor(title.length * (availableWidth / titleWidth) - 3)) + '...';
    }

    doc.text(title, 20, 25);

    doc.setFillColor(orangeColor[0], orangeColor[1], orangeColor[2]);
    doc.rect(0, 40, doc.internal.pageSize.getWidth(), 5, 'F');

    doc.setTextColor(0, 0, 0);

    let yPosition = 60;
    if (recipe.description && recipe.description.trim()) {
        doc.setFontSize(12);
        doc.setFont('Helvetica', 'italic');
        const descriptionLines = doc.splitTextToSize(recipe.description, doc.internal.pageSize.getWidth() - 40);
        doc.text(descriptionLines, 20, yPosition);
        yPosition += descriptionLines.length * 7 + 10;
    }

    if (recipe.nutritional_info) {
        doc.setFontSize(14);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(greenColor[0], greenColor[1], greenColor[2]);
        doc.text("Besin Degerleri", 20, yPosition);

        doc.setFontSize(10);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        yPosition += 8;
        const nutriInfo = recipe.nutritional_info;

        if (nutriInfo.calories) {
            doc.text(`• Kalori: ${nutriInfo.calories} kcal`, 25, yPosition);
            yPosition += 6;
        }

        if (nutriInfo.protein) {
            doc.text(`• Protein: ${nutriInfo.protein} g`, 25, yPosition);
            yPosition += 6;
        }

        if (nutriInfo.carbs) {
            doc.text(`• Karbonhidrat: ${nutriInfo.carbs} g`, 25, yPosition);
            yPosition += 6;
        }

        if (nutriInfo.fat) {
            doc.text(`• Yag: ${nutriInfo.fat} g`, 25, yPosition);
            yPosition += 6;
        }

        yPosition += 5;
    }

    // Check if we need a new page
    if (yPosition > doc.internal.pageSize.getHeight() - 50) {
        doc.addPage();

        // Add orange header on the new page
        doc.setFillColor(orangeColor[0], orangeColor[1], orangeColor[2]);
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), 15, 'F');

        yPosition = 30;
    }

    // Add ingredients
    doc.setFontSize(14);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(greenColor[0], greenColor[1], greenColor[2]);
    doc.text("Malzemeler", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    if (recipe.ingredients) {
        const ingredients = recipe.ingredients.split(',');
        ingredients.forEach(ingredient => {
            const trimmedIngredient = ingredient.trim().replace(/ı/g, 'i').replace(/İ/g, 'I')
                .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
                .replace(/ü/g, 'u').replace(/Ü/g, 'U')
                .replace(/ş/g, 's').replace(/Ş/g, 'S')
                .replace(/ç/g, 'c').replace(/Ç/g, 'C')
                .replace(/ö/g, 'o').replace(/Ö/g, 'O');

            if (trimmedIngredient) {
                doc.text(`• ${trimmedIngredient}`, 25, yPosition);
                yPosition += 6;

                // Check if we need a new page
                if (yPosition > doc.internal.pageSize.getHeight() - 20) {
                    doc.addPage();

                    // Add orange header on the new page
                    doc.setFillColor(orangeColor[0], orangeColor[1], orangeColor[2]);
                    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 15, 'F');

                    yPosition = 30;
                }
            }
        });
    }

    yPosition += 10;

    // Check if we need a new page for instructions
    if (yPosition > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();

        // Add orange header on the new page
        doc.setFillColor(orangeColor[0], orangeColor[1], orangeColor[2]);
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), 15, 'F');

        yPosition = 30;
    }

    // Add instructions
    doc.setFontSize(14);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(greenColor[0], greenColor[1], greenColor[2]);
    doc.text("Hazirlani", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    if (recipe.instructions) {
        // Replace Turkish characters with their ASCII equivalents
        const sanitizedInstructions = recipe.instructions.replace(/ı/g, 'i').replace(/İ/g, 'I')
            .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
            .replace(/ü/g, 'u').replace(/Ü/g, 'U')
            .replace(/ş/g, 's').replace(/Ş/g, 'S')
            .replace(/ç/g, 'c').replace(/Ç/g, 'C')
            .replace(/ö/g, 'o').replace(/Ö/g, 'O');

        // Handle long texts with multiline
        const splitText = doc.splitTextToSize(sanitizedInstructions, doc.internal.pageSize.getWidth() - 40);

        // Check if we have too many lines for the current page
        if (yPosition + splitText.length * 5 > doc.internal.pageSize.getHeight() - 20) {
            // Calculate how many lines we can fit on this page
            const linesPerPage = Math.floor((doc.internal.pageSize.getHeight() - 20 - yPosition) / 5);

            // Add as many lines as we can fit
            doc.text(splitText.slice(0, linesPerPage), 20, yPosition);

            // Add a new page for the remaining lines
            doc.addPage();

            // Add orange header on the new page
            doc.setFillColor(orangeColor[0], orangeColor[1], orangeColor[2]);
            doc.rect(0, 0, doc.internal.pageSize.getWidth(), 15, 'F');

            // Continue with the remaining lines
            yPosition = 30;
            doc.text(splitText.slice(linesPerPage), 20, yPosition);
        } else {
            // All lines fit on the current page
            doc.text(splitText, 20, yPosition);
        }
    }

    // Add footer
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setFontSize(8);
    doc.setTextColor(greenColor[0], greenColor[1], greenColor[2]);
    doc.text("Diyetisyen Uygulamasi", 20, footerY);
    doc.setTextColor(orangeColor[0], orangeColor[1], orangeColor[2]);
    doc.text(new Date().toLocaleDateString('en-US'), doc.internal.pageSize.getWidth() - 40, footerY);

    // Save the PDF
    const safeFileName = recipe.title ? recipe.title.replace(/\s+/g, '_')
        .replace(/ı/g, 'i').replace(/İ/g, 'I')
        .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
        .replace(/ü/g, 'u').replace(/Ü/g, 'U')
        .replace(/ş/g, 's').replace(/Ş/g, 'S')
        .replace(/ç/g, 'c').replace(/Ç/g, 'C')
        .replace(/ö/g, 'o').replace(/Ö/g, 'O') : 'Tarif';

    doc.save(`${safeFileName}.pdf`);
};

// Category Item Component
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

// Recipe Card Component
const RecipeCard = ({item, onPrint, onEdit, onDelete, onView, onAssign}) => {
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
                    <button
                        className="action-button print-btn"
                        title="Yazdır"
                        onClick={() => onPrint(item)}
                    >
                        <PrintIcon/>
                    </button>
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

// Modal Component
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

    // Danışan ara için state
    const [danisanSearchTerm, setDanisanSearchTerm] = useState('');
    const [filteredDanisanList, setFilteredDanisanList] = useState([]);

    // Danışana atanmış tarifler için state'ler
    const [clientRecipesModal, setClientRecipesModal] = useState(false);
    const [selectedClientRecipes, setSelectedClientRecipes] = useState([]);
    const [loadingClientRecipes, setLoadingClientRecipes] = useState(false);
    const [selectedClientInfo, setSelectedClientInfo] = useState(null);

    // Modal states
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

    // Edit recipe states
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

    // Success popup states
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Error popup states
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // New recipe state
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

    // Delete confirmation modal states
    const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteCategoryConfirmModal, setDeleteCategoryConfirmModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [deleteMultiCategoriesConfirmModal, setDeleteMultiCategoriesConfirmModal] = useState(false);
    const [affectedRecipes, setAffectedRecipes] = useState([]);

    // Edit form state
    const [isSaving, setIsSaving] = useState(false);

    // Auto-hide success popup after 3 seconds
    useEffect(() => {
        if (showSuccessPopup) {
            const timer = setTimeout(() => {
                setShowSuccessPopup(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [showSuccessPopup]);

    // Auto-hide error popup after 5 seconds
    useEffect(() => {
        if (showErrorPopup) {
            const timer = setTimeout(() => {
                setShowErrorPopup(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [showErrorPopup]);

    // Fetch clients data
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

    // Fetch recipe categories
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

    // Fetch recipes
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

    // Initial fetch
    useEffect(() => {
        fetchRecipes();
    }, []);

    // Filter categories based on search term
    const filteredCategories = categoryData?.filter(category => (category?.name || category?.title || "").toLowerCase().includes(searchTerm.toLowerCase()));

    // Filter recipes based on selected categories
    const filteredRecipeData = recipeData.filter(item => {
        // Önce kategori filtresi uygulayalım
        const passesCategory = checkedCategories.length === 0 || checkedCategories.includes(item.category_id);

        // Sonra arama terimine göre filtreleyelim
        const passesSearch = !recipeSearchTerm ||
            item.title.toLowerCase().includes(recipeSearchTerm.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(recipeSearchTerm.toLowerCase())) ||
            (item.ingredients && item.ingredients.toLowerCase().includes(recipeSearchTerm.toLowerCase()));

        return passesCategory && passesSearch;
    });

    // Category handlers
    const handleCategoryCheck = (categoryId) => {
        setCheckedCategories(prev => prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]);
    };

    const handleOpenMultiDeleteConfirm = () => {
        if (checkedCategories.length === 0) return;

        // Find recipes that would be affected by deleting these categories
        const recipesToDelete = recipeData.filter(recipe => checkedCategories.includes(recipe.category_id));

        setAffectedRecipes(recipesToDelete);
        setDeleteMultiCategoriesConfirmModal(true);
    };

    const handleOpenCategoryDeleteConfirm = (categoryId) => {
        const category = categoryData.find(cat => cat.id === categoryId);
        if (!category) return;

        // Find recipes that would be affected by deleting this category
        const recipesToDelete = recipeData.filter(recipe => recipe.category_id === categoryId);

        setCategoryToDelete(category);
        setAffectedRecipes(recipesToDelete);
        setDeleteCategoryConfirmModal(true);
    };

    // Placeholder for recipe card handlers
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
        console.log("Generating PDF for:", item);
        generatePDF(item);
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

    // Danışanların filtrelenmesi için useEffect
    useEffect(() => {
        if (danisanList.length > 0) {
            setFilteredDanisanList(
                danisanList.filter(danisan =>
                    danisan.name.toLowerCase().includes(danisanSearchTerm.toLowerCase())
                )
            );
        }
    }, [danisanList, danisanSearchTerm]);

    // Danışana atanan tarifleri getiren fonksiyon
    const getClientRecipes = (clientId) => {
        const danisan = danisanList.find(d => d.id === clientId);
        setSelectedClientInfo(danisan);
        setLoadingClientRecipes(true);

        // Danışana atanmış tarifleri al
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
                                    setImagePreview(''); // Resim önizlemeyi temizle
                                    setAddRecipeModal(true);
                                }}
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
                                />))) : (<div className="no-recipes">
                                <p>Bu kategoriya ait tarif bulunamadı.</p>
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
                                                            bgcolor: danisan.image ? 'transparent' : '#087708',
                                                            width: 40,
                                                            height: 40
                                                        }}
                                                        src={danisan.image || ''}
                                                    >
                                                        {!danisan.image && danisan.name.charAt(0)}
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
                                    // Resmi önizleme için URL'e dönüştür
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setNewRecipe({...newRecipe, image: file});
                                        setImagePreview(reader.result); // Önizleme için resmin URL'ini ayarla
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
                            // Validate form
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

                            // Resim yükleme işlemini başlat
                            if (newRecipe.image && newRecipe.image instanceof File) {
                                setIsSaving(true); // Yükleme durumunu göster

                                // Form data oluştur
                                const formData = new FormData();
                                formData.append('image', newRecipe.image);

                                // Resmi yükle
                                axios.post(`${config[config.environment].apiUrl}/upload`, formData, {
                                    headers: {
                                        Authorization: localStorage.getItem("token"),
                                        'Content-Type': 'multipart/form-data'
                                    },
                                })
                                .then(response => {
                                    // Yükleme başarılı, resim URL'sini al
                                    const imageUrl = response.data.imageUrl;

                                    // Tarif verilerini hazırla ve resim URL'sini ekle
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

                                    // Tarif kaydetme isteğini gönder
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
                                // Resim yok, doğrudan tarifi kaydet
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
                            // Validate input
                            if (!newCategoryTitle.trim()) {
                                setErrorMessage("Lütfen kategori adını giriniz.");
                                setShowErrorPopup(true);
                                return;
                            }

                            // Prepare request data
                            const categoryData = {
                                recipe_category_name: newCategoryTitle.trim()
                            };

                            // Send request to API
                            axios.post(`${config[config.environment].apiUrl}/recipe/addRecipeCategory`, categoryData, {
                                headers: {
                                    Authorization: localStorage.getItem("token"),
                                },
                            })
                                .then(response => {
                                    // Refresh categories
                                    axios
                                        .get(`${config[config.environment].apiUrl}/recipe/getMyRecipeCategories`, {
                                            headers: {
                                                Authorization: localStorage.getItem("token"),
                                            },
                                        })
                                        .then((response) => {
                                            setCategoryData(response.data);
                                        });

                                    // Show success message
                                    setSuccessMessage(`"${newCategoryTitle}" kategorisi başarıyla eklendi.`);
                                    setShowSuccessPopup(true);

                                    // Reset form and close modal
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

                            // Send DELETE request to API
                            axios.delete(`${config[config.environment].apiUrl}/recipe/deleteRecipe?recipe_id=${itemToDelete.id}`, {
                                headers: {
                                    Authorization: localStorage.getItem("token"),
                                },
                            })
                                .then(response => {
                                    if (response.data.success) {
                                        // Remove deleted recipe from state
                                        setRecipeData(prevData => prevData.filter(recipe => recipe.id !== itemToDelete.id));

                                        // Show success message
                                        setSuccessMessage(`"${itemToDelete.title}" tarifi başarıyla silindi.`);
                                        setShowSuccessPopup(true);
                                    } else {
                                        // Show error if API returns success false
                                        setErrorMessage("Tarif silinirken bir hata oluştu.");
                                        setShowErrorPopup(true);
                                    }

                                    // Close modal and reset state
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
                            // Validate required fields
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

                            // Set saving state
                            setIsSaving(true);

                            // Resim varsa ve yeni bir dosya ise, önce resmi yükle
                            if (editImage && editImage instanceof File) {
                                // Form data oluştur
                                const formData = new FormData();
                                formData.append('image', editImage);

                                // Resmi yükle
                                axios.post(`${config[config.environment].apiUrl}/upload`, formData, {
                                    headers: {
                                        Authorization: localStorage.getItem("token"),
                                        'Content-Type': 'multipart/form-data'
                                    },
                                })
                                .then(response => {
                                    // Yükleme başarılı, resim URL'sini al
                                    const imageUrl = response.data.imageUrl;

                                    // Tarif verilerini güncelle
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

                                    // Tarifi güncelle
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
                                // Resim değişmedi veya yok, doğrudan tarifi güncelle
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

                            // Send DELETE request to API
                            axios.delete(`${config[config.environment].apiUrl}/recipe/deleteRecipeCategory?recipe_category_id=${categoryToDelete.id}`, {
                                headers: {
                                    Authorization: localStorage.getItem("token"),
                                },
                            })
                                .then(response => {
                                    if (response.data.success) {
                                        // Remove deleted category from state
                                        setCategoryData(prevData => prevData.filter(category => category.id !== categoryToDelete.id));

                                        // Remove category from checked categories if it's there
                                        setCheckedCategories(prev => prev.filter(id => id !== categoryToDelete.id));

                                        // Remove all recipes that belonged to this category from display
                                        fetchRecipes();

                                        // Show success message
                                        setSuccessMessage(`"${categoryToDelete.name}" kategorisi başarıyla silindi.`);
                                        setShowSuccessPopup(true);
                                    } else {
                                        // Show error if API returns success false
                                        setErrorMessage("Kategori silinirken bir hata oluştu.");
                                        setShowErrorPopup(true);
                                    }

                                    // Close modal and reset state
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

                            // Create an array of promises for each category deletion
                            const deletePromises = checkedCategories.map(categoryId => axios.delete(`${config[config.environment].apiUrl}/recipe/deleteRecipeCategory?recipe_category_id=${categoryId}`, {
                                headers: {
                                    Authorization: localStorage.getItem("token"),
                                },
                            }));

                            // Execute all deletion requests
                            Promise.all(deletePromises)
                                .then(responses => {
                                    // Check if all deletions were successful
                                    const allSuccessful = responses.every(response => response.data.success);

                                    if (allSuccessful) {
                                        // Remove deleted categories from state
                                        setCategoryData(prevData => prevData.filter(category => !checkedCategories.includes(category.id)));

                                        // Clear checked categories
                                        setCheckedCategories([]);

                                        // Refresh recipes
                                        fetchRecipes();

                                        // Show success message
                                        setSuccessMessage(`${checkedCategories.length} kategori başarıyla silindi.`);
                                        setShowSuccessPopup(true);
                                    } else {
                                        // Some deletions failed
                                        setErrorMessage("Bazı kategoriler silinemedi.");
                                        setShowErrorPopup(true);

                                        // Refresh categories to get updated list
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

                                    // Close modal and reset state
                                    setDeleteMultiCategoriesConfirmModal(false);
                                    setAffectedRecipes([]);
                                })
                                .catch(error => {
                                    console.error("Error deleting categories:", error);
                                    setErrorMessage("Kategoriler silinirken bir hata oluştu.");
                                    setShowErrorPopup(true);

                                    // Close modal but don't clear checkedCategories
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
