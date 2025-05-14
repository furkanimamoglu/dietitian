import React, { useEffect, useState } from 'react';
import './Egzersizler.css';
import Default from "../../Components/Layouts/Default.jsx";
import axios from "axios";
import config from "../../config.js";
import { toast } from 'react-hot-toast';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
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

// Exercise Card Component
const ExerciseCard = ({ item, onAddToUser, onPrint, onEdit, onDelete, onView }) => {
    return (
        <div className="exercise-card">
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

export default function Egzersizler() {
    const [categoryData, setCategoryData] = useState([]);
    const [checkedCategories, setCheckedCategories] = useState([]);
    const [danisanList, setDanisanList] = useState([]);
    const [egzersizData, setEgzersizData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
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

    // New exercise state
    const [newExercise, setNewExercise] = useState({
        title: '',
        description: '',
        category_id: '',
        image: ''
    });
    
    // Edit exercise states
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editCategoryId, setEditCategoryId] = useState('');
    const [editImage, setEditImage] = useState('');
    
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

    // Mock data for development purposes
    // We'll replace with actual API calls
    useEffect(() => {
        // Sample categories
        setCategoryData([
            { id: '1', name: 'Kardio' },
            { id: '2', name: 'Kuvvet' },
            { id: '3', name: 'Esneklik' },
            { id: '4', name: 'Denge' },
            { id: '5', name: 'Yüksek Yoğunluk' }
        ]);
        
        // Sample exercise data
        setEgzersizData([
            {
                id: '1',
                title: 'Koşu Programı',
                description: '30 dakikalık interval koşu programı',
                category_id: '1',
                image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
            },
            {
                id: '2',
                title: 'Ağırlık Çalışması',
                description: 'Temel kuvvet egzersizleri',
                category_id: '2',
                image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
            },
            {
                id: '3',
                title: 'Yoga Seansı',
                description: 'Esneklik ve denge için yoga',
                category_id: '3',
                image: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
            }
        ]);
        
        setLoading(false);
    }, []);

    // Fetch clients data
    useEffect(() => {
        // Mock client data for development
        setDanisanList([
            { id: 1, name: 'Ahmet Yılmaz' },
            { id: 2, name: 'Ayşe Demir' },
            { id: 3, name: 'Mehmet Kaya' },
            { id: 4, name: 'Fatma Şahin' }
        ]);
    }, []);

    // Filter categories based on search term
    const filteredCategories = categoryData.filter(category =>
        (category?.name || category?.title || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter exercise programs based on selected categories
    const filteredExerciseData = egzersizData.filter(item => {
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

    const handleOpenCategoryDeleteConfirm = (categoryId) => {
        const category = categoryData.find(cat => cat.id === categoryId);
        if (!category) return;
        
        setCategoryToDelete(category);
        setDeleteCategoryConfirmModal(true);
    };

    const handleAddCategory = () => {
        if (newCategoryTitle.trim() === '') return;
        
        // Just add to local state for now (mock)
        const newCategory = {
            id: String(Date.now()),
            name: newCategoryTitle.trim()
        };
        
        setCategoryData([...categoryData, newCategory]);
        setNewCategoryTitle('');
        setAddCategoryModal(false);
        
        // Show success message
        setSuccessMessage(`"${newCategory.name}" kategorisi başarıyla eklendi.`);
        setShowSuccessPopup(true);
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
        console.log("Printing:", item);
        // Implementation would be similar to Beslenme page
    };

    const handleEdit = (item) => {
        setSelectedExercise(item);
        
        // Set form fields with current values
        setEditTitle(item.title || '');
        setEditDescription(item.description || '');
        setEditCategoryId(item.category_id || '');
        setEditImage(item.image || '');
        
        setEditExerciseModal(true);
    };

    const handleOpenDeleteConfirm = (item) => {
        setItemToDelete(item);
        setDeleteConfirmModal(true);
    };

    const handleDelete = () => {
        if (!itemToDelete) return;
        
        // Mock delete - just remove from local state
        setEgzersizData(prev => prev.filter(item => item.id !== itemToDelete.id));
        setDeleteConfirmModal(false);
        setItemToDelete(null);
        
        // Show success message
        setSuccessMessage(`"${itemToDelete.title}" egzersizi başarıyla silindi.`);
        setShowSuccessPopup(true);
    };

    const handleSingleCategoryDelete = () => {
        if (!categoryToDelete) return;
        
        // Mock delete - just remove from local state
        setCategoryData(prev => prev.filter(cat => cat.id !== categoryToDelete.id));
        setCheckedCategories(prev => prev.filter(id => id !== categoryToDelete.id));
        setDeleteCategoryConfirmModal(false);
        setCategoryToDelete(null);
        
        // Show success message
        setSuccessMessage(`"${categoryToDelete.name}" kategorisi başarıyla silindi.`);
        setShowSuccessPopup(true);
    };

    const handleAddExercise = () => {
        if (!newExercise.title.trim() || !newExercise.category_id) return;
        
        // Mock implementation - just add to local state
        const newItem = {
            ...newExercise,
            id: String(Date.now())
        };
        
        setEgzersizData([...egzersizData, newItem]);
        
        // Reset form
        setNewExercise({
            title: '',
            description: '',
            category_id: '',
            image: ''
        });
        setAddExerciseModal(false);
        
        // Show success message
        setSuccessMessage(`"${newItem.title}" egzersizi başarıyla oluşturuldu.`);
        setShowSuccessPopup(true);
    };

    const handleSaveExercise = () => {
        if (!editTitle.trim() || !editCategoryId) return;
        
        // Mock implementation - update the local state
        const updatedExercise = {
            ...selectedExercise,
            title: editTitle,
            description: editDescription,
            category_id: editCategoryId,
            image: editImage
        };
        
        setEgzersizData(prev => 
            prev.map(item => 
                item.id === selectedExercise.id ? updatedExercise : item
            )
        );
        
        // Close modal and reset form
        setEditExerciseModal(false);
        setSelectedExercise(null);
        setEditTitle('');
        setEditDescription('');
        setEditCategoryId('');
        setEditImage('');
        
        // Show success message
        setSuccessMessage(`"${updatedExercise.title}" egzersizi başarıyla güncellendi.`);
        setShowSuccessPopup(true);
    };

    const handleAddToUser = () => {
        if (!selectedExercise || !selectedUser || !startDate || !endDate) return;
        
        // Mock implementation - in a real app this would make an API call
        console.log('Adding exercise to user:', {
            client_id: selectedUser.id,
            exercise_id: selectedExercise.id,
            start_date: startDate,
            end_date: endDate,
            note: assignmentNote
        });
        
        // Success case - store info for success message
        const exerciseName = selectedExercise.title;
        const userName = selectedUser.name;
        
        // Close the modal and reset states
        setAddToUserModal(false);
        setSelectedExercise(null);
        setSelectedUser(null);
        setStartDate('');
        setEndDate('');
        setAssignmentNote('');
        
        // Show success popup
        setSuccessMessage(`"${exerciseName}" egzersiz programı "${userName}" danışanına başarıyla atandı.`);
        setShowSuccessPopup(true);
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

                {/* Right Panel - Exercise Programs */}
                <div className="programs-panel">
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
                            <strong>{itemToDelete?.title}</strong> programını silmek istediğinize emin misiniz?
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
                        <label htmlFor="exerciseTitle">Egzersiz Adı</label>
                        <input 
                            type="text" 
                            id="exerciseTitle"
                            className="text-input" 
                            value={newExercise.title}
                            onChange={(e) => setNewExercise({...newExercise, title: e.target.value})}
                            placeholder="Egzersiz adını giriniz"
                        />
                    </div>
                    <div className="input-container">
                        <label htmlFor="exerciseDescription">Açıklama</label>
                        <textarea 
                            id="exerciseDescription"
                            className="text-input textarea" 
                            value={newExercise.description}
                            onChange={(e) => setNewExercise({...newExercise, description: e.target.value})}
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
                                    {category.name || category.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="input-container">
                        <label htmlFor="exerciseImage">Resim URL (Opsiyonel)</label>
                        <input 
                            type="text" 
                            id="exerciseImage"
                            className="text-input" 
                            value={newExercise.image}
                            onChange={(e) => setNewExercise({...newExercise, image: e.target.value})}
                            placeholder="Resim URL adresi giriniz"
                        />
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
                        disabled={!newExercise.title.trim() || !newExercise.category_id}
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
                        Seçilen egzersiz: <strong>{selectedExercise?.title}</strong>
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

            {/* Edit Exercise Modal */}
            <Modal 
                isOpen={editExerciseModal} 
                title="Egzersiz Düzenle" 
                onClose={() => setEditExerciseModal(false)}
            >
                <div className="modal-body">
                    <div className="input-container">
                        <label htmlFor="editExerciseTitle">Egzersiz Adı</label>
                        <input 
                            type="text" 
                            id="editExerciseTitle"
                            className="text-input" 
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Egzersiz adını giriniz"
                        />
                    </div>
                    <div className="input-container">
                        <label htmlFor="editExerciseDescription">Açıklama</label>
                        <textarea 
                            id="editExerciseDescription"
                            className="text-input textarea" 
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Egzersiz açıklaması giriniz"
                            rows={3}
                        />
                    </div>
                    <div className="input-container">
                        <label htmlFor="editExerciseCategory">Kategori</label>
                        <select 
                            id="editExerciseCategory"
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
                    <div className="input-container">
                        <label htmlFor="editExerciseImage">Resim URL (Opsiyonel)</label>
                        <input 
                            type="text" 
                            id="editExerciseImage"
                            className="text-input" 
                            value={editImage}
                            onChange={(e) => setEditImage(e.target.value)}
                            placeholder="Resim URL adresi giriniz"
                        />
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
                        disabled={!editTitle.trim() || !editCategoryId}
                    >
                        Kaydet
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