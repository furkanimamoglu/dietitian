import React, { useEffect, useState } from 'react';
import './Tarifler.css';
import Default from "../../Components/Layouts/Default.jsx";
import axios from "axios";
import config from "../../config.js";
import { toast } from 'react-hot-toast';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

// Helper function to get YouTube video ID from URL
const getYouTubeVideoId = (url) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
};

// PDF generation function
const generatePDF = (recipe) => {
    // Create a new PDF document
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    // Add Unicode font support for Turkish characters
    doc.addFont('https://fonts.cdnfonts.com/s/15051/unicode.helvetica.ttf', 'Helvetica', 'normal');
    doc.addFont('https://fonts.cdnfonts.com/s/15051/unicode.helvetica.bold.ttf', 'Helvetica', 'bold');
    doc.addFont('https://fonts.cdnfonts.com/s/15051/unicode.helvetica.italic.ttf', 'Helvetica', 'italic');
    
    // Define colors for the PDF
    const greenColor = [76, 175, 80]; // RGB value for primary green
    const orangeColor = [255, 152, 0]; // RGB value for orange accent
    
    // Add header with green background
    doc.setFillColor(greenColor[0], greenColor[1], greenColor[2]);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
    
    // Add title with white text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('Helvetica', 'bold');
    
    // Make sure text doesn't overflow
    let title = recipe.title || "Tarif";
    const titleWidth = doc.getStringUnitWidth(title) * 24 / doc.internal.scaleFactor;
    const availableWidth = doc.internal.pageSize.getWidth() - 40;
    if (titleWidth > availableWidth) {
        title = title.substring(0, Math.floor(title.length * (availableWidth / titleWidth) - 3)) + '...';
    }
    
    doc.text(title, 20, 25);
    
    // Add orange decorative element
    doc.setFillColor(orangeColor[0], orangeColor[1], orangeColor[2]);
    doc.rect(0, 40, doc.internal.pageSize.getWidth(), 5, 'F');
    
    // Reset text color to black
    doc.setTextColor(0, 0, 0);
    
    // Add description
    let yPosition = 60;
    if (recipe.description && recipe.description.trim()) {
        doc.setFontSize(12);
        doc.setFont('Helvetica', 'italic');
        const descriptionLines = doc.splitTextToSize(recipe.description, doc.internal.pageSize.getWidth() - 40);
        doc.text(descriptionLines, 20, yPosition);
        yPosition += descriptionLines.length * 7 + 10; // Add space after description
    }
    
    // Add nutritional information if available
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
const CategoryItem = ({ category, isChecked, onCheck, onDelete }) => {
    return (
        <div 
            className={`category-item ${isChecked ? 'checked' : ''}`}
            onClick={onCheck}
        >
            <div className="category-checkbox">
                <input 
                    type="checkbox" 
                    checked={isChecked}
                    onChange={() => {}} // Controlled component
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
                <DeleteIcon />
            </button>
        </div>
    );
};

// Recipe Card Component
const RecipeCard = ({ item, onPrint, onEdit, onDelete, onView }) => {
    return (
        <div className="recipe-card">
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
                
                {item.nutritional_info && (
                    <div className="card-nutritional-info">
                        {item.nutritional_info.calories && (
                            <span className="nutri-badge calories">
                                {item.nutritional_info.calories} Kcal
                            </span>
                        )}
                        {item.nutritional_info.protein && (
                            <span className="nutri-badge protein">
                                {item.nutritional_info.protein}g Protein
                            </span>
                        )}
                        {item.nutritional_info.carbs && (
                            <span className="nutri-badge carbs">
                                {item.nutritional_info.carbs}g Karbonhidrat
                            </span>
                        )}
                        {item.nutritional_info.fat && (
                            <span className="nutri-badge fat">
                                {item.nutritional_info.fat}g Yağ
                            </span>
                        )}
                    </div>
                )}
                
                <div className="card-actions">
                    <button 
                        className="action-button print-btn" 
                        title="Yazdır"
                        onClick={() => onPrint(item)}
                    >
                        <PrintIcon />
                    </button>
                    <button 
                        className="action-button edit-btn" 
                        title="Düzenle"
                        onClick={() => onEdit(item)}
                    >
                        <EditIcon />
                    </button>
                    <button 
                        className="action-button delete-btn" 
                        title="Sil"
                        onClick={() => onDelete(item)}
                    >
                        <DeleteIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Modal Component
const Modal = ({ isOpen, title, onClose, children, fullWidth = false }) => {
    if (!isOpen) return null;
    
    return (
        <div className="modal-overlay">
            <div className={`modal-container ${fullWidth ? 'full-width' : ''}`}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default function Tarifler() {
    const [categoryData, setCategoryData] = useState([]);
    const [checkedCategories, setCheckedCategories] = useState([]);
    const [danisanList, setDanisanList] = useState([]);
    const [recipeData, setRecipeData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
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
    const [editVideoUrl, setEditVideoUrl] = useState('');
    const [editNutritionalInfo, setEditNutritionalInfo] = useState({
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
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
        video_url: '',
        nutritional_info: {
            calories: '',
            protein: '',
            carbs: '',
            fat: ''
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
                toast.error("Kategoriler yüklenirken bir hata oluştu.");
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
                // Map API response to component's expected data structure
                const mappedRecipes = response.data.map(recipe => ({
                    id: recipe.id,
                    title: recipe.name,
                    description: recipe.description || "",  // Map description field
                    category_id: recipe.category_id,
                    image: "/placeholder.png",  // API doesn't provide image
                    video_url: recipe.hasVideo ? recipe.video : "",
                    ingredients: recipe.malzemeler,
                    instructions: recipe.hazirlanis,
                    nutritional_info: {
                        calories: recipe.kcal,
                        protein: recipe.protein,
                        carbs: recipe.karbonhidrat,
                        fat: recipe.yag
                    }
                }));
                setRecipeData(mappedRecipes);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching recipes:", error);
                toast.error("Tarifler yüklenirken bir hata oluştu.");
                setLoading(false);
            });
    };

    // Initial fetch
    useEffect(() => {
        fetchRecipes();
    }, []);

    // Filter categories based on search term
    const filteredCategories = categoryData?.filter(category =>
        (category?.name || category?.title || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter recipes based on selected categories
    const filteredRecipeData = recipeData.filter(item => {
        // If no categories are checked, show all items
        if (checkedCategories.length === 0) {
            return true;
        }
        // Otherwise, show only items that belong to checked categories
        return checkedCategories.includes(item.category_id);
    });

    // Category handlers
    const handleCategoryCheck = (categoryId) => {
        setCheckedCategories(prev => 
            prev.includes(categoryId) 
                ? prev.filter(id => id !== categoryId) 
                : [...prev, categoryId]
        );
    };

    const handleOpenMultiDeleteConfirm = () => {
        if (checkedCategories.length === 0) return;
        
        // Find recipes that would be affected by deleting these categories
        const recipesToDelete = recipeData.filter(recipe => 
            checkedCategories.includes(recipe.category_id)
        );
        
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
        
        // Set form fields with current values
        setEditTitle(item.title || '');
        setEditDescription(item.description || '');
        setEditIngredients(item.ingredients || '');
        setEditInstructions(item.instructions || '');
        setEditCategoryId(item.category_id || '');
        setEditVideoUrl(item.video_url || '');
        
        // Set nutritional info or initialize with empty values
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

    return (
        <Default>
            <div className="tarifler-container">
                {/* Left Panel - Categories */}
                <div className="categories-panel">
                    <div className="panel-header">
                        <div className="search-container">
                            <SearchIcon className="search-icon" />
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
                                onClick={() => setAddRecipeModal(true)}
                            >
                                <AddIcon />
                                <span className="btn-text">Tarif Ekle</span>
                            </button>
                            <button 
                                className="action-btn add-btn" 
                                title="Kategori Ekle"
                                onClick={() => setAddCategoryModal(true)}
                            >
                                <AddIcon />
                                <span className="btn-text">Kategori Ekle</span>
                            </button>
                            <button 
                                className="action-btn delete-btn" 
                                title="Seçilenleri Sil"
                                onClick={handleOpenMultiDeleteConfirm}
                                disabled={checkedCategories.length === 0}
                            >
                                <DeleteIcon />
                            </button>
                        </div>
                    </div>

                    <div className="categories-list">
                        {filteredCategories && filteredCategories.length > 0 ? (
                            filteredCategories.map((category) => (
                                <CategoryItem
                                    key={category.id}
                                    category={category}
                                    isChecked={checkedCategories.includes(category.id)}
                                    onCheck={() => handleCategoryCheck(category.id)}
                                    onDelete={handleOpenCategoryDeleteConfirm}
                                />
                            ))
                        ) : (
                            <div className="no-categories">Kategori bulunamadı.</div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Recipe Cards */}
                <div className="recipes-panel">
                    <div className="recipe-cards-grid">
                        {loading ? (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p>Tarifler yükleniyor...</p>
                            </div>
                        ) : filteredRecipeData.length > 0 ? (
                            filteredRecipeData.map((item) => (
                                <RecipeCard 
                                    key={item.id}
                                    item={item}
                                    onPrint={handlePrint}
                                    onEdit={handleEdit}
                                    onDelete={handleOpenDeleteConfirm}
                                    onView={handleViewRecipe}
                                />
                            ))
                        ) : (
                            <div className="no-recipes">
                                <p>Bu kategoriye ait tarif bulunamadı.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            <Modal 
                isOpen={detailModal} 
                title={detailItem?.title} 
                onClose={() => setDetailModal(false)}
            >
                <div className="recipe-detail-modal">
                    {detailItem?.image && !getYouTubeVideoId(detailItem.video_url) && (
                        <img 
                            src={detailItem.image} 
                            alt={detailItem.title}
                            className="recipe-detail-image"
                        />
                    )}
                    
                    {detailItem?.video_url && getYouTubeVideoId(detailItem.video_url) && (
                        <div className="recipe-video-container">
                            <iframe
                                width="100%"
                                height="315"
                                src={`https://www.youtube.com/embed/${getYouTubeVideoId(detailItem.video_url)}`}
                                title="Recipe Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    )}
                    
                    <div className="recipe-detail-content">
                        {detailItem?.description && (
                            <p className="recipe-description">{detailItem.description}</p>
                        )}
                        
                        {detailItem?.nutritional_info && (
                            <div className="recipe-detail-section nutritional-info-section">
                                <h3>Besin Değerleri</h3>
                                <div className="nutritional-info-grid">
                                    {detailItem.nutritional_info.calories && (
                                        <div className="nutritional-info-item">
                                            <span className="info-label">Kalori:</span>
                                            <span className="info-value">{detailItem.nutritional_info.calories} kcal</span>
                                        </div>
                                    )}
                                    {detailItem.nutritional_info.protein && (
                                        <div className="nutritional-info-item">
                                            <span className="info-label">Protein:</span>
                                            <span className="info-value">{detailItem.nutritional_info.protein} g</span>
                                        </div>
                                    )}
                                    {detailItem.nutritional_info.carbs && (
                                        <div className="nutritional-info-item">
                                            <span className="info-label">Karbonhidrat:</span>
                                            <span className="info-value">{detailItem.nutritional_info.carbs} g</span>
                                        </div>
                                    )}
                                    {detailItem.nutritional_info.fat && (
                                        <div className="nutritional-info-item">
                                            <span className="info-label">Yağ:</span>
                                            <span className="info-value">{detailItem.nutritional_info.fat} g</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        <div className="recipe-detail-section">
                            <h3>Malzemeler</h3>
                            <ul className="recipe-ingredients-list">
                                {detailItem?.ingredients?.split(',').map((ingredient, index) => (
                                    <li key={index}>{ingredient.trim()}</li>
                                ))}
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
                        <PrintIcon style={{ marginRight: '5px' }} /> PDF Oluştur
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
                        <label htmlFor="recipeVideoUrl">Video URL (Youtube)</label>
                        <input 
                            type="text" 
                            id="recipeVideoUrl"
                            className="text-input" 
                            value={newRecipe.video_url}
                            onChange={(e) => setNewRecipe({...newRecipe, video_url: e.target.value})}
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
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
                                        ...newRecipe, 
                                        nutritional_info: {
                                            ...newRecipe.nutritional_info,
                                            calories: e.target.value
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
                                        ...newRecipe, 
                                        nutritional_info: {
                                            ...newRecipe.nutritional_info,
                                            protein: e.target.value
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
                                        ...newRecipe, 
                                        nutritional_info: {
                                            ...newRecipe.nutritional_info,
                                            carbs: e.target.value
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
                                        ...newRecipe, 
                                        nutritional_info: {
                                            ...newRecipe.nutritional_info,
                                            fat: e.target.value
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
                            {categoryData.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name || category.title}
                                </option>
                            ))}
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
                            
                            // Prepare data for API
                            const recipeData = {
                                category_id: parseInt(newRecipe.category_id),
                                name: newRecipe.title,
                                description: newRecipe.description,
                                hasVideo: !!newRecipe.video_url,
                                video: newRecipe.video_url || null,
                                hazirlanis: newRecipe.instructions,
                                malzemeler: newRecipe.ingredients,
                                kcal: newRecipe.nutritional_info.calories || 0,
                                protein: newRecipe.nutritional_info.protein || 0,
                                karbonhidrat: newRecipe.nutritional_info.carbs || 0,
                                yag: newRecipe.nutritional_info.fat || 0
                            };
                            
                            // Send POST request to API
                            axios.post(
                                `${config[config.environment].apiUrl}/recipe/addRecipe`,
                                recipeData,
                                {
                                    headers: {
                                        Authorization: localStorage.getItem("token"),
                                    },
                                }
                            )
                            .then(response => {
                                // Refresh recipes list
                                fetchRecipes();
                                
                                // Show success message
                                setSuccessMessage("Tarif başarıyla eklendi.");
                                setShowSuccessPopup(true);
                                
                                // Reset form and close modal
                                setNewRecipe({
                                    title: '',
                                    description: '',
                                    ingredients: '',
                                    instructions: '',
                                    category_id: '',
                                    video_url: '',
                                    nutritional_info: {
                                        calories: '',
                                        protein: '',
                                        carbs: '',
                                        fat: ''
                                    }
                                });
                                setAddRecipeModal(false);
                            })
                            .catch(error => {
                                console.error("Error adding recipe:", error);
                                setErrorMessage("Tarif eklenirken bir hata oluştu.");
                                setShowErrorPopup(true);
                            });
                        }}
                        disabled={!newRecipe.title.trim() || !newRecipe.category_id}
                    >
                        Ekle
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
                            axios.post(
                                `${config[config.environment].apiUrl}/recipe/addRecipeCategory`,
                                categoryData,
                                {
                                    headers: {
                                        Authorization: localStorage.getItem("token"),
                                    },
                                }
                            )
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
                        <WarningIcon className="warning-icon" />
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
                            axios.delete(
                                `${config[config.environment].apiUrl}/recipe/deleteRecipe?recipe_id=${itemToDelete.id}`,
                                {
                                    headers: {
                                        Authorization: localStorage.getItem("token"),
                                    },
                                }
                            )
                            .then(response => {
                                if (response.data.success) {
                                    // Remove deleted recipe from state
                                    setRecipeData(prevData => 
                                        prevData.filter(recipe => recipe.id !== itemToDelete.id)
                                    );
                                    
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
                        <label htmlFor="editVideoUrl">Video URL (Youtube)</label>
                        <input 
                            type="text" 
                            id="editVideoUrl"
                            className="text-input" 
                            value={editVideoUrl}
                            onChange={(e) => setEditVideoUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
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
                                        ...editNutritionalInfo,
                                        calories: e.target.value
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
                                        ...editNutritionalInfo,
                                        protein: e.target.value
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
                                        ...editNutritionalInfo,
                                        carbs: e.target.value
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
                                        ...editNutritionalInfo,
                                        fat: e.target.value
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
                            {categoryData.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name || category.title}
                                </option>
                            ))}
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
                            
                            // Prepare data for API
                            const recipeData = {
                                recipe_id: selectedRecipe.id,
                                category_id: parseInt(editCategoryId),
                                name: editTitle,
                                description: editDescription,
                                hasVideo: !!editVideoUrl,
                                video: editVideoUrl || null,
                                hazirlanis: editInstructions,
                                malzemeler: editIngredients,
                                kcal: editNutritionalInfo.calories || 0,
                                protein: editNutritionalInfo.protein || 0,
                                karbonhidrat: editNutritionalInfo.carbs || 0,
                                yag: editNutritionalInfo.fat || 0
                            };
                            
                            // Send PUT request to API
                            axios.put(
                                `${config[config.environment].apiUrl}/recipe/updateRecipe`,
                                recipeData,
                                {
                                    headers: {
                                        Authorization: localStorage.getItem("token"),
                                    },
                                }
                            )
                            .then(response => {
                                // Map the updated recipe to our component's data structure
                                const updatedRecipe = {
                                    id: response.data.id,
                                    title: response.data.name,
                                    description: response.data.description || "",  // Map description field
                                    category_id: response.data.category_id,
                                    image: "/placeholder.png",  // API doesn't handle image
                                    video_url: response.data.hasVideo ? response.data.video : "",
                                    ingredients: response.data.malzemeler,
                                    instructions: response.data.hazirlanis,
                                    nutritional_info: {
                                        calories: response.data.kcal,
                                        protein: response.data.protein,
                                        carbs: response.data.karbonhidrat,
                                        fat: response.data.yag
                                    }
                                };
                                
                                // Update recipeData state
                                setRecipeData(prev => 
                                    prev.map(recipe => 
                                        recipe.id === selectedRecipe.id ? updatedRecipe : recipe
                                    )
                                );
                                
                                // Show success message
                                setSuccessMessage(`"${editTitle}" tarifi başarıyla güncellendi.`);
                                setShowSuccessPopup(true);
                                
                                // Reset saving state and close modal
                                setIsSaving(false);
                                setEditRecipeModal(false);
                            })
                            .catch(error => {
                                console.error("Error updating recipe:", error);
                                setErrorMessage("Tarif güncellenirken bir hata oluştu.");
                                setShowErrorPopup(true);
                                setIsSaving(false);
                            });
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
                        <WarningIcon className="warning-icon" />
                        <p className="warning-text">
                            <strong>{categoryToDelete?.name || categoryToDelete?.title}</strong> kategorisini silmek istediğinize emin misiniz?
                        </p>
                    </div>
                    <p className="delete-note">Bu işlem geri alınamaz.</p>
                    
                    {affectedRecipes.length > 0 && (
                        <div className="affected-recipes">
                            <p className="delete-note important">
                                <strong>Önemli:</strong> Bu kategori ile ilişkili <strong>{affectedRecipes.length}</strong> tarif silinecektir:
                            </p>
                            <ul className="affected-recipes-list">
                                {affectedRecipes.map(recipe => (
                                    <li key={recipe.id}><span className="recipe-title">{recipe.title}</span></li>
                                ))}
                            </ul>
                        </div>
                    )}
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
                            axios.delete(
                                `${config[config.environment].apiUrl}/recipe/deleteRecipeCategory?recipe_category_id=${categoryToDelete.id}`,
                                {
                                    headers: {
                                        Authorization: localStorage.getItem("token"),
                                    },
                                }
                            )
                            .then(response => {
                                if (response.data.success) {
                                    // Remove deleted category from state
                                    setCategoryData(prevData => 
                                        prevData.filter(category => category.id !== categoryToDelete.id)
                                    );
                                    
                                    // Remove category from checked categories if it's there
                                    setCheckedCategories(prev => 
                                        prev.filter(id => id !== categoryToDelete.id)
                                    );
                                    
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
                        <WarningIcon className="warning-icon" />
                        <p className="warning-text">
                            <strong>{checkedCategories.length}</strong> kategoriyi silmek istediğinize emin misiniz?
                        </p>
                    </div>
                    <p className="delete-note">Bu işlem geri alınamaz.</p>
                    
                    {affectedRecipes.length > 0 && (
                        <div className="affected-recipes">
                            <p className="delete-note important">
                                <strong>Önemli:</strong> Bu kategoriler ile ilişkili <strong>{affectedRecipes.length}</strong> tarif silinecektir:
                            </p>
                            <ul className="affected-recipes-list">
                                {affectedRecipes.map(recipe => (
                                    <li key={recipe.id}><span className="recipe-title">{recipe.title}</span></li>
                                ))}
                            </ul>
                        </div>
                    )}
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
                            const deletePromises = checkedCategories.map(categoryId => 
                                axios.delete(
                                    `${config[config.environment].apiUrl}/recipe/deleteRecipeCategory?recipe_category_id=${categoryId}`,
                                    {
                                        headers: {
                                            Authorization: localStorage.getItem("token"),
                                        },
                                    }
                                )
                            );
                            
                            // Execute all deletion requests
                            Promise.all(deletePromises)
                                .then(responses => {
                                    // Check if all deletions were successful
                                    const allSuccessful = responses.every(response => response.data.success);
                                    
                                    if (allSuccessful) {
                                        // Remove deleted categories from state
                                        setCategoryData(prevData => 
                                            prevData.filter(category => !checkedCategories.includes(category.id))
                                        );
                                        
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

            {/* Success and Error Popups */}
            {showSuccessPopup && (
                <div className="success-popup">
                    <div className="success-popup-content">
                        <CheckCircleIcon className="success-icon" />
                        <p>{successMessage}</p>
                    </div>
                </div>
            )}

            {showErrorPopup && (
                <div className="error-popup">
                    <div className="error-popup-content">
                        <ErrorIcon className="error-icon" />
                        <p>{errorMessage}</p>
                    </div>
                </div>
            )}
        </Default>
    );
}