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
import SaveIcon from '@mui/icons-material/Save';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

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

// Nutrition Card Component
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
                {MEALS.map((meal) => (
                    <div key={meal} className="meal-row">
                        <div className="meal-label">
                            <RestaurantIcon className="meal-icon" />
                            <span>{meal}</span>
                        </div>
                        <div className="meal-input-container">
                            <div className="simple-meal-editor">
                                <div className="meal-items-container">
                                    {(mealPlan[selectedDay][meal] || "").split(',')
                                        .filter(item => item.trim() !== '')
                                        .map((item, index) => (
                                            <div key={index} className="meal-item">
                                                <span>{item.trim()}</span>
                                                <button 
                                                    className="remove-meal-item" 
                                                    onClick={() => {
                                                        const items = mealPlan[selectedDay][meal].split(',')
                                                            .filter(i => i.trim() !== '')
                                                            .filter((_, i) => i !== index);
                                                        onMealChange(selectedDay, meal, items.join(', '));
                                                    }}
                                                >
                                                    <CloseIcon fontSize="small" />
                                                </button>
                                            </div>
                                        ))}
                                </div>
                                <div className="add-meal-item-container">
                                    <input
                                        type="text"
                                        className="add-meal-input"
                                        placeholder={`${meal} için yiyecek ekleyin...`}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && e.target.value.trim()) {
                                                const currentItems = mealPlan[selectedDay][meal] || '';
                                                const newValue = currentItems 
                                                    ? `${currentItems}, ${e.target.value.trim()}` 
                                                    : e.target.value.trim();
                                                onMealChange(selectedDay, meal, newValue);
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                    <button 
                                        className="add-meal-button"
                                        onClick={(e) => {
                                            const input = e.target.previousSibling;
                                            if (input.value.trim()) {
                                                const currentItems = mealPlan[selectedDay][meal] || '';
                                                const newValue = currentItems 
                                                    ? `${currentItems}, ${input.value.trim()}` 
                                                    : input.value.trim();
                                                onMealChange(selectedDay, meal, newValue);
                                                input.value = '';
                                            }
                                        }}
                                    >
                                        <AddIcon />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// View Meal Plan Component
const ViewMealPlan = ({ mealPlan, onClose, programTitle, onExportPdf }) => {
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
                            {MEALS.map(meal => (
                                <div key={meal} className="meal-block">
                                    <div className="meal-name">{meal}</div>
                                    <div className="meal-content">
                                        {mealPlan && mealPlan[day] && mealPlan[day][meal] ? (
                                            <ul className="meal-items-list">
                                                {mealPlan[day][meal].split(',').map((item, index) => (
                                                    item.trim() && <li key={index}>{item.trim()}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="no-meal-data">Veri girilmemiş</p>
                                        )}
                                    </div>
                                </div>
                            ))}
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
    
    // Auto-hide success popup after 3 seconds
    useEffect(() => {
        if (showSuccessPopup) {
            const timer = setTimeout(() => {
                setShowSuccessPopup(false);
            }, 3000);
            
            return () => clearTimeout(timer);
        }
    }, [showSuccessPopup]);
    
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
                initialPlan[day][meal] = '';
            });
        });
        return initialPlan;
    });

    const [viewProgramModal, setViewProgramModal] = useState(false);
    const mealPlanRef = useRef(null);

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
    useEffect(() => {
        axios
            .get(`${config[config.environment].apiUrl}/dietitian/getNutritionPlans`, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            })
            .then((response) => {
                setBeslenmeData(response.data);
            })
            .catch((error) => {
                console.error("Error fetching nutrition plans:", error);
                setBeslenmeData([]);
            });
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
            category_id: newPlan.category_id
        };
        
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
        })
        .catch(error => {
            console.error("Error adding plan:", error);
            // You might want to show an error message to the user here
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
            console.log("Plan assigned to client:", response.data);
            
            // Store names for success message
            const programName = selectedProgram.title;
            const userName = `${selectedUser.name}`;
            
            // Close the modal and reset selections
            setAddToUserModal(false);
            setSelectedProgram(null);
            setSelectedUser(null);
            setStartDate('');
            setEndDate('');
            setAssignmentNote('');
            
            // Show success popup
            setSuccessMessage(`"${programName}" programı "${userName}" danışanına başarıyla atandı.`);
            setShowSuccessPopup(true);
        })
        .catch(error => {
            console.error("Error assigning plan to client:", error);
            // You might want to show an error message
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
                    
                    const mealItems = program.mealPlan[day][meal]
                        .split(',')
                        .map(item => item.trim())
                        .filter(item => item);
                    
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
                fullPlan[day][meal] = initialPlan[day]?.[meal] || '';
            });
        });
        
        setMealPlan(fullPlan);
        setSelectedDay(DAYS_OF_WEEK[0]);
        setEditProgramModal(true);
    };

    const handleSaveMealPlan = () => {
        // Create update data with edited fields
        const updateData = {
            nutrition_plan_id: selectedProgram.id,
            title: editTitle,
            description: editDescription,
            category_id: editCategoryId,
            mealPlan: mealPlan
        };
        
        console.log("Sending update data:", updateData);
        
        // Update the program with the meal plan
        axios.put(`${config[config.environment].apiUrl}/dietitian/updateNutritionPlan`, updateData, {
            headers: { Authorization: localStorage.getItem("token") }
        })
        .then(response => {
            console.log("Update response:", response.data);
            
            // Update local state with the updated data
            setBeslenmeData(prev => 
                prev.map(item => 
                    item.id === selectedProgram.id 
                        ? { 
                            ...item, 
                            title: editTitle,
                            description: editDescription,
                            category_id: editCategoryId,
                            mealPlan: mealPlan 
                          }
                        : item
                )
            );
            
            // Close the modal
            setEditProgramModal(false);
            
            // Show success popup
            setSuccessMessage(`"${editTitle}" programı başarıyla güncellendi.`);
            setShowSuccessPopup(true);
        })
        .catch(error => {
            console.error("Error updating nutrition plan:", error);
            console.error("Error details:", error.response?.data || "No response data");
            alert("Program güncellenirken bir hata oluştu. Lütfen tekrar deneyin.");
        });
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
                        {filteredBeslenmeData.length > 0 ? (
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
                        Vazgeç
                    </button>
                    <button 
                        className="modal-btn confirm-btn" 
                        onClick={handleSaveMealPlan}
                        disabled={!editTitle || !editCategoryId}
                    >
                        <SaveIcon className="save-icon" />
                        Kaydet
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
                    <button 
                        className="modal-btn close-btn" 
                        onClick={() => setViewProgramModal(false)}
                    >
                        Kapat
                    </button>
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
        </Default>
    );
}
