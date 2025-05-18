import React, { useEffect, useState, useRef } from 'react';
import './Beslenme.css';
import Default from "../../Components/Layouts/Default.jsx";
import axios from "axios";
import config from "../../config.js";

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { Autocomplete, TextField } from '@mui/material';

// Days and meals constants
const DAYS_OF_WEEK = [
    "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"
];

const MEALS = [
    "Kahvaltı", "Öğle Yemeği", "Akşam Yemeği", "Aparatif"
];

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

const NutritionCard = ({ item, onAddToUser, onPrint, onEdit, onDelete, onView }) => {
    return (
        <div className="nutrition-card">
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
                
                <div className="card-actions">
                    <button 
                        className="action-button add-user-btn" 
                        title="Danışana Ekle"
                        onClick={() => onAddToUser(item)}
                    >
                        <PersonAddIcon />
                    </button>
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

// Meal Plan Table Component
const MealPlanTable = ({ mealPlan, onMealChange, selectedDay, onDayChange }) => {
    // Helper function to get all meal items as a flat array
    const getMealItemsArray = (mealData) => {
        if (!mealData) return [];
        
        // For simple array format
        if (Array.isArray(mealData)) {
            return [...mealData];
        }
        
        // For complex format with main and alternatives
        if (mealData.main && Array.isArray(mealData.main)) {
            return [...mealData.main];
        }
        
        // For string format (backward compatibility)
        if (typeof mealData === 'string') {
            return mealData.split(',').map(item => item.trim()).filter(item => item !== '');
        }
        
        return [];
    };
    
    // Helper function to get alternatives for a specific item
    const getAlternativesForItem = (mealData, itemName) => {
        if (!mealData || !mealData.alternatives || !mealData.alternatives[itemName]) {
            return [];
        }
        return mealData.alternatives[itemName];
    };
    
    // Helper function to add a main meal item
    const addMainItem = (day, meal, newItem) => {
        if (!newItem.trim()) return;
        
        const currentData = mealPlan[day][meal];
        let updatedData;
        
        // Handle different formats
        if (Array.isArray(currentData)) {
            // Simple array format
            updatedData = [...currentData, newItem.trim()];
        } else if (currentData && currentData.main) {
            // Complex format with main and alternatives
            updatedData = {
                ...currentData,
                main: [...currentData.main, newItem.trim()]
            };
        } else if (typeof currentData === 'string') {
            // String format (backward compatibility)
            const items = currentData ? 
                currentData.split(',').map(item => item.trim()).filter(item => item !== '') : 
                [];
            updatedData = [...items, newItem.trim()];
        } else {
            // Initialize new complex format
            updatedData = {
                main: [newItem.trim()],
                alternatives: {}
            };
        }
        
        onMealChange(day, meal, updatedData);
    };
    
    // Helper function to remove a main meal item
    const removeMainItem = (day, meal, indexToRemove) => {
        const currentData = mealPlan[day][meal];
        let updatedData;
        let removedItemName = '';
        
        // Handle different formats
        if (Array.isArray(currentData)) {
            // Simple array format
            removedItemName = currentData[indexToRemove];
            updatedData = currentData.filter((_, index) => index !== indexToRemove);
        } else if (currentData && currentData.main) {
            // Complex format with main and alternatives
            removedItemName = currentData.main[indexToRemove];
            const newMain = currentData.main.filter((_, index) => index !== indexToRemove);
            
            // Also remove alternatives for this item if they exist
            const newAlternatives = {...currentData.alternatives};
            if (newAlternatives[removedItemName]) {
                delete newAlternatives[removedItemName];
            }
            
            updatedData = {
                main: newMain,
                alternatives: newAlternatives
            };
        } else if (typeof currentData === 'string') {
            // String format (backward compatibility)
            const items = currentData.split(',').map(item => item.trim()).filter(item => item !== '');
            removedItemName = items[indexToRemove];
            updatedData = items.filter((_, index) => index !== indexToRemove);
        }
        
        // Close alternatives UI if the removed item was selected
        if (selectedMainItem === removedItemName && showAlternatives[meal]) {
            setShowAlternatives(prev => ({
                ...prev,
                [meal]: false
            }));
            setSelectedMainItem('');
        }
        
        onMealChange(day, meal, updatedData);
    };
    
    // Helper function to add an alternative for a main item
    const addAlternative = (day, meal, mainItem, alternativeItem) => {
        if (!alternativeItem.trim() || !mainItem) return;
        
        const currentData = mealPlan[day][meal];
        let updatedData;
        
        // Convert to complex format if needed
        if (Array.isArray(currentData)) {
            // Convert simple array to complex format
            updatedData = {
                main: [...currentData],
                alternatives: {
                    [mainItem]: [alternativeItem.trim()]
                }
            };
        } else if (currentData && currentData.main) {
            // Add to existing complex format
            const newAlternatives = {...currentData.alternatives};
            
            if (newAlternatives[mainItem]) {
                newAlternatives[mainItem] = [...newAlternatives[mainItem], alternativeItem.trim()];
            } else {
                newAlternatives[mainItem] = [alternativeItem.trim()];
            }
            
            updatedData = {
                main: [...currentData.main],
                alternatives: newAlternatives
            };
        } else if (typeof currentData === 'string') {
            // Convert string format to complex format
            const items = currentData ? 
                currentData.split(',').map(item => item.trim()).filter(item => item !== '') : 
                [];
            
            updatedData = {
                main: items,
                alternatives: {
                    [mainItem]: [alternativeItem.trim()]
                }
            };
        }
        
        onMealChange(day, meal, updatedData);
    };
    
    // Helper function to remove an alternative
    const removeAlternative = (day, meal, mainItem, alternativeIndex) => {
        const currentData = mealPlan[day][meal];
        
        if (!currentData || !currentData.alternatives || !currentData.alternatives[mainItem]) {
            return;
        }
        
        const newAlternatives = {...currentData.alternatives};
        newAlternatives[mainItem] = newAlternatives[mainItem].filter((_, index) => index !== alternativeIndex);
        
        // Remove the alternatives entry if empty
        if (newAlternatives[mainItem].length === 0) {
            delete newAlternatives[mainItem];
        }
        
        const updatedData = {
            main: [...currentData.main],
            alternatives: newAlternatives
        };
        
        onMealChange(day, meal, updatedData);
    };
    
    const [selectedMainItem, setSelectedMainItem] = useState('');
    const [alternativeInput, setAlternativeInput] = useState('');
    const [showAlternatives, setShowAlternatives] = useState({});
    const [recipes, setRecipes] = useState([]);
    const [newMealInputs, setNewMealInputs] = useState({});
    
    // Fetch recipes when component mounts
    useEffect(() => {
        axios.get(`${config[config.environment].apiUrl}/recipe/getMyRecipes`, {
            headers: { Authorization: localStorage.getItem("token") }
        })
        .then(response => {
            setRecipes(response.data);
        })
        .catch(error => {
            console.error("Error fetching recipes:", error);
        });
    }, []);
    
    // Toggle showing alternatives for a specific meal
    const toggleAlternatives = (meal) => {
        setShowAlternatives(prev => ({
            ...prev,
            [meal]: !prev[meal]
        }));
    };
    
    // Handle meal input change
    const handleMealInputChange = (meal, newValue) => {
        setNewMealInputs(prev => ({
            ...prev,
            [meal]: newValue
        }));
    };
    
    // Add meal when selecting or typing a value
    const handleAddMealItem = (meal, value) => {
        if (!value) return;
        
        addMainItem(selectedDay, meal, value);
        // Clear the input after adding
        setNewMealInputs(prev => ({
            ...prev,
            [meal]: ''
        }));
    };
    
    return (
        <div className="meal-plan-container">
            <div className="day-tabs">
                {DAYS_OF_WEEK.map((day) => (
                    <button 
                        key={day} 
                        className={`day-tab ${selectedDay === day ? 'active' : ''}`}
                        onClick={() => onDayChange(day)}
                    >
                        {day}
                    </button>
                ))}
            </div>
            
            <div className="meal-plan-content">
                {MEALS.map((meal) => {
                    const mealData = mealPlan[selectedDay][meal];
                    const mainItems = getMealItemsArray(mealData);
                    
                    return (
                        <div key={meal} className="meal-row">
                            <div className="meal-label">
                                <RestaurantIcon className="meal-icon" />
                                <span>{meal}</span>
                            </div>
                            <div className="meal-input-container">
                                <div className="simple-meal-editor">
                                    <div className="meal-items-container">
                                        {mainItems.map((item, index) => (
                                            <div key={index} className="meal-item">
                                                <span>{item}</span>
                                                <button 
                                                    className="meal-item-options" 
                                                    onClick={() => {
                                                        setSelectedMainItem(item);
                                                        toggleAlternatives(meal);
                                                    }}
                                                    title="Alternatif Ekle"
                                                >
                                                    •••
                                                </button>
                                                <button 
                                                    className="remove-meal-item" 
                                                    onClick={() => removeMainItem(selectedDay, meal, index)}
                                                >
                                                    <CloseIcon fontSize="small" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Main meal input with Autocomplete */}
                                    <div className="add-meal-item-container">
                                        <Autocomplete
                                            freeSolo
                                            options={recipes.map(recipe => recipe.name)}
                                            value={newMealInputs[meal] || ''}
                                            onChange={(event, newValue) => {
                                                if (newValue) {
                                                    handleAddMealItem(meal, newValue);
                                                }
                                            }}
                                            onInputChange={(event, newInputValue) => {
                                                handleMealInputChange(meal, newInputValue);
                                            }}
                                            renderInput={(params) => (
                                                <TextField 
                                                    {...params}
                                                    placeholder={`${meal} için yiyecek ekleyin...`}
                                                    variant="outlined"
                                                    size="small"
                                                    fullWidth
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && newMealInputs[meal]?.trim()) {
                                                            handleAddMealItem(meal, newMealInputs[meal].trim());
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                />
                                            )}
                                            className="recipe-autocomplete"
                                        />
                                        <button 
                                            className="add-meal-button"
                                            onClick={() => {
                                                if (newMealInputs[meal]?.trim()) {
                                                    handleAddMealItem(meal, newMealInputs[meal].trim());
                                                }
                                            }}
                                        >
                                            <AddIcon />
                                        </button>
                                    </div>
                                    
                                    {/* Alternatives section */}
                                    {showAlternatives[meal] && selectedMainItem && (
                                        <div className="alternatives-section">
                                            <div className="alternatives-header">
                                                <h4>"{selectedMainItem}" için Alternatifler</h4>
                                                <button 
                                                    className="close-alternatives-btn"
                                                    onClick={() => {
                                                        setShowAlternatives(prev => ({...prev, [meal]: false}));
                                                        setSelectedMainItem('');
                                                    }}
                                                >
                                                    <CloseIcon fontSize="small" />
                                                </button>
                                            </div>
                                            
                                            <div className="alternatives-items">
                                                {mealData && 
                                                 mealData.alternatives && 
                                                 mealData.alternatives[selectedMainItem] && 
                                                 mealData.alternatives[selectedMainItem].map((alt, index) => (
                                                    <div key={index} className="alternative-item">
                                                        <span>{alt}</span>
                                                        <button 
                                                            className="remove-alternative-item" 
                                                            onClick={() => removeAlternative(selectedDay, meal, selectedMainItem, index)}
                                                        >
                                                            <CloseIcon fontSize="small" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <div className="add-alternative-container">
                                                <input
                                                    type="text"
                                                    className="add-alternative-input"
                                                    placeholder="Alternatif ekleyin..."
                                                    value={alternativeInput}
                                                    onChange={(e) => setAlternativeInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && alternativeInput.trim()) {
                                                            addAlternative(selectedDay, meal, selectedMainItem, alternativeInput);
                                                            setAlternativeInput('');
                                                        }
                                                    }}
                                                />
                                                <button 
                                                    className="add-alternative-button"
                                                    onClick={() => {
                                                        if (alternativeInput.trim()) {
                                                            addAlternative(selectedDay, meal, selectedMainItem, alternativeInput);
                                                            setAlternativeInput('');
                                                        }
                                                    }}
                                                >
                                                    <AddIcon />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// View Meal Plan Component
const ViewMealPlan = ({ mealPlan, onClose, programTitle, onExportPdf }) => {
    // Helper function to get meal items and their alternatives
    const getMealContent = (mealData) => {
        if (!mealData) return { mainItems: [], hasAlternatives: false };
        
        // Handle array format (simple list of items)
        if (Array.isArray(mealData)) {
            return { 
                mainItems: mealData,
                hasAlternatives: false 
            };
        }
        
        // Handle complex format with main and alternatives
        if (mealData.main && Array.isArray(mealData.main)) {
            return {
                mainItems: mealData.main,
                hasAlternatives: mealData.alternatives && Object.keys(mealData.alternatives).length > 0,
                alternatives: mealData.alternatives
            };
        }
        
        // Handle string format (backward compatibility)
        if (typeof mealData === 'string') {
            const items = mealData.split(',').map(item => item.trim()).filter(item => item !== '');
            return {
                mainItems: items,
                hasAlternatives: false
            };
        }
        
        return { mainItems: [], hasAlternatives: false };
    };
    
    return (
        <div className="view-meal-plan-container">
            <div className="view-meal-plan-header">
                <h2>{programTitle} Programı</h2>
                <button className="export-pdf-button" onClick={onExportPdf}>
                    <FileDownloadIcon />
                    PDF İndir
                </button>
            </div>
            
            <div className="view-meal-plan-days">
                {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="day-card">
                        <div className="day-header">{day}</div>
                        <div className="day-meals">
                            {MEALS.map(meal => {
                                const { mainItems, hasAlternatives, alternatives } = getMealContent(
                                    mealPlan && mealPlan[day] ? mealPlan[day][meal] : null
                                );
                                
                                return (
                                    <div key={meal} className="meal-block">
                                        <div className="meal-name">{meal}</div>
                                        <div className="meal-content">
                                            {mainItems.length > 0 ? (
                                                <div>
                                                    <ul className="meal-items-list">
                                                        {mainItems.map((item, index) => (
                                                            <li key={index} className="meal-item-with-alternatives">
                                                                <span className="main-meal-item">{item}</span>
                                                                
                                                                {hasAlternatives && alternatives && alternatives[item] && (
                                                                    <ul className="alternatives-list">
                                                                        {alternatives[item].map((alt, altIndex) => (
                                                                            <li key={altIndex} className="alternative-item">
                                                                                <span className="alternative-prefix">alternatif: </span>
                                                                                {alt}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : (
                                                <p className="no-meal-data">Veri girilmemiş</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function Beslenme() {
    const [categoryData, setCategoryData] = useState([]);
    const [checkedCategories, setCheckedCategories] = useState([]);
    const [danisanList, setDanisanList] = useState([]);
    const [beslenmeData, setBeslenmeData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [addToUserModal, setAddToUserModal] = useState(false);
    const [detailModal, setDetailModal] = useState(false);
    const [addCategoryModal, setAddCategoryModal] = useState(false);
    const [addPlanModal, setAddPlanModal] = useState(false);
    const [editProgramModal, setEditProgramModal] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [detailItem, setDetailItem] = useState(null);
    const [newCategoryTitle, setNewCategoryTitle] = useState('');
    const [assignmentNote, setAssignmentNote] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    // Edit program states
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editCategoryId, setEditCategoryId] = useState('');
    
    // Success popup states
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
    // Error popup states
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
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
    
    // New plan state
    const [newPlan, setNewPlan] = useState({
        title: '',
        description: '',
        category_id: ''
    });
    
    // Delete confirmation modal states
    const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteCategoryConfirmModal, setDeleteCategoryConfirmModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [deleteMultiCategoriesConfirmModal, setDeleteMultiCategoriesConfirmModal] = useState(false);
    const [affectedPlans, setAffectedPlans] = useState([]);

    // Meal planning states
    const [selectedDay, setSelectedDay] = useState(DAYS_OF_WEEK[0]);
    const [mealPlan, setMealPlan] = useState(() => {
        // Initialize empty meal plan structure
        const initialPlan = {};
        DAYS_OF_WEEK.forEach(day => {
            initialPlan[day] = {};
            MEALS.forEach(meal => {
                initialPlan[day][meal] = [];
            });
        });
        return initialPlan;
    });

    const [viewProgramModal, setViewProgramModal] = useState(false);
    const mealPlanRef = useRef(null);

    // Edit form state
    const [isSaving, setIsSaving] = useState(false);

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

    // Fetch nutrition categories
    useEffect(() => {
        axios
            .get(`${config[config.environment].apiUrl}/dietitian/getNutritionCategories`, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            })
            .then((response) => {
                setCategoryData(response.data);
            })
            .catch((error) => {
                console.error("Error fetching categories:", error);
                setCategoryData([]);
            });
    }, []);

    // Fetch nutrition plans
    const fetchNutritionPlans = () => {
        setLoading(true);
        axios
            .get(`${config[config.environment].apiUrl}/dietitian/getNutritionPlans`, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            })
            .then((response) => {
                setBeslenmeData(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching nutrition plans:", error);
                setBeslenmeData([]);
                setLoading(false);
            });
    };

    // Initial fetch
    useEffect(() => {
        fetchNutritionPlans();
    }, []);

    // Filter categories based on search term
    const filteredCategories = categoryData?.filter(category =>
        (category?.name || category?.title || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter nutrition programs based on selected categories
    const filteredBeslenmeData = beslenmeData.filter(item => {
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
        
        // Find plans that would be affected by deleting these categories
        const plansToDelete = beslenmeData.filter(plan => 
            checkedCategories.includes(plan.category_id)
        );
        
        setAffectedPlans(plansToDelete);
        setDeleteMultiCategoriesConfirmModal(true);
    };

    const handleMultiDelete = () => {
        const deletePromises = checkedCategories.map(categoryId => 
            axios.delete(`${config[config.environment].apiUrl}/dietitian/deleteNutritionCategory?category_id=${categoryId}`, {
                headers: { Authorization: localStorage.getItem("token") }
            })
        );
        
        // Execute all promises
        Promise.all(deletePromises)
            .then(() => {
                // Update local state after successful deletion
                setCategoryData(prev => 
                    prev.filter(cat => !checkedCategories.includes(cat.id))
                );
                // Also remove any plans that were in the deleted categories
                setBeslenmeData(prev => 
                    prev.filter(plan => !checkedCategories.includes(plan.category_id))
                );
                
                const categoryCount = checkedCategories.length;
                setCheckedCategories([]);
                setDeleteMultiCategoriesConfirmModal(false);
                setAffectedPlans([]);
                
                // Show success popup
                setSuccessMessage(`${categoryCount} kategori başarıyla silindi.`);
                setShowSuccessPopup(true);
            })
            .catch(error => {
                console.error("Error deleting categories:", error);
                setDeleteMultiCategoriesConfirmModal(false);
                setAffectedPlans([]);
            });
    };

    const handleOpenCategoryDeleteConfirm = (categoryId) => {
        const category = categoryData.find(cat => cat.id === categoryId);
        if (!category) return;
        
        // Find plans that would be affected by deleting this category
        const plansToDelete = beslenmeData.filter(plan => plan.category_id === categoryId);
        
        setCategoryToDelete(category);
        setAffectedPlans(plansToDelete);
        setDeleteCategoryConfirmModal(true);
    };

    const handleSingleCategoryDelete = () => {
        if (!categoryToDelete) return;
        
        axios.delete(`${config[config.environment].apiUrl}/dietitian/deleteNutritionCategory?category_id=${categoryToDelete.id}`, {
            headers: { Authorization: localStorage.getItem("token") }
        })
        .then(() => {
            // Update local state after successful deletion
            setCategoryData(prev => prev.filter(cat => cat.id !== categoryToDelete.id));
            setCheckedCategories(prev => prev.filter(id => id !== categoryToDelete.id));
            // Also remove any plans that were in the deleted category
            setBeslenmeData(prev => prev.filter(plan => plan.category_id !== categoryToDelete.id));
            setDeleteCategoryConfirmModal(false);
            setCategoryToDelete(null);
            setAffectedPlans([]);
            
            // Show success popup
            setSuccessMessage(`"${categoryToDelete.name || categoryToDelete.title}" kategorisi başarıyla silindi.`);
            setShowSuccessPopup(true);
        })
        .catch(error => {
            console.error("Error deleting category:", error);
            setDeleteCategoryConfirmModal(false);
            setCategoryToDelete(null);
            setAffectedPlans([]);
        });
    };

    const handleAddCategory = () => {
        if (newCategoryTitle.trim() === '') return;
        
        const newCategory = {
            category_name: newCategoryTitle.trim()
        };
        
        // Make API call to add the category
        axios.post(`${config[config.environment].apiUrl}/dietitian/addNutritionCategory`, newCategory, {
            headers: { Authorization: localStorage.getItem("token") }
        })
        .then(response => {
            // Add the new category to the state
            setCategoryData([...categoryData, response.data]);
            setNewCategoryTitle('');
            setAddCategoryModal(false);
        })
        .catch(error => {
            console.error("Error adding category:", error);
            // You might want to show an error message to the user here
        });
    };

    const handleAddPlan = () => {
        if (!newPlan.title.trim() || !newPlan.category_id) return;
        
        const planData = {
            title: newPlan.title.trim(),
            description: newPlan.description.trim(),
            category_id: newPlan.category_id,
            mealPlan: {}
        };
        
        // Initialize the meal plan structure with empty arrays
        DAYS_OF_WEEK.forEach(day => {
            planData.mealPlan[day] = {};
            MEALS.forEach(meal => {
                planData.mealPlan[day][meal] = [];
            });
        });
        
        // Make API call to add the plan
        axios.post(`${config[config.environment].apiUrl}/dietitian/addNutritionPlan`, planData, {
            headers: { Authorization: localStorage.getItem("token") }
        })
        .then(response => {
            // Add the new plan to the state
            setBeslenmeData([...beslenmeData, response.data]);
            // Reset form
            setNewPlan({
                title: '',
                description: '',
                category_id: ''
            });
            setAddPlanModal(false);
            
            // Show success message
            setSuccessMessage(`"${planData.title}" programı başarıyla oluşturuldu.`);
            setShowSuccessPopup(true);
        })
        .catch(error => {
            console.error("Error adding plan:", error);
            // Show error message
            setErrorMessage(error.response?.data?.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
            setShowErrorPopup(true);
        });
    };

    // Nutrition card handlers
    const handleOpenDetailModal = (item) => {
        setDetailItem(item);
        setDetailModal(true);
    };

    const handleOpenAddToUserModal = (item) => {
        setSelectedProgram(item);
        // Set default dates (today and a week from today)
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        // Format dates as YYYY-MM-DD
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        setStartDate(formatDate(today));
        setEndDate(formatDate(nextWeek));
        setAssignmentNote('');
        setSelectedUser(null);
        setAddToUserModal(true);
    };

    const handleAddToUser = () => {
        if (!selectedProgram || !selectedUser || !startDate || !endDate) return;
        
        const addData = {
            client_id: selectedUser.id,
            nutrition_plan_id: selectedProgram.id,
            start_date: startDate,
            end_date: endDate,
            note: assignmentNote
        };
        
        axios.post(`${config[config.environment].apiUrl}/dietitian/assignNutritionPlanToClient`, addData, {
            headers: { Authorization: localStorage.getItem("token") }
        })
        .then(response => {
            // Check if response has an error message
            if (response.data && response.data.message && !response.data.ok) {
                setErrorMessage(response.data.message || "Bir hata oluştu.");
                setShowErrorPopup(true);
                return;
            }
            
            // Success case - store info for success message
            const programName = selectedProgram.title;
            const userName = selectedUser.name;
            
            // Close the modal and reset states
            setAddToUserModal(false);
            setSelectedProgram(null);
            setSelectedUser(null);
            setStartDate('');
            setEndDate('');
            setAssignmentNote('');
            
            // Show success popup
            setSuccessMessage(`"${programName}" programı "${userName}" danışanına başarıyla atandı. Danışanınız bu plana göre yediklerini işaretleyebilecek.`);
            setShowSuccessPopup(true);
        })
        .catch(error => {
            console.error("Error assigning plan to client:", error);
            // Show error popup with specific message from API if available
            setErrorMessage(error.response?.data?.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
            setShowErrorPopup(true);
        });
    };

    const handlePrint = (item) => {
        console.log("Printing:", item);
        // Use the same PDF export functionality
        generatePDF(item);
    };

    // Shared PDF generation function
    const generatePDF = (program) => {
        // Create a new PDF document with landscape orientation for better layout
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });
        
        // Get dietitian name from localStorage or use a default
        const dietitianName = "Dr. Ayşe Yılmaz"; // In a real app, get this from user profile
        
        // Set background color for header - using green theme
        doc.setFillColor(76, 175, 80); // Green primary color
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), 25, 'F');
        
        // Add title with white text
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text(`${program.title} Beslenme Programi`, 14, 15);
        
        // Reset text color to black
        doc.setTextColor(0, 0, 0);
        
        // Add date and dietitian info
        doc.setFontSize(10);
        const today = new Date();
        const dateStr = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`;
        doc.text(`Olusturulma Tarihi: ${dateStr}`, 14, 30);
        doc.text(`Diyetisyen: ${dietitianName}`, 14, 35);
        
        // Add a decorative line
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(14, 38, doc.internal.pageSize.getWidth() - 14, 38);
        
        // Calculate dimensions for the grid layout - make sure all 7 days fit on one page
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;
        const usableWidth = pageWidth - (margin * 2);
        
        // Optimize for single page - 7 days in a compact layout
        const daysPerRow = 4; // First row has 4 days
        const dayWidth = usableWidth / 4; // Width based on 4 columns
        const dayHeight = 50; // Smaller height to fit on one page
        
        // Start position
        let xPos = margin;
        let yPos = 45; // Start after the header
        let dayCount = 0;
        
        // Helper function to extract meal items from different formats
        const getMealItems = (mealData) => {
            if (!mealData) return [];
            
            // For complex format with main and alternatives
            if (mealData.main && Array.isArray(mealData.main)) {
                return mealData.main;
            }
            
            // For simple array format
            if (Array.isArray(mealData)) {
                return mealData;
            }
            
            // For string format (backward compatibility)
            if (typeof mealData === 'string') {
                return mealData.split(',').map(item => item.trim()).filter(item => item !== '');
            }
            
            return [];
        };
        
        // Loop through days
        DAYS_OF_WEEK.forEach((day, index) => {
            // For the last 3 days (5, 6, 7), put them on the second row
            if (index === 4) {
                xPos = margin + dayWidth/2; // Center the last 3 days
                yPos += dayHeight + 5;
            }
            
            // Draw day card with rounded corners and shadow effect
            // First draw shadow
            doc.setFillColor(230, 230, 230);
            doc.roundedRect(xPos + 1, yPos + 1, dayWidth - 7, dayHeight, 3, 3, 'F');
            
            // Then draw card
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(xPos, yPos, dayWidth - 7, dayHeight, 3, 3, 'F');
            
            // Day header background - use orange for weekends, green for weekdays
            if (day === "Cumartesi" || day === "Pazar") {
                doc.setFillColor(255, 152, 0); // Orange for weekends
            } else {
                doc.setFillColor(76, 175, 80); // Green for weekdays
            }
            doc.roundedRect(xPos, yPos, dayWidth - 7, 8, 3, 3, 'F');
            
            // Day header text
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            const safeDayName = day.replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
                .replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ö/g, 'o');
            doc.text(safeDayName, xPos + 5, yPos + 5.5);
            
            // Reset text color
            doc.setTextColor(0, 0, 0);
            
            // Draw meals
            let mealYPos = yPos + 12;
            
            MEALS.forEach((meal, mealIndex) => {
                // Meal name
                doc.setFontSize(7);
                doc.setFont('helvetica', 'bold');
                const safeMeal = meal.replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
                    .replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ö/g, 'o');
                doc.text(`${safeMeal}:`, xPos + 2, mealYPos);
                doc.setFont('helvetica', 'normal');
                
                // Meal content
                if (program.mealPlan && 
                    program.mealPlan[day] && 
                    program.mealPlan[day][meal]) {
                    
                    const mealItems = getMealItems(program.mealPlan[day][meal]);
                    
                    if (mealItems.length > 0) {
                        // Limit to first 2 items to save space
                        const displayItems = mealItems.slice(0, 2);
                        let itemYPos = mealYPos + 3;
                        
                        displayItems.forEach((item, idx) => {
                            // Replace Turkish characters with their ASCII equivalents
                            const safeItem = item.replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
                                .replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ö/g, 'o');
                            doc.setFontSize(6);
                            doc.text(`• ${safeItem}`, xPos + 4, itemYPos);
                            itemYPos += 3;
                        });
                        
                        // Show count of additional items if any
                        if (mealItems.length > 2) {
                            doc.setFontSize(6);
                            doc.text(`... ve ${mealItems.length - 2} diger item`, xPos + 4, itemYPos);
                        }
                    } else {
                        doc.setFontSize(6);
                        doc.text("Veri girilmemis", xPos + 4, mealYPos + 3);
                    }
                } else {
                    doc.setFontSize(6);
                    doc.text("Veri girilmemis", xPos + 4, mealYPos + 3);
                }
                
                // Calculate space for next meal based on number of meals
                const mealSpacing = (dayHeight - 15) / MEALS.length;
                mealYPos += mealSpacing;
            });
            
            // Move to next day position
            xPos += dayWidth;
            dayCount++;
        });
        
        // Add footer with green line
        doc.setDrawColor(76, 175, 80);
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        
        // Add dietitian contact info in footer
        doc.setFontSize(8);
        doc.setTextColor(76, 175, 80);
        doc.text("Saglikli gunler dileriz!", margin, pageHeight - 10);
        doc.setTextColor(255, 152, 0);
        doc.text("www.diyetisyen.com", pageWidth / 2 - 15, pageHeight - 10);
        
        // Save the PDF
        doc.save(`${program.title}_beslenme_programi.pdf`);
    };

    const handleEdit = (item) => {
        setSelectedProgram(item);
        
        // Set form fields with current values
        setEditTitle(item.title || '');
        setEditDescription(item.description || '');
        setEditCategoryId(item.category_id || '');
        
        // Initialize meal plan from item or create empty one
        const initialPlan = item.mealPlan || {};
        
        // Ensure all days and meals exist
        const fullPlan = {};
        DAYS_OF_WEEK.forEach(day => {
            fullPlan[day] = {};
            MEALS.forEach(meal => {
                // Handle complex format (new structure)
                if (initialPlan[day] && initialPlan[day][meal] && initialPlan[day][meal].main) {
                    fullPlan[day][meal] = {
                        main: [...initialPlan[day][meal].main],
                        alternatives: {...initialPlan[day][meal].alternatives}
                    };
                }
                // Handle array format 
                else if (initialPlan[day] && initialPlan[day][meal] && Array.isArray(initialPlan[day][meal])) {
                    fullPlan[day][meal] = [...initialPlan[day][meal]];
                }
                // Handle string format (backward compatibility)
                else if (initialPlan[day] && initialPlan[day][meal] && typeof initialPlan[day][meal] === 'string') {
                    // Convert comma-separated string to array for compatibility with older data
                    fullPlan[day][meal] = initialPlan[day][meal]
                        .split(',')
                        .map(item => item.trim())
                        .filter(item => item !== '');
                } 
                else {
                    fullPlan[day][meal] = [];
                }
            });
        });
        
        setMealPlan(fullPlan);
        setSelectedDay(DAYS_OF_WEEK[0]);
        setEditProgramModal(true);
    };

    const handleSaveMealPlan = async () => {
        setIsSaving(true);
        try {
            // Prepare the data to send
            const data = {
                title: editTitle,
                description: editDescription,
                category_id: editCategoryId,
                mealPlan: {} // We'll copy the structure with proper handling for different formats
            };
            
            // Add nutrition_plan_id for updates
            if (selectedProgram && selectedProgram.id) {
                data.nutrition_plan_id = selectedProgram.id;
            }
            
            // Initialize the meal plan structure even if there's no data
            DAYS_OF_WEEK.forEach(day => {
                data.mealPlan[day] = {};
                MEALS.forEach(meal => {
                    // Initialize with empty arrays by default
                    data.mealPlan[day][meal] = [];
                    
                    // If we have data for this day/meal, process it
                    if (mealPlan && mealPlan[day] && mealPlan[day][meal]) {
                        const mealData = mealPlan[day][meal];
                        
                        // Already has the complex format with main and alternatives
                        if (mealData && typeof mealData === 'object' && !Array.isArray(mealData) && mealData.main) {
                            data.mealPlan[day][meal] = {...mealData};
                        }
                        // Simple array format -> keep as is (API will handle it)
                        else if (Array.isArray(mealData)) {
                            data.mealPlan[day][meal] = [...mealData];
                        }
                        // Handle string format (for backward compatibility)
                        else if (typeof mealData === 'string') {
                            data.mealPlan[day][meal] = mealData
                                .split(',')
                                .map(item => item.trim())
                                .filter(item => item !== '');
                        }
                    }
                });
            });
            
            // Define API URL based on whether we're updating or creating
            let url;
            let method;
            
            if (selectedProgram && selectedProgram.id) {
                // Update existing plan
                url = `${config[config.environment].apiUrl}/dietitian/updateNutritionPlan`;
                method = 'put';
            } else {
                // Create new plan
                url = `${config[config.environment].apiUrl}/dietitian/addNutritionPlan`;
                method = 'post';
            }
            
            // Make the API request
            const response = await axios({
                method,
                url,
                data,
                headers: {
                    Authorization: localStorage.getItem('token'),
                }
            });
            
            // Refresh data after successful operation
            if (response.status === 200 || response.status === 201 || response.data.ok) {
                // Update local state with the updated data if it's an update
                if (selectedProgram && selectedProgram.id) {
                    setBeslenmeData(prev => 
                        prev.map(item => 
                            item.id === selectedProgram.id 
                                ? { 
                                    ...item, 
                                    title: editTitle,
                                    description: editDescription,
                                    category_id: editCategoryId,
                                    mealPlan: data.mealPlan
                                  }
                                : item
                        )
                    );
                } else {
                    // Fetch all data again if it's a new item
                    fetchNutritionPlans();
                }
                
                // Close the modal
                setEditProgramModal(false);
                
                // Show success message
                setSuccessMessage(`"${editTitle}" programı başarıyla ${selectedProgram && selectedProgram.id ? 'güncellendi' : 'oluşturuldu'}.`);
                setShowSuccessPopup(true);
                
                // Reset form
                setEditTitle('');
                setEditDescription('');
                setEditCategoryId('');
                
                // Reset meal plan
                const emptyPlan = {};
                DAYS_OF_WEEK.forEach(day => {
                    emptyPlan[day] = {};
                    MEALS.forEach(meal => {
                        emptyPlan[day][meal] = [];
                    });
                });
                setMealPlan(emptyPlan);
                
                setSelectedProgram(null);
            }
        } catch (error) {
            console.error('Hata:', error);
            console.error('Hata detayları:', error.response?.data || 'Detay yok');
            alert(`Program ${selectedProgram && selectedProgram.id ? 'güncellenirken' : 'oluşturulurken'} bir hata oluştu. Lütfen tekrar deneyin.`);
        } finally {
            setIsSaving(false);
        }
    };

    // Meal plan handlers
    const handleMealChange = (day, meal, value) => {
        setMealPlan(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [meal]: value
            }
        }));
    };

    const handleDayChange = (day) => {
        setSelectedDay(day);
    };

    // View meal plan handler
    const handleViewProgram = (item) => {
        setSelectedProgram(item);
        setViewProgramModal(true);
    };

    // Export PDF handler
    const handleExportPdf = () => {
        generatePDF(selectedProgram);
    };

    const handleOpenDeleteConfirm = (item) => {
        setItemToDelete(item);
        setDeleteConfirmModal(true);
    };

    const handleDelete = () => {
        if (!itemToDelete) return;
        
        axios.delete(`${config[config.environment].apiUrl}/dietitian/deleteNutritionPlan?nutrition_plan_id=${itemToDelete.id}`, {
            headers: { Authorization: localStorage.getItem("token") }
        })
        .then(() => {
            // Store name for success message
            const planName = itemToDelete.title;
            
            // Update local state after successful deletion
            setBeslenmeData(prev => prev.filter(dataItem => dataItem.id !== itemToDelete.id));
            // Close the modal and reset the item to delete
            setDeleteConfirmModal(false);
            setItemToDelete(null);
            
            // Show success popup
            setSuccessMessage(`"${planName}" programı başarıyla silindi.`);
            setShowSuccessPopup(true);
        })
        .catch(error => {
            console.error("Error deleting nutrition plan:", error);
            setDeleteConfirmModal(false);
            setItemToDelete(null);
        });
    };

    return (
        <Default>
            <div className="beslenme-container">
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
                                title="Plan Ekle"
                                onClick={() => setAddPlanModal(true)}
                            >
                                <AddIcon />
                                <span className="btn-text">Plan Ekle</span>
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

                {/* Right Panel - Nutrition Programs */}
                <div className="programs-panel">
                    <div className="nutrition-cards-grid">
                        {loading ? (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p>Beslenme programları yükleniyor...</p>
                            </div>
                        ) : filteredBeslenmeData.length > 0 ? (
                            filteredBeslenmeData.map((item) => (
                                <NutritionCard 
                                    key={item.id}
                                    item={item}
                                    onAddToUser={handleOpenAddToUserModal}
                                    onPrint={handlePrint}
                                    onEdit={handleEdit}
                                    onDelete={handleOpenDeleteConfirm}
                                    onView={handleViewProgram}
                                />
                            ))
                        ) : (
                            <div className="no-programs">
                                <p>Bu kategoriye ait beslenme programı bulunamadı.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Plan Modal */}
            <Modal 
                isOpen={addPlanModal} 
                title="Beslenme Planı Ekle" 
                onClose={() => setAddPlanModal(false)}
            >
                <div className="modal-body">
                    <div className="input-container">
                        <label htmlFor="planTitle">Plan Adı</label>
                        <input 
                            type="text" 
                            id="planTitle"
                            className="text-input" 
                            value={newPlan.title}
                            onChange={(e) => setNewPlan({...newPlan, title: e.target.value})}
                            placeholder="Plan adını giriniz"
                        />
                    </div>
                    <div className="input-container">
                        <label htmlFor="planDescription">Açıklama</label>
                        <textarea 
                            id="planDescription"
                            className="text-input textarea" 
                            value={newPlan.description}
                            onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                            placeholder="Plan açıklaması giriniz"
                            rows={3}
                        />
                    </div>
                    <div className="input-container">
                        <label htmlFor="planCategory">Kategori</label>
                        <select 
                            id="planCategory"
                            className="text-input" 
                            value={newPlan.category_id}
                            onChange={(e) => setNewPlan({...newPlan, category_id: e.target.value})}
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
                        onClick={() => setAddPlanModal(false)}
                    >
                        Vazgeç
                    </button>
                    <button 
                        className="modal-btn confirm-btn" 
                        onClick={handleAddPlan}
                        disabled={!newPlan.title.trim() || !newPlan.category_id}
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
                        <label htmlFor="categoryTitle">Kategori Adı</label>
                        <input 
                            type="text" 
                            id="categoryTitle"
                            className="text-input" 
                            value={newCategoryTitle}
                            onChange={(e) => setNewCategoryTitle(e.target.value)}
                            placeholder="Kategori adını giriniz"
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
                        onClick={handleAddCategory}
                        disabled={!newCategoryTitle.trim()}
                    >
                        Ekle
                    </button>
                </div>
            </Modal>

            {/* Add to User Modal */}
            <Modal 
                isOpen={addToUserModal} 
                title="Danışana Ekle" 
                onClose={() => setAddToUserModal(false)}
            >
                <div className="modal-body">
                    <p className="selected-program">
                        Seçilen program: <strong>{selectedProgram?.title}</strong>
                    </p>
                    <p className="assign-note">
                        <strong>Not:</strong> Danışanınız bu beslenme planını uyguladıkça, yediği öğünleri mobil uygulamada işaretleyebilecek.
                    </p>
                    <div className="input-container">
                        <label htmlFor="userSelect">Danışan Seçin</label>
                        <select 
                            id="userSelect"
                            className="text-input"
                            value={selectedUser?.id || ''}
                            onChange={(e) => {
                                const userId = e.target.value;
                                const user = danisanList.find(u => u.id === parseInt(userId));
                                setSelectedUser(user);
                            }}
                        >
                            <option value="">Danışan Seçin</option>
                            {danisanList.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="date-inputs-container">
                        <div className="input-container half-width">
                            <label htmlFor="startDate">Başlangıç Tarihi</label>
                            <input 
                                type="date" 
                                id="startDate"
                                className="text-input" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="input-container half-width">
                            <label htmlFor="endDate">Bitiş Tarihi</label>
                            <input 
                                type="date" 
                                id="endDate"
                                className="text-input" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="input-container">
                        <label htmlFor="assignmentNote">Not (Opsiyonel)</label>
                        <textarea 
                            id="assignmentNote"
                            className="text-input textarea" 
                            value={assignmentNote}
                            onChange={(e) => setAssignmentNote(e.target.value)}
                            placeholder="Danışana özel notlar..."
                            rows={3}
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button 
                        className="modal-btn cancel-btn" 
                        onClick={() => setAddToUserModal(false)}
                    >
                        Vazgeç
                    </button>
                    <button 
                        className="modal-btn confirm-btn" 
                        onClick={handleAddToUser}
                        disabled={!selectedUser || !startDate || !endDate}
                    >
                        Ekle
                    </button>
                </div>
            </Modal>

            {/* Edit Program Modal */}
            <Modal 
                isOpen={editProgramModal} 
                title="Beslenme Programı Düzenle"
                onClose={() => setEditProgramModal(false)}
                fullWidth={true}
            >
                <div className="modal-body">
                    <div className="program-details-section">
                        <h3 className="section-title">Program Bilgileri</h3>
                        <div className="input-container">
                            <label htmlFor="editTitle">Program Adı</label>
                            <input 
                                type="text" 
                                id="editTitle"
                                className="text-input" 
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Program adını giriniz"
                            />
                        </div>
                        <div className="input-container">
                            <label htmlFor="editDescription">Açıklama</label>
                            <textarea 
                                id="editDescription"
                                className="text-input textarea" 
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="Program açıklaması giriniz"
                                rows={3}
                            />
                        </div>
                        <div className="input-container">
                            <label htmlFor="editCategory">Kategori</label>
                            <select 
                                id="editCategory"
                                className="text-input" 
                                value={editCategoryId}
                                onChange={(e) => setEditCategoryId(e.target.value)}
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
                    
                    <div className="meal-plan-section">
                        <h3 className="section-title">Öğün Planı</h3>
                        <MealPlanTable 
                            mealPlan={mealPlan}
                            onMealChange={handleMealChange}
                            selectedDay={selectedDay}
                            onDayChange={handleDayChange}
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button 
                        className="modal-btn cancel-btn" 
                        onClick={() => setEditProgramModal(false)}
                    >
                        İptal
                    </button>
                    <button 
                        className="modal-btn confirm-btn" 
                        onClick={handleSaveMealPlan}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </div>
            </Modal>

            {/* Detail Modal */}
            <Modal 
                isOpen={detailModal} 
                title={detailItem?.title} 
                onClose={() => setDetailModal(false)}
            >
                <div className="detail-modal-content">
                    <p className="detail-description">{detailItem?.description}</p>
                    {detailItem?.image && (
                        <img 
                            src={detailItem.image} 
                            alt={detailItem.title}
                            className="detail-image"
                        />
                    )}
                </div>
                <div className="modal-footer">
                    <button 
                        className="modal-btn close-btn" 
                        onClick={() => setDetailModal(false)}
                    >
                        Kapat
                    </button>
                </div>
            </Modal>

            {/* View Program Modal */}
            <Modal 
                isOpen={viewProgramModal} 
                title={`${selectedProgram?.title} Beslenme Programı`}
                onClose={() => setViewProgramModal(false)}
                fullWidth={true}
            >
                <div className="modal-body meal-plan-view-modal" ref={mealPlanRef}>
                    <ViewMealPlan 
                        mealPlan={selectedProgram?.mealPlan}
                        programTitle={selectedProgram?.title}
                        onClose={() => setViewProgramModal(false)}
                        onExportPdf={handleExportPdf}
                    />
                </div>
                <div className="modal-footer">

                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal 
                isOpen={deleteConfirmModal} 
                title="Beslenme Programını Sil" 
                onClose={() => {
                    setDeleteConfirmModal(false);
                    setItemToDelete(null);
                }}
            >
                <div className="modal-body delete-confirm-modal">
                    <div className="delete-warning">
                        <WarningIcon className="warning-icon" />
                        <p className="warning-text">
                            <strong>{itemToDelete?.title}</strong> programını silmek istediğinize emin misiniz?
                        </p>
                    </div>
                    <p className="delete-note">Bu işlem geri alınamaz.</p>
                    <p className="delete-note important">
                        <strong>Önemli:</strong> Bu program silindiğinde, atanmış olduğu tüm danışanların takviminden de kaldırılacaktır.
                    </p>
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
                        onClick={handleDelete}
                    >
                        Sil
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
                    setAffectedPlans([]);
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
                    
                    {affectedPlans.length > 0 && (
                        <div className="affected-plans">
                            <p className="delete-note important">
                                <strong>Önemli:</strong> Bu kategori ile ilişkili <strong>{affectedPlans.length}</strong> beslenme programı silinecektir:
                            </p>
                            <ul className="affected-plans-list">
                                {affectedPlans.map(plan => (
                                    <li key={plan.id}><span className="plan-title">{plan.title}</span></li>
                                ))}
                            </ul>
                            <p className="delete-note">
                                Bu programlar danışanlara atanmışsa, danışanların takviminden de kaldırılacaktır.
                            </p>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button 
                        className="modal-btn cancel-btn" 
                        onClick={() => {
                            setDeleteCategoryConfirmModal(false);
                            setCategoryToDelete(null);
                            setAffectedPlans([]);
                        }}
                    >
                        Vazgeç
                    </button>
                    <button 
                        className="modal-btn delete-confirm-btn" 
                        onClick={handleSingleCategoryDelete}
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
                    setAffectedPlans([]);
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
                    
                    {affectedPlans.length > 0 && (
                        <div className="affected-plans">
                            <p className="delete-note important">
                                <strong>Önemli:</strong> Bu kategoriler ile ilişkili <strong>{affectedPlans.length}</strong> beslenme programı silinecektir:
                            </p>
                            <ul className="affected-plans-list">
                                {affectedPlans.map(plan => (
                                    <li key={plan.id}><span className="plan-title">{plan.title}</span></li>
                                ))}
                            </ul>
                            <p className="delete-note">
                                Bu programlar danışanlara atanmışsa, danışanların takviminden de kaldırılacaktır.
                            </p>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button 
                        className="modal-btn cancel-btn" 
                        onClick={() => {
                            setDeleteMultiCategoriesConfirmModal(false);
                            setAffectedPlans([]);
                        }}
                    >
                        Vazgeç
                    </button>
                    <button 
                        className="modal-btn delete-confirm-btn" 
                        onClick={handleMultiDelete}
                    >
                        Sil
                    </button>
                </div>
            </Modal>

            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="success-popup">
                    <div className="success-popup-content">
                        <CheckCircleIcon className="success-icon" />
                        <p>{successMessage}</p>
                    </div>
                </div>
            )}

            {/* Error Popup */}
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
