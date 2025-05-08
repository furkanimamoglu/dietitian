import React, { useEffect, useState } from 'react';
import './Beslenme.css';
import Default from "../../Components/Layouts/Default.jsx";
import axios from "axios";
import config from "../../config.js";

// Icons
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import EventNoteIcon from '@mui/icons-material/EventNote';

const initialBeslenmeData = [
    { id: 1, title: "Kilo Aldırma", description: "x2 yumurta, 5x furkan, 500 gr peynir", image: "/kiloal.png", categoryId: 1 },
    { id: 2, title: "Kilo Verme", description: "x1 yumurta, 1x elma, 200 gr yoğurt", image: "/placeholder.png", categoryId: 2 },
    { id: 3, title: "Kas Yapımı", description: "x3 yumurta, 300 gr tavuk, 1x muz", image: "/placeholder.png", categoryId: 3 },
    { id: 4, title: "Dengeli Beslenme", description: "x1 avokado, 200 gr yulaf, 1x yoğurt", image: "/placeholder.png", categoryId: 4 },
    { id: 5, title: "Sağlıklı Atıştırma", description: "x2 ceviz, 1x hurma, 50 gr bitter çikolata", image: "/placeholder.png", categoryId: 5 },
    { id: 6, title: "Protein Ağırlıklı", description: "x5 yumurta, 200 gr hindi, 2x muz", image: "/placeholder.png", categoryId: 1 },
];

// Days and meals constants
const DAYS_OF_WEEK = [
    "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"
];

