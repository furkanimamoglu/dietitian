import React, {useEffect, useRef, useState} from 'react';
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
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import {jsPDF} from "jspdf";
import 'jspdf-autotable';
import {
    Autocomplete,
    TextField,
    Avatar,
    CircularProgress,
    Paper,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Box,
    InputAdornment
} from '@mui/material';

import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';

const DAYS_OF_WEEK = [
    "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"
];

const MEALS = [
    "Kahvaltı", "Öğle Yemeği", "Akşam Yemeği", "Aparatif"
];

const CategoryItem = ({category, isChecked, onCheck, onDelete}) => {
    return (
        <div
            className={`category-item ${isChecked ? 'checked' : ''}`}
            onClick={onCheck}
        >
            <div className="category-checkbox">
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                    }} // Controlled component
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
        </div>
    );
};

// Nutrition Card Component
const NutritionCard = ({item, onAddToUser, onPrint, onEdit, onDelete, onView}) => {
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
                        <PersonAddIcon/>
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
        </div>
    );
};

// Modal Component
const Modal = ({isOpen, title, onClose, children, fullWidth = false}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
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
        </div>
    );
};

// Meal Plan Table Component
const MealPlanTable = ({mealPlan, onMealChange, selectedDay, onDayChange}) => {
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
            headers: {Authorization: localStorage.getItem("token")}
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
                                <RestaurantIcon className="meal-icon"/>
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
                                                    <CloseIcon fontSize="small"/>
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
                                            <AddIcon/>
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
                                                    <CloseIcon fontSize="small"/>
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
                                                                <CloseIcon fontSize="small"/>
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
                                                    <AddIcon/>
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

const ViewMealPlan = ({mealPlan, programTitle, onExportPdf}) => {
    const getMealContent = (mealData) => {
        if (!mealData) return {mainItems: [], hasAlternatives: false};

        if (Array.isArray(mealData)) {
            return {
                mainItems: mealData,
                hasAlternatives: false
            };
        }

        if (mealData.main && Array.isArray(mealData.main)) {
            return {
                mainItems: mealData.main,
                hasAlternatives: mealData.alternatives && Object.keys(mealData.alternatives).length > 0,
                alternatives: mealData.alternatives
            };
        }

        if (typeof mealData === 'string') {
            const items = mealData.split(',').map(item => item.trim()).filter(item => item !== '');
            return {
                mainItems: items,
                hasAlternatives: false
            };
        }

        return {mainItems: [], hasAlternatives: false};
    };

    return (
        <div className="view-meal-plan-container">
            <div className="view-meal-plan-header">
                <h2>{programTitle} Programı</h2>
                <button className="export-pdf-button" onClick={onExportPdf}>
                    <FileDownloadIcon/>
                    PDF İndir
                </button>
            </div>

            <div className="view-meal-plan-days">
                {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="day-card">
                        <div className="day-header">{day}</div>
                        <div className="day-meals">
                            {MEALS.map(meal => {
                                const {mainItems, hasAlternatives, alternatives} = getMealContent(
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
                                                                            <li key={altIndex}
                                                                                className="alternative-item">
                                                                                <span
                                                                                    className="alternative-prefix">alternatif: </span>
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
    const [filteredDanisanList, setFilteredDanisanList] = useState([]);
    const [danisanSearchTerm, setDanisanSearchTerm] = useState('');
    const [beslenmeData, setBeslenmeData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Danışana atanmış programlar için yeni state'ler
    const [clientProgramsModal, setClientProgramsModal] = useState(false);
    const [selectedClientPrograms, setSelectedClientPrograms] = useState([]);
    const [loadingClientPrograms, setLoadingClientPrograms] = useState(false);
    const [selectedClientInfo, setSelectedClientInfo] = useState(null);

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

    // Filtreleme için danışan listesini izle
    useEffect(() => {
        if (danisanList.length > 0) {
            setFilteredDanisanList(
                danisanList.filter(danisan =>
                    danisan.name.toLowerCase().includes(danisanSearchTerm.toLowerCase())
                )
            );
        }
    }, [danisanList, danisanSearchTerm]);

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

    useEffect(() => {
        fetchNutritionPlans();
    }, []);

    const filteredCategories = categoryData?.filter(category =>
        (category?.name || category?.title || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredBeslenmeData = beslenmeData.filter(item => {
        if (checkedCategories.length === 0) {
            return true;
        }
        return checkedCategories.includes(item.category_id);
    });

    const handleCategoryCheck = (categoryId) => {
        setCheckedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleOpenMultiDeleteConfirm = () => {
        if (checkedCategories.length === 0) return;

        const plansToDelete = beslenmeData.filter(plan =>
            checkedCategories.includes(plan.category_id)
        );

        setAffectedPlans(plansToDelete);
        setDeleteMultiCategoriesConfirmModal(true);
    };

    const handleMultiDelete = () => {
        const deletePromises = checkedCategories.map(categoryId =>
            axios.delete(`${config[config.environment].apiUrl}/dietitian/deleteNutritionCategory?category_id=${categoryId}`, {
                headers: {Authorization: localStorage.getItem("token")}
            })
        );

        Promise.all(deletePromises)
            .then(() => {
                setCategoryData(prev =>
                    prev.filter(cat => !checkedCategories.includes(cat.id))
                );
                setBeslenmeData(prev =>
                    prev.filter(plan => !checkedCategories.includes(plan.category_id))
                );

                const categoryCount = checkedCategories.length;
                setCheckedCategories([]);
                setDeleteMultiCategoriesConfirmModal(false);
                setAffectedPlans([]);

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

        const plansToDelete = beslenmeData.filter(plan => plan.category_id === categoryId);

        setCategoryToDelete(category);
        setAffectedPlans(plansToDelete);
        setDeleteCategoryConfirmModal(true);
    };

    const handleSingleCategoryDelete = () => {
        if (!categoryToDelete) return;

        axios.delete(`${config[config.environment].apiUrl}/dietitian/deleteNutritionCategory?category_id=${categoryToDelete.id}`, {
            headers: {Authorization: localStorage.getItem("token")}
        })
            .then(() => {
                setCategoryData(prev => prev.filter(cat => cat.id !== categoryToDelete.id));
                setCheckedCategories(prev => prev.filter(id => id !== categoryToDelete.id));
                setBeslenmeData(prev => prev.filter(plan => plan.category_id !== categoryToDelete.id));
                setDeleteCategoryConfirmModal(false);
                setCategoryToDelete(null);
                setAffectedPlans([]);

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

        axios.post(`${config[config.environment].apiUrl}/dietitian/addNutritionCategory`, newCategory, {
            headers: {Authorization: localStorage.getItem("token")}
        })
            .then(response => {
                setCategoryData([...categoryData, response.data]);
                setNewCategoryTitle('');
                setAddCategoryModal(false);
            })
            .catch(error => {
                console.error("Error adding category:", error);
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

        DAYS_OF_WEEK.forEach(day => {
            planData.mealPlan[day] = {};
            MEALS.forEach(meal => {
                planData.mealPlan[day][meal] = [];
            });
        });

        axios.post(`${config[config.environment].apiUrl}/dietitian/addNutritionPlan`, planData, {
            headers: {Authorization: localStorage.getItem("token")}
        })
            .then(response => {
                setBeslenmeData([...beslenmeData, response.data]);
                setNewPlan({
                    title: '',
                    description: '',
                    category_id: ''
                });
                setAddPlanModal(false);

                setSuccessMessage(`"${planData.title}" programı başarıyla oluşturuldu.`);
                setShowSuccessPopup(true);
            })
            .catch(error => {
                console.error("Error adding plan:", error);
                setErrorMessage(error.response?.data?.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
                setShowErrorPopup(true);
            });
    };

    const handleOpenAddToUserModal = (item) => {
        setSelectedProgram(item);
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

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
            headers: {Authorization: localStorage.getItem("token")}
        })
            .then(response => {
                if (response.data && response.data.message && !response.data.ok) {
                    setErrorMessage(response.data.message || "Bir hata oluştu.");
                    setShowErrorPopup(true);
                    return;
                }

                const programName = selectedProgram.title;
                const userName = selectedUser.name;

                setAddToUserModal(false);
                setSelectedProgram(null);
                setSelectedUser(null);
                setStartDate('');
                setEndDate('');
                setAssignmentNote('');

                setSuccessMessage(`"${programName}" programı "${userName}" danışanına başarıyla atandı. Danışanınız bu plana göre yediklerini işaretleyebilecek.`);
                setShowSuccessPopup(true);
            })
            .catch(error => {
                console.error("Error assigning plan to client:", error);
                setErrorMessage(error.response?.data?.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
                setShowErrorPopup(true);
            });
    };

    const handlePrint = (item) => {
        console.log("Printing:", item);
        generatePDF(item);
    };

    const generatePDF = (program) => {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const dietitianName = "Dr. Ayşe Yılmaz";

        doc.setFillColor(76, 175, 80);
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), 25, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text(`${program.title} Beslenme Programi`, 14, 15);

        doc.setTextColor(0, 0, 0);

        doc.setFontSize(10);
        const today = new Date();
        const dateStr = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`;
        doc.text(`Olusturulma Tarihi: ${dateStr}`, 14, 30);
        doc.text(`Diyetisyen: ${dietitianName}`, 14, 35);

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(14, 38, doc.internal.pageSize.getWidth() - 14, 38);

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;
        const usableWidth = pageWidth - (margin * 2);

        const dayWidth = usableWidth / 4;
        const dayHeight = 50;

        let xPos = margin;
        let yPos = 45;
        let dayCount = 0;

        const getMealItems = (mealData) => {
            if (!mealData) return [];

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

        DAYS_OF_WEEK.forEach((day, index) => {
            if (index === 4) {
                xPos = margin + dayWidth / 2;
                yPos += dayHeight + 5;
            }

            doc.setFillColor(230, 230, 230);
            doc.roundedRect(xPos + 1, yPos + 1, dayWidth - 7, dayHeight, 3, 3, 'F');

            doc.setFillColor(255, 255, 255);
            doc.roundedRect(xPos, yPos, dayWidth - 7, dayHeight, 3, 3, 'F');

            if (day === "Cumartesi" || day === "Pazar") {
                doc.setFillColor(255, 152, 0);
            } else {
                doc.setFillColor(76, 175, 80);
            }
            doc.roundedRect(xPos, yPos, dayWidth - 7, 8, 3, 3, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            const safeDayName = day.replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
                .replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ö/g, 'o');
            doc.text(safeDayName, xPos + 5, yPos + 5.5);

            doc.setTextColor(0, 0, 0);

            let mealYPos = yPos + 12;

            MEALS.forEach((meal, mealIndex) => {
                doc.setFontSize(7);
                doc.setFont('helvetica', 'bold');
                const safeMeal = meal.replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
                    .replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ö/g, 'o');
                doc.text(`${safeMeal}:`, xPos + 2, mealYPos);
                doc.setFont('helvetica', 'normal');

                if (program.mealPlan &&
                    program.mealPlan[day] &&
                    program.mealPlan[day][meal]) {

                    const mealItems = getMealItems(program.mealPlan[day][meal]);

                    if (mealItems.length > 0) {
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

            xPos += dayWidth;
            dayCount++;
        });

        doc.setDrawColor(76, 175, 80);
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

        doc.setFontSize(8);
        doc.setTextColor(76, 175, 80);
        doc.text("Sağlıklı günler dileriz!", margin, pageHeight - 10);
        doc.setTextColor(255, 152, 0);
        doc.text("www.diyetisyen.com", pageWidth / 2 - 15, pageHeight - 10);

        doc.save(`${program.title}_beslenme_programi.pdf`);
    };

    const handleEdit = (item) => {
        setSelectedProgram(item);

        setEditTitle(item.title || '');
        setEditDescription(item.description || '');
        setEditCategoryId(item.category_id || '');

        const initialPlan = item.mealPlan || {};

        const fullPlan = {};
        DAYS_OF_WEEK.forEach(day => {
            fullPlan[day] = {};
            MEALS.forEach(meal => {
                if (initialPlan[day] && initialPlan[day][meal] && initialPlan[day][meal].main) {
                    fullPlan[day][meal] = {
                        main: [...initialPlan[day][meal].main],
                        alternatives: {...initialPlan[day][meal].alternatives}
                    };
                }
                else if (initialPlan[day] && initialPlan[day][meal] && Array.isArray(initialPlan[day][meal])) {
                    fullPlan[day][meal] = [...initialPlan[day][meal]];
                }
                else if (initialPlan[day] && initialPlan[day][meal] && typeof initialPlan[day][meal] === 'string') {
                    fullPlan[day][meal] = initialPlan[day][meal]
                        .split(',')
                        .map(item => item.trim())
                        .filter(item => item !== '');
                } else {
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
            const data = {
                title: editTitle,
                description: editDescription,
                category_id: editCategoryId,
                mealPlan: {}
            };

            if (selectedProgram && selectedProgram.id) {
                data.nutrition_plan_id = selectedProgram.id;
            }

            DAYS_OF_WEEK.forEach(day => {
                data.mealPlan[day] = {};
                MEALS.forEach(meal => {
                    data.mealPlan[day][meal] = [];

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
            headers: {Authorization: localStorage.getItem("token")}
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
                                title="Plan Ekle"
                                onClick={() => setAddPlanModal(true)}
                            >
                                <AddIcon/>
                                <span className="btn-text">Plan Ekle</span>
                            </button>
                            <button
                                className="action-btn add-btn"
                                title="Kategori Ekle"
                                onClick={() => setAddCategoryModal(true)}
                            >
                                <AddIcon/>
                                <span className="btn-text">Kategori Ekle</span>
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

                {/* Middle Panel - Nutrition Programs */}
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

                {/* Right Panel - Sidebar */}
                <Paper
                    elevation={3}
                    sx={{
                        flex: '0 0 260px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        height: 'fit-content',
                        maxHeight: 'calc(100vh - 100px)'
                    }}
                    className="right-sidebar-panel"
                >
                    <Box sx={{ padding: '16px 0', backgroundColor: '#1976d2' }}>
                        <Typography variant="h6" sx={{
                            textAlign: 'center',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <PeopleIcon sx={{ mr: 1 }} /> Danışanlarım
                        </Typography>
                    </Box>

                    <Box sx={{ padding: '16px' }}>
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
                                        <SearchIcon sx={{ color: "rgba(0, 0, 0, 0.54)" }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 2 }}
                        />

                        {loading ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                                <CircularProgress size={28} sx={{ mb: 2 }} />
                                <Typography variant="body2" color="text.secondary">
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
                                                button
                                                onClick={() => {
                                                    setSelectedClientInfo(danisan);
                                                    setLoadingClientPrograms(true);
                                                    axios.get(`${config[config.environment].apiUrl}/nutrition/getClientNutritionPlans?client_id=${danisan.id}`, {
                                                        headers: { Authorization: localStorage.getItem("token") }
                                                    })
                                                        .then(response => {
                                                            setSelectedClientPrograms(response.data || []);
                                                            setLoadingClientPrograms(false);
                                                            setClientProgramsModal(true);
                                                        })
                                                        .catch(error => {
                                                            console.error("Error fetching client programs:", error);
                                                            setLoadingClientPrograms(false);
                                                            setErrorMessage("Danışan programları yüklenirken bir hata oluştu.");
                                                            setShowErrorPopup(true);
                                                        });
                                                }}
                                                sx={{
                                                    borderRadius: '8px',
                                                    my: 0.5,
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(25, 118, 210, 0.08)'
                                                    }
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: danisan.image ? 'transparent' : '#1976d2',
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
                                                    secondary={danisan.email}
                                                    primaryTypographyProps={{ fontWeight: 'medium' }}
                                                />
                                            </ListItem>
                                            <Divider variant="inset" component="li" />
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
                                        <PersonIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
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
                        <strong>Not:</strong> Danışanınız bu beslenme planını uyguladıkça, yediği öğünleri mobil
                        uygulamada işaretleyebilecek.
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
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <div className="date-inputs-container">
                            <div className="input-container half-width">
                                <DatePicker
                                    label="Başlangıç Tarihi"
                                    value={startDate ? new Date(startDate) : null}
                                    onChange={(newValue) => {
                                        setStartDate(newValue ? newValue.toISOString().split('T')[0] : '');
                                    }}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            className: "text-input"
                                        }
                                    }}
                                />
                            </div>
                            <div className="input-container half-width">
                                <DatePicker
                                    label="Bitiş Tarihi"
                                    value={endDate ? new Date(endDate) : null}
                                    onChange={(newValue) => {
                                        setEndDate(newValue ? newValue.toISOString().split('T')[0] : '');
                                    }}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            className: "text-input"
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </LocalizationProvider>
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
                        <WarningIcon className="warning-icon"/>
                        <p className="warning-text">
                            <strong>{itemToDelete?.title}</strong> programını silmek istediğinize emin misiniz?
                        </p>
                    </div>
                    <p className="delete-note">Bu işlem geri alınamaz.</p>
                    <p className="delete-note important">
                        <strong>Önemli:</strong> Bu program silindiğinde, atanmış olduğu tüm danışanların takviminden de
                        kaldırılacaktır.
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
                        <WarningIcon className="warning-icon"/>
                        <p className="warning-text">
                            <strong>{categoryToDelete?.name || categoryToDelete?.title}</strong> kategorisini silmek
                            istediğinize emin misiniz?
                        </p>
                    </div>
                    <p className="delete-note">Bu işlem geri alınamaz.</p>

                    {affectedPlans.length > 0 && (
                        <div className="affected-plans">
                            <p className="delete-note important">
                                <strong>Önemli:</strong> Bu kategori ile
                                ilişkili <strong>{affectedPlans.length}</strong> beslenme programı silinecektir:
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
                        <WarningIcon className="warning-icon"/>
                        <p className="warning-text">
                            <strong>{checkedCategories.length}</strong> kategoriyi silmek istediğinize emin misiniz?
                        </p>
                    </div>
                    <p className="delete-note">Bu işlem geri alınamaz.</p>

                    {affectedPlans.length > 0 && (
                        <div className="affected-plans">
                            <p className="delete-note important">
                                <strong>Önemli:</strong> Bu kategoriler ile
                                ilişkili <strong>{affectedPlans.length}</strong> beslenme programı silinecektir:
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
                        <CheckCircleIcon className="success-icon"/>
                        <p>{successMessage}</p>
                    </div>
                </div>
            )}

            {/* Error Popup */}
            {showErrorPopup && (
                <div className="error-popup">
                    <div className="error-popup-content">
                        <ErrorIcon className="error-icon"/>
                        <p>{errorMessage}</p>
                    </div>
                </div>
            )}

            {/* Client Programs Modal */}
            <Modal
                isOpen={clientProgramsModal}
                title={`${selectedClientInfo?.name} - Atanan Programlar`}
                onClose={() => setClientProgramsModal(false)}
                fullWidth={true}
            >
                <div className="modal-body client-programs-modal">
                    {loadingClientPrograms ? (
                        <div className="loading-container">
                            <CircularProgress size={40} />
                            <p>Programlar yükleniyor...</p>
                        </div>
                    ) : selectedClientPrograms.length > 0 ? (
                        <div className="client-programs-wrapper">
                            <div className="client-info-summary">
                                <Avatar
                                    sx={{
                                        bgcolor: selectedClientInfo?.image ? 'transparent' : '#1976d2',
                                        width: 60,
                                        height: 60
                                    }}
                                    src={selectedClientInfo?.image || ''}
                                >
                                    {!selectedClientInfo?.image && selectedClientInfo?.name.charAt(0)}
                                </Avatar>
                                <div className="client-info-details">
                                    <h3>{selectedClientInfo?.name}</h3>
                                    <p>{selectedClientInfo?.email}</p>
                                    <div className="client-stats">
                                        <span className="client-stat-item">
                                            <strong>{selectedClientPrograms.length}</strong> Aktif Program
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="client-programs-list">
                                {selectedClientPrograms.map((program, index) => {
                                    // Tarih formatını düzeltme
                                    const formatDate = (dateStr) => {
                                        if (!dateStr) return "Belirtilmemiş";
                                        const date = new Date(dateStr);
                                        return date.toLocaleDateString('tr-TR', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric'
                                        });
                                    };

                                    // Başlangıç ve bitiş tarihleri arasındaki gün sayısını hesaplama
                                    const calculateDaysBetween = (start, end) => {
                                        if (!start || !end) return null;
                                        const startDate = new Date(start);
                                        const endDate = new Date(end);
                                        const diffTime = endDate - startDate;
                                        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    };

                                    const daysBetween = calculateDaysBetween(program.start_date, program.end_date);

                                    // Program durumunu hesaplama
                                    const getProgramStatus = () => {
                                        const today = new Date();
                                        const startDate = new Date(program.start_date);
                                        const endDate = new Date(program.end_date);

                                        if (today < startDate) {
                                            return { status: "Başlamamış", color: "#3f51b5" };
                                        } else if (today > endDate) {
                                            return { status: "Tamamlandı", color: "#4caf50" };
                                        } else {
                                            return { status: "Devam Ediyor", color: "#ff9800" };
                                        }
                                    };

                                    const status = getProgramStatus();

                                    // İlerleme çubuğu yüzdesini hesaplama
                                    const calculateProgress = () => {
                                        const today = new Date();
                                        const startDate = new Date(program.start_date);
                                        const endDate = new Date(program.end_date);

                                        if (today < startDate) return 0;
                                        if (today > endDate) return 100;

                                        const totalDays = calculateDaysBetween(program.start_date, program.end_date);
                                        const passedDays = calculateDaysBetween(program.start_date, today.toISOString().split('T')[0]);

                                        return Math.round((passedDays / totalDays) * 100);
                                    };

                                    const progressPercent = calculateProgress();

                                    return (
                                        <div key={index} className="client-program-card">
                                            <div className="program-card-header">
                                                <h3>{program.title}</h3>
                                                <div
                                                    className="program-status"
                                                    style={{backgroundColor: status.color}}
                                                >
                                                    {status.status}
                                                </div>
                                            </div>

                                            <div className="program-card-dates">
                                                <div className="date-item">
                                                    <div className="date-label">Başlangıç</div>
                                                    <div className="date-value">{formatDate(program.start_date)}</div>
                                                </div>
                                                <div className="date-divider"></div>
                                                <div className="date-item">
                                                    <div className="date-label">Bitiş</div>
                                                    <div className="date-value">{formatDate(program.end_date)}</div>
                                                </div>
                                                <div className="date-divider"></div>
                                                <div className="date-item">
                                                    <div className="date-label">Süre</div>
                                                    <div className="date-value">{daysBetween} gün</div>
                                                </div>
                                            </div>

                                            <div className="program-progress-container">
                                                <div className="progress-header">
                                                    <span>Program İlerlemesi</span>
                                                    <span>{progressPercent}%</span>
                                                </div>
                                                <div className="progress-bar-container">
                                                    <div
                                                        className="progress-bar"
                                                        style={{width: `${progressPercent}%`, backgroundColor: status.color}}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="program-card-description">
                                                <p>{program.description || "Açıklama bulunmuyor."}</p>
                                            </div>

                                            {program.note && (
                                                <div className="program-note">
                                                    <div className="note-header">Diyetisyen Notu</div>
                                                    <div className="note-content">{program.note}</div>
                                                </div>
                                            )}

                                            <div className="program-card-actions">
                                                <button
                                                    className="program-card-btn view-btn"
                                                    onClick={() => {
                                                        // Bir sonraki aşamada programı görüntülemek için işlev eklenebilir
                                                        const programDetails = beslenmeData.find(item => item.id === program.nutrition_plan_id);
                                                        if (programDetails) {
                                                            setSelectedProgram(programDetails);
                                                            setViewProgramModal(true);
                                                            setClientProgramsModal(false);
                                                        }
                                                    }}
                                                >
                                                    Programı Görüntüle
                                                </button>
                                                <button
                                                    className="program-card-btn print-btn"
                                                    onClick={() => {
                                                        // Bir sonraki aşamada programı yazdırmak için işlev eklenebilir
                                                        const programDetails = beslenmeData.find(item => item.id === program.nutrition_plan_id);
                                                        if (programDetails) {
                                                            handlePrint(programDetails);
                                                        }
                                                    }}
                                                >
                                                    PDF İndir
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="no-programs-message">
                            <RestaurantIcon sx={{ fontSize: 60, color: '#ccc', marginBottom: '16px' }} />
                            <h3>Atanmış Program Bulunamadı</h3>
                            <p>Bu danışana henüz bir beslenme programı atanmamış.</p>
                            <button
                                className="assign-new-program-btn"
                                onClick={() => {
                                    setClientProgramsModal(false);
                                    // Eğer modal kapatılıp başka bir işlem yapılması gerekiyorsa
                                    // burada yönlendirme yapılabilir
                                }}
                            >
                                Kapat
                            </button>
                        </div>
                    )}
                </div>
            </Modal>
        </Default>
    );
}
