import React, { useEffect, useState } from 'react';
import './Egzersizler.css';
import Default from "../../Components/Layouts/Default.jsx";
import axios from "axios";
import config from "../../config.js";

import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

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
                    onChange={() => {}}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
            <div className="category-title">{category.name}</div>
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

// Exercise Card Component
const ExerciseCard = ({ item, onAddToUser, onPrint, onEdit, onDelete, onView }) => {
    return (
        <div className="exercise-card">
            <div className="card-image-container" onClick={() => onView(item)}>
                {item.video ? (
                    <div className="video-placeholder">
                        <FitnessCenterIcon className="exercise-icon" />
                        <span>Video Mevcut</span>
                    </div>
                ) : (
                    <div className="video-placeholder">
                        <FitnessCenterIcon className="exercise-icon" />
                        <span>Video Yok</span>
                    </div>
                )}
            </div>
            <div className="card-content">
                <h3 className="card-title" onClick={() => onView(item)} style={{ cursor: 'pointer' }}>{item.exercise_name}</h3>
                <p className="card-description" onClick={() => onView(item)} style={{ cursor: 'pointer' }}>{item.exercise_description}</p>
                <div className="exercise-details">
                    {item.duration && <span>Süre: {item.duration} dk</span>}
                    {item.difficulty && <span>Zorluk: {item.difficulty}/5</span>}
                    {item.calories_burned && <span>Kalori: {item.calories_burned} kcal</span>}
                </div>
                
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

export default function Egzersizler() {
    const [categoryData, setCategoryData] = useState([]);
    const [checkedCategories, setCheckedCategories] = useState([]);
    const [danisanList, setDanisanList] = useState([]);
    const [egzersizData, setEgzersizData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Add difficulty filter state
    const [difficultyFilter, setDifficultyFilter] = useState(0); // 0 means no filter, 1-5 for difficulty levels
    
    // Add calorie filter state
    const [calorieFilter, setCalorieFilter] = useState(null); // null means no filter
    
    // Modal states
    const [addToUserModal, setAddToUserModal] = useState(false);
    const [detailModal, setDetailModal] = useState(false);
    const [addCategoryModal, setAddCategoryModal] = useState(false);
    const [addExerciseModal, setAddExerciseModal] = useState(false);
    const [editExerciseModal, setEditExerciseModal] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [detailItem, setDetailItem] = useState(null);
    const [newCategoryTitle, setNewCategoryTitle] = useState('');
    const [assignmentNote, setAssignmentNote] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    // Success popup states
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
    // Error popup states
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    // Delete confirmation modal states
    const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteCategoryConfirmModal, setDeleteCategoryConfirmModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [affectedExercises, setAffectedExercises] = useState([]);

    // New exercise state
    const [newExercise, setNewExercise] = useState({
        exercise_name: '',
        exercise_description: '',
        category_id: '',
        video: '',
        duration: 30,
        difficulty: 3,
        equipment: '',
        calories_burned: 0
    });
    
    // Edit exercise states
    const [editExerciseData, setEditExerciseData] = useState({
        exercise_id: '',
        exercise_name: '',
        exercise_description: '',
        category_id: '',
        video: '',
        duration: 30,
        difficulty: 3,
        equipment: '',
        calories_burned: 0
    });
    
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

    // Fetch categories
    useEffect(() => {
        axios
            .get(`${config[config.environment].apiUrl}/exercise/getMyExerciseCategories`, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            })
            .then((response) => {
                setCategoryData(response.data);
            })
            .catch((error) => {
                console.error("Error fetching exercise categories:", error);
                setCategoryData([]);
            });
    }, []);

    // Fetch exercises
    const fetchExercises = () => {
        setLoading(true);
        axios
            .get(`${config[config.environment].apiUrl}/exercise/getMyExercises`, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            })
            .then((response) => {
                setEgzersizData(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching exercises:", error);
                setEgzersizData([]);
                setLoading(false);
            });
    };

    // Initial fetch
    useEffect(() => {
        fetchExercises();
    }, []);

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

    // Filter categories based on search term
    const filteredCategories = categoryData.filter(category =>
        (category?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter exercise programs based on selected categories, difficulty, and calories
    const filteredExerciseData = egzersizData.filter(item => {
        // First check category filter
        const categoryMatch = checkedCategories.length === 0 || 
            checkedCategories.some(id => {
                // Handle both string and number comparisons
                const itemCategoryId = String(item.category_id || '');
                return itemCategoryId === id || itemCategoryId === String(id);
            });
        
        // Then check difficulty filter
        const difficultyMatch = difficultyFilter === 0 || item.difficulty === difficultyFilter;
        
        // Check calorie filter
        let calorieMatch = true;
        if (calorieFilter !== null) {
            const calories = item.calories_burned || 0;
            switch (calorieFilter) {
                case '0-50':
                    calorieMatch = calories >= 0 && calories <= 50;
                    break;
                case '50-100':
                    calorieMatch = calories > 50 && calories <= 100;
                    break;
                case '100-200':
                    calorieMatch = calories > 100 && calories <= 200;
                    break;
                case '200-300':
                    calorieMatch = calories > 200 && calories <= 300;
                    break;
                case '300-500':
                    calorieMatch = calories > 300 && calories <= 500;
                    break;
                case '500+':
                    calorieMatch = calories > 500;
                    break;
                default:
                    calorieMatch = true;
            }
        }
        
        // Item must match all filters
        return categoryMatch && difficultyMatch && calorieMatch;
    });

    // Category handlers
    const handleCategoryCheck = (categoryId) => {
        setCheckedCategories(prev => 
            prev.includes(categoryId) 
                ? prev.filter(id => id !== categoryId) 
                : [...prev, categoryId]
        );
    };

    const handleOpenCategoryDeleteConfirm = (categoryId) => {
        const category = categoryData.find(cat => cat.id === categoryId);
        if (!category) return;
        
        // Find exercises that would be affected by deleting this category
        const exercisesToDelete = egzersizData.filter(exercise => exercise.category_id === categoryId);
        
        setCategoryToDelete(category);
        setAffectedExercises(exercisesToDelete);
        setDeleteCategoryConfirmModal(true);
    };

    const handleAddCategory = () => {
        if (newCategoryTitle.trim() === '') return;
        
        const newCategory = {
            exercise_category_name: newCategoryTitle.trim()
        };
        
        // Make API call to add the category
        axios.post(`${config[config.environment].apiUrl}/exercise/addExerciseCategory`, newCategory, {
            headers: { Authorization: localStorage.getItem("token") }
        })
        .then(response => {
            // Add the new category to the state
            setCategoryData([...categoryData, response.data]);
            setNewCategoryTitle('');
            setAddCategoryModal(false);
            
            // Show success message
            setSuccessMessage(`"${newCategory.exercise_category_name}" kategorisi başarıyla eklendi.`);
            setShowSuccessPopup(true);
        })
        .catch(error => {
            console.error("Error adding category:", error);
            setErrorMessage("Kategori eklenirken bir hata oluştu.");
            setShowErrorPopup(true);
        });
    };

    // Exercise card handlers
    const handleOpenDetailModal = (item) => {
        setDetailItem(item);
        setDetailModal(true);
    };

    const handleOpenAddToUserModal = (item) => {
        setSelectedExercise(item);
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

    const handlePrint = (item) => {
        // Implementation for printing exercise details
        generatePDF(item);
    };

    const handleEdit = (item) => {
        setSelectedExercise(item);
        
        // Set form fields with current values
        setEditExerciseData({
            exercise_id: item.id,
            exercise_name: item.exercise_name || '',
            exercise_description: item.exercise_description || '',
            category_id: item.category_id || '',
            video: item.video || '',
            duration: item.duration || 30,
            difficulty: item.difficulty || 3,
            equipment: item.equipment || '',
            calories_burned: item.calories_burned || 0
        });
        
        setEditExerciseModal(true);
    };

    const handleOpenDeleteConfirm = (item) => {
        setItemToDelete(item);
        setDeleteConfirmModal(true);
    };

    const handleDelete = () => {
        if (!itemToDelete) return;
        
        axios.delete(`${config[config.environment].apiUrl}/exercise/deleteExercise?exercise_id=${itemToDelete.id}`, {
            headers: { Authorization: localStorage.getItem("token") }
        })
        .then((response) => {
            setEgzersizData(prev => prev.filter(item => item.id !== itemToDelete.id));
            setDeleteConfirmModal(false);
            setItemToDelete(null);
            
            setSuccessMessage(`"${itemToDelete.exercise_name}" egzersizi başarıyla silindi.`);
            setShowSuccessPopup(true);
        })
        .catch(error => {
            console.error("Error deleting exercise:", error);
            setErrorMessage("Egzersiz silinirken bir hata oluştu.");
            setShowErrorPopup(true);
            setDeleteConfirmModal(false);
            setItemToDelete(null);
        });
    };

    const handleSingleCategoryDelete = () => {
        if (!categoryToDelete) return;
        
        axios.delete(`${config[config.environment].apiUrl}/exercise/deleteExerciseCategory?exercise_category_id=${categoryToDelete.id}`, {
            headers: { Authorization: localStorage.getItem("token") }
        })
        .then(() => {
            // Update local state after successful deletion
            setCategoryData(prev => prev.filter(cat => cat.id !== categoryToDelete.id));
            setCheckedCategories(prev => prev.filter(id => id !== categoryToDelete.id));
            // Also remove any exercises that were in the deleted category
            setEgzersizData(prev => prev.filter(exercise => exercise.category_id !== categoryToDelete.id));
            setDeleteCategoryConfirmModal(false);
            setCategoryToDelete(null);
            setAffectedExercises([]);
            
            // Show success popup
            setSuccessMessage(`"${categoryToDelete.name}" kategorisi başarıyla silindi.`);
            setShowSuccessPopup(true);
        })
        .catch(error => {
            console.error("Error deleting category:", error);
            setErrorMessage("Kategori silinirken bir hata oluştu.");
            setShowErrorPopup(true);
            setDeleteCategoryConfirmModal(false);
            setCategoryToDelete(null);
            setAffectedExercises([]);
        });
    };

    const handleAddExercise = () => {
        if (!newExercise.exercise_name.trim() || !newExercise.category_id) return;
        
        setIsSaving(true);
        
        axios.post(`${config[config.environment].apiUrl}/exercise/addExercise`, newExercise, {
            headers: { Authorization: localStorage.getItem("token") }
        })
        .then(response => {
            // Add the new exercise to the state
            setEgzersizData([...egzersizData, response.data]);
            
            // Reset form
            setNewExercise({
                exercise_name: '',
                exercise_description: '',
                category_id: '',
                video: '',
                duration: 30,
                difficulty: 3,
                equipment: '',
                calories_burned: 0
            });
            setAddExerciseModal(false);
            
            // Show success message
            setSuccessMessage(`"${response.data.exercise_name}" egzersizi başarıyla oluşturuldu.`);
            setShowSuccessPopup(true);
        })
        .catch(error => {
            console.error("Error adding exercise:", error);
            setErrorMessage("Egzersiz eklenirken bir hata oluştu.");
            setShowErrorPopup(true);
        })
        .finally(() => {
            setIsSaving(false);
        });
    };

    const handleSaveExercise = () => {
        if (!editExerciseData.exercise_name.trim() || !editExerciseData.category_id) return;
        
        setIsSaving(true);
        
        axios.put(`${config[config.environment].apiUrl}/exercise/updateExercise`, editExerciseData, {
            headers: { Authorization: localStorage.getItem("token") }
        })
        .then(response => {
            // Update the exercise in the state
            setEgzersizData(prev => 
                prev.map(item => 
                    item.id === editExerciseData.exercise_id ? response.data : item
                )
            );
            
            // Close modal and reset form
            setEditExerciseModal(false);
            setSelectedExercise(null);
            setEditExerciseData({
                exercise_id: '',
                exercise_name: '',
                exercise_description: '',
                category_id: '',
                video: '',
                duration: 30,
                difficulty: 3,
                equipment: '',
                calories_burned: 0
            });
            
            // Show success message
            setSuccessMessage(`"${response.data.exercise_name}" egzersizi başarıyla güncellendi.`);
            setShowSuccessPopup(true);
        })
        .catch(error => {
            console.error("Error updating exercise:", error);
            setErrorMessage("Egzersiz güncellenirken bir hata oluştu.");
            setShowErrorPopup(true);
        })
        .finally(() => {
            setIsSaving(false);
        });
    };

    const handleAddToUser = () => {
        if (!selectedExercise || !selectedUser || !startDate || !endDate) return;
        
        const addData = {
            client_id: selectedUser.id,
            exercise_id: selectedExercise.id,
            start_date: startDate,
            end_date: endDate,
            note: assignmentNote
        };
        
        setIsSaving(true);

        axios.post(`${config[config.environment].apiUrl}/exercise/assignExercise`, addData, {
            headers: { Authorization: localStorage.getItem("token") }
        })
        .then(response => {
            setAddToUserModal(false);
            setSelectedExercise(null);
            setSelectedUser(null);
            setStartDate('');
            setEndDate('');
            setAssignmentNote('');

            setSuccessMessage(`"${selectedExercise.exercise_name}" egzersiz programı "${selectedUser.name}" danışanına başarıyla atandı.`);
            setShowSuccessPopup(true);
        })
        .catch(error => {
            console.error("Error assigning exercise:", error);
            setErrorMessage("Egzersiz atanırken bir hata oluştu.");
            setShowErrorPopup(true);
        })
        .finally(() => {
            setIsSaving(false);
        });
    };

    // PDF generation for exercise details
    const generatePDF = (exercise) => {
        // Create a new PDF document
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(20);
        doc.text(exercise.exercise_name, 20, 20);
        
        // Add details
        doc.setFontSize(12);
        doc.text("Egzersiz Detayları", 20, 30);
        
        // Add content
        doc.setFontSize(10);
        let y = 40;
        
        if (exercise.exercise_description) {
            doc.text("Açıklama:", 20, y);
            doc.text(exercise.exercise_description, 60, y);
            y += 10;
        }
        
        if (exercise.equipment) {
            doc.text("Ekipman:", 20, y);
            doc.text(exercise.equipment, 60, y);
            y += 10;
        }
        
        doc.text("Süre:", 20, y);
        doc.text(`${exercise.duration || 0} dakika`, 60, y);
        y += 10;
        
        doc.text("Zorluk:", 20, y);
        doc.text(`${exercise.difficulty || 0}/5`, 60, y);
        y += 10;
        
        doc.text("Yakılan Kalori:", 20, y);
        doc.text(`${exercise.calories_burned || 0} kcal`, 60, y);
        y += 10;
        
        if (exercise.video) {
            doc.text("Video Linki:", 20, y);
            doc.text(exercise.video, 60, y);
            y += 10;
        }
        
        // Save the PDF
        doc.save(`${exercise.exercise_name}_egzersiz.pdf`);
    };

    return (
        <Default>
            <div className="egzersizler-container">
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
                                title="Egzersiz Ekle"
                                onClick={() => setAddExerciseModal(true)}
                            >
                                <AddIcon />
                                <span className="btn-text">Egzersiz Ekle</span>
                            </button>
                            <button 
                                className="action-btn add-btn" 
                                title="Kategori Ekle"
                                onClick={() => setAddCategoryModal(true)}
                            >
                                <AddIcon />
                                <span className="btn-text">Kategori Ekle</span>
                            </button>
                        </div>
                    </div>

                    <div className="categories-list">
                        {filteredCategories.length > 0 ? (
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

                {/* Right Panel - Exercise Programs */}
                <div className="programs-panel">
                    {/* Filters section */}
                    <div className="filters-container">
                        {/* Difficulty filter */}
                        <div className="filter-group">
                            <h3 className="filter-title">Zorluk Seviyesi:</h3>
                            <div className="difficulty-options">
                                <button 
                                    className={`difficulty-btn ${difficultyFilter === 0 ? 'active' : ''}`} 
                                    onClick={() => setDifficultyFilter(0)}
                                >
                                    Tümü
                                </button>
                                {[1, 2, 3, 4, 5].map(level => (
                                    <button 
                                        key={level}
                                        className={`difficulty-btn ${difficultyFilter === level ? 'active' : ''}`} 
                                        onClick={() => setDifficultyFilter(level)}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Calorie filter */}
                        <div className="filter-group">
                            <h3 className="filter-title">Kalori Aralığı:</h3>
                            <div className="calorie-options">
                                <button 
                                    className={`calorie-btn ${calorieFilter === null ? 'active' : ''}`} 
                                    onClick={() => setCalorieFilter(null)}
                                >
                                    Tümü
                                </button>
                                {['0-50', '50-100', '100-200', '200-300', '300-500', '500+'].map(range => (
                                    <button 
                                        key={range}
                                        className={`calorie-btn ${calorieFilter === range ? 'active' : ''}`} 
                                        onClick={() => setCalorieFilter(range)}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="exercise-cards-grid">
                        {loading ? (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p>Egzersiz programları yükleniyor...</p>
                            </div>
                        ) : filteredExerciseData.length > 0 ? (
                            filteredExerciseData.map((item) => (
                                <ExerciseCard 
                                    key={item.id}
                                    item={item}
                                    onAddToUser={handleOpenAddToUserModal}
                                    onPrint={handlePrint}
                                    onEdit={handleEdit}
                                    onDelete={handleOpenDeleteConfirm}
                                    onView={handleOpenDetailModal}
                                />
                            ))
                        ) : (
                            <div className="no-programs">
                                <p>Bu kategoriye ait egzersiz programı bulunamadı.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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

            {/* Detail Modal */}
            <Modal 
                isOpen={detailModal} 
                title={detailItem?.exercise_name} 
                onClose={() => setDetailModal(false)}
            >
                <div className="detail-modal-content">
                    <p className="detail-description">{detailItem?.exercise_description}</p>
                    
                    <div className="exercise-detail-info">
                        {detailItem?.equipment && (
                            <div className="detail-info-item">
                                <strong>Ekipman:</strong> {detailItem.equipment}
                            </div>
                        )}
                        {detailItem?.duration && (
                            <div className="detail-info-item">
                                <strong>Süre:</strong> {detailItem.duration} dakika
                            </div>
                        )}
                        {detailItem?.difficulty && (
                            <div className="detail-info-item">
                                <strong>Zorluk:</strong> {detailItem.difficulty}/5
                            </div>
                        )}
                        {detailItem?.calories_burned && (
                            <div className="detail-info-item">
                                <strong>Yakılan Kalori:</strong> {detailItem.calories_burned} kcal
                            </div>
                        )}
                    </div>
                    
                    {detailItem?.video && (
                        <div className="video-link">
                            <a href={detailItem.video} target="_blank" rel="noopener noreferrer">
                                Egzersiz Videosunu İzle
                            </a>
                        </div>
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

            {/* Delete Confirmation Modal */}
            <Modal 
                isOpen={deleteConfirmModal} 
                title="Egzersiz Programını Sil" 
                onClose={() => {
                    setDeleteConfirmModal(false);
                    setItemToDelete(null);
                }}
            >
                <div className="modal-body delete-confirm-modal">
                    <div className="delete-warning">
                        <WarningIcon className="warning-icon" />
                        <p className="warning-text">
                            <strong>{itemToDelete?.exercise_name}</strong> egzersizini silmek istediğinize emin misiniz?
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
                }}
            >
                <div className="modal-body delete-confirm-modal">
                    <div className="delete-warning">
                        <WarningIcon className="warning-icon" />
                        <p className="warning-text">
                            <strong>{categoryToDelete?.name}</strong> kategorisini silmek istediğinize emin misiniz?
                        </p>
                    </div>
                    <p className="delete-note">Bu işlem geri alınamaz.</p>
                    
                    {affectedExercises.length > 0 && (
                        <div className="affected-plans">
                            <p className="delete-note important">
                                <strong>Önemli:</strong> Bu kategori ile ilişkili <strong>{affectedExercises.length}</strong> egzersiz silinecektir:
                            </p>
                            <ul className="affected-plans-list">
                                {affectedExercises.map(exercise => (
                                    <li key={exercise.id}><span className="plan-title">{exercise.exercise_name}</span></li>
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

            {/* Add Exercise Modal */}
            <Modal 
                isOpen={addExerciseModal} 
                title="Egzersiz Ekle" 
                onClose={() => setAddExerciseModal(false)}
            >
                <div className="modal-body">
                    <div className="input-container">
                        <label htmlFor="exerciseName">Egzersiz Adı</label>
                        <input 
                            type="text" 
                            id="exerciseName"
                            className="text-input" 
                            value={newExercise.exercise_name}
                            onChange={(e) => setNewExercise({...newExercise, exercise_name: e.target.value})}
                            placeholder="Egzersiz adını giriniz"
                        />
                    </div>
                    <div className="input-container">
                        <label htmlFor="exerciseDescription">Açıklama</label>
                        <textarea 
                            id="exerciseDescription"
                            className="text-input textarea" 
                            value={newExercise.exercise_description}
                            onChange={(e) => setNewExercise({...newExercise, exercise_description: e.target.value})}
                            placeholder="Egzersiz açıklaması giriniz"
                            rows={3}
                        />
                    </div>
                    <div className="input-container">
                        <label htmlFor="exerciseCategory">Kategori</label>
                        <select 
                            id="exerciseCategory"
                            className="text-input" 
                            value={newExercise.category_id}
                            onChange={(e) => setNewExercise({...newExercise, category_id: e.target.value})}
                        >
                            <option value="">Kategori Seçin</option>
                            {categoryData.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="input-container">
                        <label htmlFor="exerciseVideo">Video URL (Opsiyonel)</label>
                        <input 
                            type="text" 
                            id="exerciseVideo"
                            className="text-input" 
                            value={newExercise.video}
                            onChange={(e) => setNewExercise({...newExercise, video: e.target.value})}
                            placeholder="Video URL adresi giriniz"
                        />
                    </div>
                    <div className="exercise-details-row">
                        <div className="input-container half-width">
                            <label htmlFor="exerciseDuration">Süre (Dakika)</label>
                            <input 
                                type="number" 
                                id="exerciseDuration"
                                className="text-input" 
                                value={newExercise.duration}
                                onChange={(e) => setNewExercise({...newExercise, duration: parseInt(e.target.value) || 0})}
                                min="0"
                            />
                        </div>
                        <div className="input-container half-width">
                            <label htmlFor="exerciseDifficulty">Zorluk (1-5)</label>
                            <input 
                                type="number" 
                                id="exerciseDifficulty"
                                className="text-input" 
                                value={newExercise.difficulty}
                                onChange={(e) => setNewExercise({...newExercise, difficulty: parseInt(e.target.value) || 1})}
                                min="1"
                                max="5"
                            />
                        </div>
                    </div>
                    <div className="exercise-details-row">
                        <div className="input-container half-width">
                            <label htmlFor="exerciseEquipment">Ekipman</label>
                            <input 
                                type="text" 
                                id="exerciseEquipment"
                                className="text-input" 
                                value={newExercise.equipment}
                                onChange={(e) => setNewExercise({...newExercise, equipment: e.target.value})}
                                placeholder="Gerekli ekipman"
                            />
                        </div>
                        <div className="input-container half-width">
                            <label htmlFor="exerciseCalories">Yakılan Kalori</label>
                            <input 
                                type="number" 
                                id="exerciseCalories"
                                className="text-input" 
                                value={newExercise.calories_burned}
                                onChange={(e) => setNewExercise({...newExercise, calories_burned: parseInt(e.target.value) || 0})}
                                min="0"
                            />
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button 
                        className="modal-btn cancel-btn" 
                        onClick={() => setAddExerciseModal(false)}
                    >
                        Vazgeç
                    </button>
                    <button 
                        className="modal-btn confirm-btn" 
                        onClick={handleAddExercise}
                        disabled={!newExercise.exercise_name.trim() || !newExercise.category_id || isSaving}
                    >
                        {isSaving ? 'Ekleniyor...' : 'Ekle'}
                    </button>
                </div>
            </Modal>

            {/* Edit Exercise Modal */}
            <Modal 
                isOpen={editExerciseModal} 
                title="Egzersiz Düzenle" 
                onClose={() => setEditExerciseModal(false)}
            >
                <div className="modal-body">
                    <div className="input-container">
                        <label htmlFor="editExerciseName">Egzersiz Adı</label>
                        <input 
                            type="text" 
                            id="editExerciseName"
                            className="text-input" 
                            value={editExerciseData.exercise_name}
                            onChange={(e) => setEditExerciseData({...editExerciseData, exercise_name: e.target.value})}
                            placeholder="Egzersiz adını giriniz"
                        />
                    </div>
                    <div className="input-container">
                        <label htmlFor="editExerciseDescription">Açıklama</label>
                        <textarea 
                            id="editExerciseDescription"
                            className="text-input textarea" 
                            value={editExerciseData.exercise_description}
                            onChange={(e) => setEditExerciseData({...editExerciseData, exercise_description: e.target.value})}
                            placeholder="Egzersiz açıklaması giriniz"
                            rows={3}
                        />
                    </div>
                    <div className="input-container">
                        <label htmlFor="editExerciseCategory">Kategori</label>
                        <select 
                            id="editExerciseCategory"
                            className="text-input" 
                            value={editExerciseData.category_id}
                            onChange={(e) => setEditExerciseData({...editExerciseData, category_id: e.target.value})}
                        >
                            <option value="">Kategori Seçin</option>
                            {categoryData.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="input-container">
                        <label htmlFor="editExerciseVideo">Video URL (Opsiyonel)</label>
                        <input 
                            type="text" 
                            id="editExerciseVideo"
                            className="text-input" 
                            value={editExerciseData.video}
                            onChange={(e) => setEditExerciseData({...editExerciseData, video: e.target.value})}
                            placeholder="Video URL adresi giriniz"
                        />
                    </div>
                    <div className="exercise-details-row">
                        <div className="input-container half-width">
                            <label htmlFor="editExerciseDuration">Süre (Dakika)</label>
                            <input 
                                type="number" 
                                id="editExerciseDuration"
                                className="text-input" 
                                value={editExerciseData.duration}
                                onChange={(e) => setEditExerciseData({...editExerciseData, duration: parseInt(e.target.value) || 0})}
                                min="0"
                            />
                        </div>
                        <div className="input-container half-width">
                            <label htmlFor="editExerciseDifficulty">Zorluk (1-5)</label>
                            <input 
                                type="number" 
                                id="editExerciseDifficulty"
                                className="text-input" 
                                value={editExerciseData.difficulty}
                                onChange={(e) => setEditExerciseData({...editExerciseData, difficulty: parseInt(e.target.value) || 1})}
                                min="1"
                                max="5"
                            />
                        </div>
                    </div>
                    <div className="exercise-details-row">
                        <div className="input-container half-width">
                            <label htmlFor="editExerciseEquipment">Ekipman</label>
                            <input 
                                type="text" 
                                id="editExerciseEquipment"
                                className="text-input" 
                                value={editExerciseData.equipment}
                                onChange={(e) => setEditExerciseData({...editExerciseData, equipment: e.target.value})}
                                placeholder="Gerekli ekipman"
                            />
                        </div>
                        <div className="input-container half-width">
                            <label htmlFor="editExerciseCalories">Yakılan Kalori</label>
                            <input 
                                type="number" 
                                id="editExerciseCalories"
                                className="text-input" 
                                value={editExerciseData.calories_burned}
                                onChange={(e) => setEditExerciseData({...editExerciseData, calories_burned: parseInt(e.target.value) || 0})}
                                min="0"
                            />
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button 
                        className="modal-btn cancel-btn" 
                        onClick={() => setEditExerciseModal(false)}
                    >
                        Vazgeç
                    </button>
                    <button 
                        className="modal-btn confirm-btn" 
                        onClick={handleSaveExercise}
                        disabled={!editExerciseData.exercise_name.trim() || !editExerciseData.category_id || isSaving}
                    >
                        {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
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
                        Seçilen egzersiz: <strong>{selectedExercise?.exercise_name}</strong>
                    </p>
                    <p className="assign-note">
                        <strong>Not:</strong> Danışanınız bu egzersiz programını gerçekleştirdikçe, mobil uygulamada ilerleme kaydedebilecek.
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
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
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
                        </LocalizationProvider>
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