const MEALS = [
    "Kahvaltı", "Ara Öğün 1", "Öğle Yemeği", "Ara Öğün 2", "Akşam Yemeği", "Ara Öğün 3"
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
            <div className="category-title">{category.title}</div>
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
const NutritionCard = ({ item, onImageClick, onAddToUser, onPrint, onEdit, onDelete, onPlanMeals }) => {
    return (
        <div className="nutrition-card">
            <div className="card-image-container" onClick={() => onImageClick(item)}>
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
                        className="action-button plan-meals-btn" 
                        title="Haftalık Plan"
                        onClick={() => onPlanMeals(item)}
                    >
                        <EventNoteIcon />
                    </button>
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
                            <textarea
                                className="meal-input"
                                value={mealPlan[selectedDay][meal] || ''}
                                onChange={(e) => onMealChange(selectedDay, meal, e.target.value)}
                                placeholder={`${selectedDay} - ${meal} için yemekleri girin...`}
                                rows={3}
                            />
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
    const [beslenmeData, setBeslenmeData] = useState(initialBeslenmeData);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal states
    const [addToUserModal, setAddToUserModal] = useState(false);
    const [detailModal, setDetailModal] = useState(false);
    const [addCategoryModal, setAddCategoryModal] = useState(false);
    const [mealPlanModal, setMealPlanModal] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [detailItem, setDetailItem] = useState(null);
    const [newCategoryTitle, setNewCategoryTitle] = useState('');
    
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
            .get(`${config[config.environment].apiUrl}/dietitian/getAllMyNutritionCategories`, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            })
            .then((response) => {
                setCategoryData(response.data);
            })
            .catch((error) => {
                console.error("Error fetching categories:", error);
                // Fallback to sample categories if API fails
                setCategoryData([
                    { id: 1, title: "Kilo Aldırma" },
                    { id: 2, title: "Kilo Verme" },
                    { id: 3, title: "Kas Yapımı" },
                    { id: 4, title: "Dengeli Beslenme" },
                    { id: 5, title: "Sağlıklı Atıştırma" }
                ]);
            });
    }, []);

    // Filter categories based on search term
    const filteredCategories = categoryData?.filter(category => 
        category.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter nutrition programs based on selected categories
    const filteredBeslenmeData = beslenmeData.filter(item => {
        // If no categories are checked, show all items
        if (checkedCategories.length === 0) {
            return true;
        }
        // Otherwise, show only items that belong to checked categories
        return checkedCategories.includes(item.categoryId);
    });

    // Category handlers
    const handleCategoryCheck = (categoryId) => {
        setCheckedCategories(prev => 
            prev.includes(categoryId) 
                ? prev.filter(id => id !== categoryId) 
                : [...prev, categoryId]
        );
    };

    const handleMultiDelete = () => {
        setCategoryData(prev => 
            prev.filter(cat => !checkedCategories.includes(cat.id))
        );
        setCheckedCategories([]);
    };

    const handleSingleCategoryDelete = (categoryId) => {
        setCategoryData(prev => prev.filter(cat => cat.id !== categoryId));
        setCheckedCategories(prev => prev.filter(id => id !== categoryId));
    };

    const handleAddCategory = () => {
        if (newCategoryTitle.trim() === '') return;
        
        const newCategory = {
            id: categoryData.length > 0 ? Math.max(...categoryData.map(c => c.id)) + 1 : 1,
            title: newCategoryTitle.trim()
        };
        
        // In a real app, you would make an API call here
        // axios.post(`${config[config.environment].apiUrl}/dietitian/addNutritionCategory`, newCategory, {
        //     headers: { Authorization: localStorage.getItem("token") }
        // })
        // .then(response => {
        //     setCategoryData([...categoryData, response.data]);
        // })
        // .catch(error => console.error("Error adding category:", error));
        
        // For now, just update the state directly
        setCategoryData([...categoryData, newCategory]);
        setNewCategoryTitle('');
        setAddCategoryModal(false);
    };

    // Nutrition card handlers
    const handleOpenDetailModal = (item) => {
        setDetailItem(item);
        setDetailModal(true);
    };

    const handleOpenAddToUserModal = (item) => {
        setSelectedProgram(item);
        setAddToUserModal(true);
    };

    const handleOpenMealPlanModal = (item) => {
        setSelectedProgram(item);
        // Reset meal plan when opening for a new program
        setMealPlan(() => {
            const initialPlan = {};
            DAYS_OF_WEEK.forEach(day => {
                initialPlan[day] = {};
                MEALS.forEach(meal => {
                    initialPlan[day][meal] = '';
                });
            });
            return initialPlan;
        });
        setSelectedDay(DAYS_OF_WEEK[0]);
        setMealPlanModal(true);
    };

    const handleAddToUser = () => {
        console.log("Adding program:", selectedProgram);
        console.log("To user:", selectedUser);
        setAddToUserModal(false);
        setSelectedProgram(null);
        setSelectedUser(null);
    };

    const handlePrint = (item) => {
        console.log("Printing:", item);
        window.print();
    };

    const handleEdit = (item) => {
        console.log("Editing:", item);
        // Implement edit functionality
    };

    const handleDelete = (item) => {
        setBeslenmeData(prev => prev.filter(dataItem => dataItem.id !== item.id));
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

    const handleSaveMealPlan = () => {
        console.log("Saving meal plan for program:", selectedProgram?.title);
        console.log("Meal plan data:", mealPlan);
        
        // In a real app, you would make an API call here to save the meal plan
        // axios.post(`${config[config.environment].apiUrl}/dietitian/saveMealPlan`, {
        //     programId: selectedProgram.id,
        //     mealPlan: mealPlan
        // }, {
        //     headers: { Authorization: localStorage.getItem("token") }
        // })
        // .then(response => {
        //     // Handle success
        //     setMealPlanModal(false);
        // })
        // .catch(error => console.error("Error saving meal plan:", error));
        
        // For now, just close the modal
        setMealPlanModal(false);
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
                                className="action-btn add-btn" 
                                title="Kategori Ekle"
                                onClick={() => setAddCategoryModal(true)}
                            >
                                <AddIcon />
                            </button>
                            <button 
                                className="action-btn delete-btn" 
                                title="Seçilenleri Sil"
                                onClick={handleMultiDelete}
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
                                    onDelete={handleSingleCategoryDelete}
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
                                    onImageClick={handleOpenDetailModal}
                                    onAddToUser={handleOpenAddToUserModal}
                                    onPlanMeals={handleOpenMealPlanModal}
                                    onPrint={handlePrint}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
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
                    <div className="user-select-container">
                        <select 
                            className="user-select"
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
                                    {user.name} {user.surname}
                                </option>
                            ))}
                        </select>
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
                        disabled={!selectedUser}
                    >
                        Ekle
                    </button>
                </div>
            </Modal>

            {/* Meal Plan Modal */}
            <Modal 
                isOpen={mealPlanModal} 
                title={`Haftalık Beslenme Planı - ${selectedProgram?.title}`}
                onClose={() => setMealPlanModal(false)}
                fullWidth={true}
            >
                <div className="modal-body meal-plan-modal">
                    <MealPlanTable 
                        mealPlan={mealPlan}
                        onMealChange={handleMealChange}
                        selectedDay={selectedDay}
                        onDayChange={handleDayChange}
                    />
                </div>
                <div className="modal-footer">
                    <div className="meal-plan-client-select">
                        <select 
                            className="user-select"
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
                                    {user.name} {user.surname}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button 
                        className="modal-btn cancel-btn" 
                        onClick={() => setMealPlanModal(false)}
                    >
                        Vazgeç
                    </button>
                    <button 
                        className="modal-btn confirm-btn" 
                        onClick={handleSaveMealPlan}
                        disabled={!selectedUser}
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
        </Default>
    );
}
