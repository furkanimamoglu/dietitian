import React, {useEffect, useState} from 'react';
import './Egzersizler.css';
import Default from "../../Components/Layouts/Default.jsx";
import axios from "axios";
import config from "../../config.js";

import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {tr} from "date-fns/locale";

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
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NoteIcon from '@mui/icons-material/Note';
import DescriptionIcon from '@mui/icons-material/Description';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import HistoryIcon from '@mui/icons-material/History';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

import {PDFDownloadLink} from '@react-pdf/renderer';

import ExerciseDocument from './ExerciseDocument.jsx';
import ReactPlayer from 'react-player';

import {
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper, Stack,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';

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
                    onChange={onCheck}
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
                <DeleteIcon/>
            </button>
        </div>
    );
};

const ExerciseCard = ({item, onAddToUser, onPrint, onEdit, onDelete, onView, dietitianInfo}) => {
    return (
        <div className="exercise-card">
            <div className="card-image-container" onClick={() => onView(item)}>
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.exercise_name}
                        className="card-image"
                    />
                ) : item.video ? (
                    <div className="video-container">
                        <ReactPlayer
                            url={item.video}
                            width="100%"
                            height="100%"
                            controls={true}
                            className="card-video"
                            config={{
                                youtube: {
                                    playerVars: {
                                        modestbranding: 1,
                                        rel: 0,
                                        showinfo: 0,
                                        iv_load_policy: 3,
                                        fs: 1,
                                        cc_load_policy: 0,
                                        cc_lang_pref: 'tr',
                                        hl: 'tr'
                                    }
                                }
                            }}
                        />
                    </div>
                ) : (
                    <div className="video-placeholder">
                        <FitnessCenterIcon className="exercise-icon"/>
                        <span>Görsel Yok</span>
                    </div>
                )}
            </div>
            <div className="card-content">
                <h3 className="card-title" onClick={() => onView(item)}
                    style={{cursor: 'pointer'}}>{item.exercise_name}</h3>
                <p className="card-description" onClick={() => onView(item)}
                   style={{cursor: 'pointer'}}>{item.exercise_description}</p>
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
                        <PersonAddIcon/>
                    </button>
                    <PDFDownloadLink
                        document={<ExerciseDocument exercise={item} assignmentData={null} dietitian={dietitianInfo} />}
                        fileName={`${item.exercise_name.replace(/\s+/g, '_')}_egzersiz_programi.pdf`}
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
        </div>
    );
};

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

export default function Egzersizler() {
    const [categoryData, setCategoryData] = useState([]);
    const [checkedCategories, setCheckedCategories] = useState([]);
    const [danisanList, setDanisanList] = useState([]);
    const [egzersizData, setEgzersizData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [exerciseSearchTerm, setExerciseSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [imagePreview, setImagePreview] = useState('');

    const [calorieFilter, setCalorieFilter] = useState('all');
    const [difficultyFilter, setDifficultyFilter] = useState('all');

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

    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteCategoryConfirmModal, setDeleteCategoryConfirmModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [affectedExercises, setAffectedExercises] = useState([]);
    const [deleteMultiCategoriesConfirmModal, setDeleteMultiCategoriesConfirmModal] = useState(false);

    const [newExercise, setNewExercise] = useState({
        exercise_name: '',
        exercise_description: '',
        category_id: '',
        video: '',
        image: '',
        duration: 30,
        difficulty: 3,
        equipment: '',
        calories_burned: 0
    });

    const [editExerciseData, setEditExerciseData] = useState({
        exercise_id: '',
        exercise_name: '',
        exercise_description: '',
        category_id: '',
        video: '',
        image: '',
        duration: 30,
        difficulty: 3,
        equipment: '',
        calories_burned: 0
    });

    const [danisanSearchTerm, setDanisanSearchTerm] = useState('');
    const [filteredDanisanList, setFilteredDanisanList] = useState([]);
    const [clientExercisesModal, setClientExercisesModal] = useState(false);
    const [selectedClientExercises, setSelectedClientExercises] = useState([]);
    const [loadingClientExercises, setLoadingClientExercises] = useState(false);
    const [selectedClientInfo, setSelectedClientInfo] = useState(null);

    const [deleteAssignmentConfirmModal, setDeleteAssignmentConfirmModal] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState(null);

    const [exerciseHistory, setExerciseHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyStartDate, setHistoryStartDate] = useState('');
    const [historyEndDate, setHistoryEndDate] = useState('');
    const [activeTab, setActiveTab] = useState(0);

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

    const setDateRange = (weeks) => {
        const today = new Date();
        const start = new Date(today);
        const end = new Date(today);

        if (weeks === 'month') {
            end.setMonth(end.getMonth() + 1);
        } else {
            end.setDate(end.getDate() + (7 * weeks));
        }

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        setStartDate(formatDate(start));
        setEndDate(formatDate(end));
    };

    const getClientExercises = (clientId) => {
        const danisan = danisanList.find(d => d.id === clientId);
        setSelectedClientInfo(danisan);
        setLoadingClientExercises(true);

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        setHistoryStartDate(formatDate(startDate));
        setHistoryEndDate(formatDate(endDate));

        axios.get(`${config[config.environment].apiUrl}/exercise/getClientExercises?client_id=${clientId}`, {
            headers: {Authorization: localStorage.getItem("token")}
        })
            .then(response => {
                setSelectedClientExercises(response.data || []);
                setLoadingClientExercises(false);
                setClientExercisesModal(true);

                fetchExerciseHistory(clientId, formatDate(startDate), formatDate(endDate));
            })
            .catch(error => {
                console.error("Error fetching client exercises:", error);
                setLoadingClientExercises(false);
                setErrorMessage("Danışan egzersizleri yüklenirken bir hata oluştu.");
                setShowErrorPopup(true);
            });
    }

    const fetchExerciseHistory = (clientId, startDate, endDate) => {
        setLoadingHistory(true);
        axios.get(`${config[config.environment].apiUrl}/exercise/getClientExerciseHistory?client_id=${clientId}&start_date=${startDate}&end_date=${endDate}`, {
            headers: {Authorization: localStorage.getItem("token")}
        })
            .then(response => {
                setExerciseHistory(response.data || []);
                setLoadingHistory(false);
            })
            .catch(error => {
                console.error("Error fetching exercise history:", error);
                setLoadingHistory(false);
                setErrorMessage("Egzersiz geçmişi yüklenirken bir hata oluştu.");
                setShowErrorPopup(true);
            });
    }

    const handleHistoryDateChange = (dateType, newValue) => {
        const formattedDate = newValue ? newValue.toISOString().split('T')[0] : '';

        if (dateType === 'start') {
            setHistoryStartDate(formattedDate);
            if (selectedClientInfo && formattedDate && historyEndDate) {
                fetchExerciseHistory(selectedClientInfo.id, formattedDate, historyEndDate);
            }
        } else {
            setHistoryEndDate(formattedDate);
            if (selectedClientInfo && historyStartDate && formattedDate) {
                fetchExerciseHistory(selectedClientInfo.id, historyStartDate, formattedDate);
            }
        }
    };

    const handleChangeTab = (event, newValue) => {
        setActiveTab(newValue);
    }

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

    useEffect(() => {
        fetchExercises();
    }, []);

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
        if (danisanList.length > 0) {
            setFilteredDanisanList(
                danisanList.filter(danisan =>
                    danisan.name.toLowerCase().includes(danisanSearchTerm.toLowerCase())
                )
            );
        }
    }, [danisanList, danisanSearchTerm]);

    const filteredCategories = categoryData.filter(category =>
        (category?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredExerciseData = egzersizData.filter(item => {
        const searchMatch = !exerciseSearchTerm ||
            item.exercise_name.toLowerCase().includes(exerciseSearchTerm.toLowerCase()) ||
            (item.exercise_description && item.exercise_description.toLowerCase().includes(exerciseSearchTerm.toLowerCase()));

        const categoryMatch = checkedCategories.length === 0 ||
            checkedCategories.some(id => {
                const itemCategoryId = String(item.category_id || '');
                return itemCategoryId === id || itemCategoryId === String(id);
            });

        let calorieMatch = true;
        if (calorieFilter !== 'all') {
            const [min, max] = calorieFilter.split('-').map(Number);
            calorieMatch = item.calories_burned >= min && item.calories_burned <= max;
        }

        let difficultyMatch = true;
        if (difficultyFilter !== 'all') {
            difficultyMatch = item.difficulty === parseInt(difficultyFilter);
        }

        return searchMatch && categoryMatch && calorieMatch && difficultyMatch;
    });

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

        const exercisesToDelete = egzersizData.filter(exercise => exercise.category_id === categoryId);

        setCategoryToDelete(category);
        setAffectedExercises(exercisesToDelete);
        setDeleteCategoryConfirmModal(true);
    };

    const handleOpenMultiDeleteConfirm = () => {
        if (checkedCategories.length === 0) return;

        const exercisesToDelete = egzersizData.filter(exercise =>
            checkedCategories.includes(exercise.category_id)
        );

        setAffectedExercises(exercisesToDelete);
        setDeleteMultiCategoriesConfirmModal(true);
    };

    const handleAddCategory = () => {
        if (newCategoryTitle.trim() === '') return;

        const newCategory = {
            exercise_category_name: newCategoryTitle.trim()
        };

        axios.post(`${config[config.environment].apiUrl}/exercise/addExerciseCategory`, newCategory, {
            headers: {Authorization: localStorage.getItem("token")}
        })
            .then(response => {
                setCategoryData([...categoryData, response.data]);
                setNewCategoryTitle('');
                setAddCategoryModal(false);

                setSuccessMessage(`"${newCategory.exercise_category_name}" kategorisi başarıyla eklendi.`);
                setShowSuccessPopup(true);
            })
            .catch(error => {
                console.error("Error adding category:", error);
                setErrorMessage("Kategori eklenirken bir hata oluştu.");
                setShowErrorPopup(true);
            });
    };

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
        console.log("Printing exercise:", item);
    };

    const handleEdit = (item) => {
        setSelectedExercise(item);

        setEditExerciseData({
            exercise_id: item.id,
            exercise_name: item.exercise_name || '',
            exercise_description: item.exercise_description || '',
            category_id: item.category_id || '',
            duration: item.duration || 30,
            difficulty: item.difficulty || 3,
            equipment: item.equipment || '',
            calories_burned: item.calories_burned || 0,
            image: item.image || null,
            video: item.video || ''
        });

        setImagePreview(item.image || '');

        setEditExerciseModal(true);
    };

    const handleOpenDeleteConfirm = (item) => {
        setItemToDelete(item);
        setDeleteConfirmModal(true);
    };

    const handleDelete = () => {
        if (!itemToDelete) return;

        axios.delete(`${config[config.environment].apiUrl}/exercise/deleteExercise?exercise_id=${itemToDelete.id}`, {
            headers: {Authorization: localStorage.getItem("token")}
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
            headers: {Authorization: localStorage.getItem("token")}
        })
            .then(() => {
                setCategoryData(prev => prev.filter(cat => cat.id !== categoryToDelete.id));
                setCheckedCategories(prev => prev.filter(id => id !== categoryToDelete.id));
                setEgzersizData(prev => prev.filter(exercise => exercise.category_id !== categoryToDelete.id));
                setDeleteCategoryConfirmModal(false);
                setCategoryToDelete(null);
                setAffectedExercises([]);

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
        if (!newExercise.exercise_name.trim() || !newExercise.category_id) {
            setErrorMessage("Egzersiz adı ve kategori alanları zorunludur.");
            setShowErrorPopup(true);
            return;
        }

        setIsSaving(true);

        if (newExercise.image && newExercise.image instanceof File) {
            const formData = new FormData();
            formData.append('image', newExercise.image);

            axios.post(`${config[config.environment].apiUrl}/upload?type=exercise`, formData, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                    'Content-Type': 'multipart/form-data'
                },
            })
                .then(uploadResponse => {
                    const imageUrl = uploadResponse.data.imageUrl;

                    const exerciseDataToSend = {
                        ...newExercise,
                        image: imageUrl
                    };

                    return axios.post(`${config[config.environment].apiUrl}/exercise/addExercise`, exerciseDataToSend, {
                        headers: { Authorization: localStorage.getItem("token") }
                    });
                })
                .then(addResponse => {
                    setEgzersizData(prevData => [...prevData, addResponse.data]);
                    setAddExerciseModal(false);
                    setSuccessMessage(`"${addResponse.data.exercise_name}" egzersizi başarıyla oluşturuldu.`);
                    setShowSuccessPopup(true);
                    setNewExercise({ exercise_name: '', exercise_description: '', category_id: '', video: '', image: '', duration: 30, difficulty: 3, equipment: '', calories_burned: 0 });
                    setImagePreview('');
                })
                .catch(error => {
                    console.error("Egzersiz eklenirken bir hata oluştu:", error);
                    setErrorMessage("Egzersiz eklenirken bir hata oluştu. Lütfen tekrar deneyin.");
                    setShowErrorPopup(true);
                })
                .finally(() => {
                    setIsSaving(false);
                });

        } else {
            axios.post(`${config[config.environment].apiUrl}/exercise/addExercise`, newExercise, {
                headers: { Authorization: localStorage.getItem("token") }
            })
                .then(response => {
                    setEgzersizData(prevData => [...prevData, response.data]);
                    setAddExerciseModal(false);
                    setSuccessMessage(`"${response.data.exercise_name}" egzersizi başarıyla oluşturuldu.`);
                    setShowSuccessPopup(true);
                    setNewExercise({ exercise_name: '', exercise_description: '', category_id: '', video: '', image: '', duration: 30, difficulty: 3, equipment: '', calories_burned: 0 });
                    setImagePreview('');
                })
                .catch(error => {
                    console.error("Error adding exercise:", error);
                    setErrorMessage("Egzersiz eklenirken bir hata oluştu.");
                    setShowErrorPopup(true);
                })
                .finally(() => {
                    setIsSaving(false);
                });
        }
    };

    const handleSaveExercise = () => {
        if (!editExerciseData.exercise_name.trim() || !editExerciseData.category_id) return;

        setIsSaving(true);

        if (editExerciseData.image && editExerciseData.image instanceof File) {
            const formData = new FormData();
            formData.append('image', editExerciseData.image);

            axios.post(`${config[config.environment].apiUrl}/upload?type=exercise`, formData, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                    'Content-Type': 'multipart/form-data'
                },
            })
                .then(response => {
                    const imageUrl = response.data.imageUrl;

                    const exerciseData = {
                        ...editExerciseData,
                        image: imageUrl
                    };

                    return axios.put(`${config[config.environment].apiUrl}/exercise/updateExercise`, exerciseData, {
                        headers: {Authorization: localStorage.getItem("token")}
                    });
                })
                .then(response => {
                    setEgzersizData(prev =>
                        prev.map(item =>
                            item.id === editExerciseData.exercise_id ? response.data : item
                        )
                    );

                    setEditExerciseModal(false);
                    setSelectedExercise(null);
                    setEditExerciseData({
                        exercise_id: '',
                        exercise_name: '',
                        exercise_description: '',
                        category_id: '',
                        duration: 30,
                        difficulty: 3,
                        equipment: '',
                        calories_burned: 0,
                        image: null,
                        video: null
                    });
                    setImagePreview('');

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
        } else {
            const exerciseData = {
                ...editExerciseData,
                image: typeof editExerciseData.image === 'string' && editExerciseData.image ?
                    editExerciseData.image : (selectedExercise.image || null)
            };

            axios.put(`${config[config.environment].apiUrl}/exercise/updateExercise`, exerciseData, {
                headers: {Authorization: localStorage.getItem("token")}
            })
                .then(response => {
                    setEgzersizData(prev =>
                        prev.map(item =>
                            item.id === editExerciseData.exercise_id ? response.data : item
                        )
                    );

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
                        calories_burned: 0,
                        image: null
                    });
                    setImagePreview('');

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
        }
    };

    const handleAddToUser = () => {
        if (!selectedExercise || !selectedUser || !startDate || !endDate) {
            console.log("Missing required fields:", {
                exerciseExists: !!selectedExercise,
                userExists: !!selectedUser,
                startDateExists: !!startDate,
                endDateExists: !!endDate
            });
            return;
        }

        const addData = {
            client_id: selectedUser.id,
            exercise_id: selectedExercise.id,
            start_date: startDate,
            end_date: endDate,
            note: assignmentNote
        };

        console.log("Assigning exercise with data:", addData);

        setIsSaving(true);

        axios.post(`${config[config.environment].apiUrl}/exercise/assignExercise`, addData, {
            headers: {Authorization: localStorage.getItem("token")}
        })
            .then(response => {
                axios.post(`${config[config.environment].apiUrl}/notification/sendExerciseAssignedNotification`,
                    { client_id: selectedUser.id },
                    { headers: {Authorization: localStorage.getItem("token")} }
                )
                .catch(notificationError => {
                    console.error("Bildirim gönderilirken hata oluştu:", notificationError);
                });

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

    const handleDeleteAssignedExercise = (assignmentId) => {
        if (!assignmentId) return;

        setAssignmentToDelete(assignmentId);
        setDeleteAssignmentConfirmModal(true);
    };

    const confirmDeleteAssignment = () => {
        if (!assignmentToDelete) return;

        setIsSaving(true);

        axios.delete(`${config[config.environment].apiUrl}/exercise/deleteExerciseAssignment?exercise_assignment_id=${assignmentToDelete}`, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
            .then(() => {
                setSelectedClientExercises(prev => prev.filter(item => item.id !== assignmentToDelete));
                setSuccessMessage("Egzersiz ataması başarıyla silindi.");
                setShowSuccessPopup(true);
            })
            .catch(error => {
                console.error("Error deleting exercise assignment:", error);
                setErrorMessage("Egzersiz ataması silinirken bir hata oluştu.");
                setShowErrorPopup(true);
            })
            .finally(() => {
                setIsSaving(false);
                setDeleteAssignmentConfirmModal(false);
                setAssignmentToDelete(null);
            });
    };

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

    return (
        <Default>
            <div className="egzersizler-container">
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
                                title="Egzersiz Ekle"
                                onClick={() => setAddExerciseModal(true)}
                                disabled={categoryData.length === 0}
                            >
                                <AddIcon/>
                                <span className="btn-text">Egzersiz</span>
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

                {/* Middle Panel - Exercise Programs */}
                <div className="programs-panel">
                    {/* Filters section */}
                    <div className="filters-container">
                        {/* Search filter */}
                        <div className="filter-group search-filter">
                            <h3 className="filter-title">Egzersiz Ara:</h3>
                            <div className="search-input-container">
                                <SearchIcon className="search-icon" />
                                <input
                                    type="text"
                                    className="exercise-search-input"
                                    placeholder="Egzersiz adı veya açıklaması..."
                                    value={exerciseSearchTerm}
                                    onChange={(e) => setExerciseSearchTerm(e.target.value)}
                                />
                                {exerciseSearchTerm && (
                                    <button
                                        className="clear-search"
                                        onClick={() => setExerciseSearchTerm('')}
                                        title="Aramayı temizle"
                                    >
                                        <CloseIcon />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* New filters for calorie and difficulty */}
                        <div className="filter-group">
                            <h3 className="filter-title">Kalori Filtrele:</h3>
                            <div className="calorie-filter-buttons">
                                <button
                                    className={`filter-button ${calorieFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setCalorieFilter('all')}
                                >
                                    Tümü
                                </button>
                                <button
                                    className={`filter-button ${calorieFilter === '0-200' ? 'active' : ''}`}
                                    onClick={() => setCalorieFilter('0-200')}
                                >
                                    0-200 kcal
                                </button>
                                <button
                                    className={`filter-button ${calorieFilter === '201-400' ? 'active' : ''}`}
                                    onClick={() => setCalorieFilter('201-400')}
                                >
                                    201-400 kcal
                                </button>
                                <button
                                    className={`filter-button ${calorieFilter === '401-600' ? 'active' : ''}`}
                                    onClick={() => setCalorieFilter('401-600')}
                                >
                                    401-600 kcal
                                </button>
                            </div>
                        </div>

                        <div className="filter-group">
                            <h3 className="filter-title">Zorluk Filtrele:</h3>
                            <div className="difficulty-filter-buttons">
                                <button
                                    className={`filter-button ${difficultyFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setDifficultyFilter('all')}
                                >
                                    Tümü
                                </button>
                                <button
                                    className={`filter-button ${difficultyFilter === '1' ? 'active' : ''}`}
                                    onClick={() => setDifficultyFilter('1')}
                                >
                                    1
                                </button>
                                <button
                                    className={`filter-button ${difficultyFilter === '2' ? 'active' : ''}`}
                                    onClick={() => setDifficultyFilter('2')}
                                >
                                    2
                                </button>
                                <button
                                    className={`filter-button ${difficultyFilter === '3' ? 'active' : ''}`}
                                    onClick={() => setDifficultyFilter('3')}
                                >
                                    3
                                </button>
                                <button
                                    className={`filter-button ${difficultyFilter === '4' ? 'active' : ''}`}
                                    onClick={() => setDifficultyFilter('4')}
                                >
                                    4
                                </button>
                                <button
                                    className={`filter-button ${difficultyFilter === '5' ? 'active' : ''}`}
                                    onClick={() => setDifficultyFilter('5')}
                                >
                                    5
                                </button>
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
                                    dietitianInfo={dietitianInfo}
                                />
                            ))
                        ) : (
                            <div className="no-programs">
                                <p>Bu kategoriye ait egzersiz programı bulunamadı.</p>
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
                            <PeopleIcon sx={{mr: 1}}/> Egzersiz Yönetimi
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
                                                onClick={() => getClientExercises(danisan.id)}
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
                    {detailItem?.image && (
                        <img
                            src={detailItem.image}
                            alt={detailItem.exercise_name}
                            className="recipe-detail-image"
                        />
                    )}

                    {detailItem?.video && (
                        <div className="video-link">
                            <ReactPlayer url={detailItem.video} controls width="100%" height="240px" />
                        </div>
                    )}

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
                        <WarningIcon className="warning-icon"/>
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
                        <WarningIcon className="warning-icon"/>
                        <p className="warning-text">
                            <strong>{categoryToDelete?.name}</strong> kategorisini silmek istediğinize emin misiniz?
                        </p>
                    </div>
                    <p className="delete-note">Bu işlem geri alınamaz.</p>

                    {affectedExercises.length > 0 && (
                        <div className="affected-plans">
                            <p className="delete-note important">
                                <strong>Önemli:</strong> Bu kategori ile
                                ilişkili <strong>{affectedExercises.length}</strong> egzersiz silinecektir:
                            </p>
                            <ul className="affected-plans-list">
                                {affectedExercises.map(exercise => (
                                    <li key={exercise.id}><span className="plan-title">{exercise.exercise_name}</span>
                                    </li>
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

            {/* Delete Multiple Categories Confirmation Modal */}
            <Modal
                isOpen={deleteMultiCategoriesConfirmModal}
                title="Kategorileri Sil"
                onClose={() => {
                    setDeleteMultiCategoriesConfirmModal(false);
                    setAffectedExercises([]);
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

                    {affectedExercises.length > 0 && (
                        <div className="affected-plans">
                            <p className="delete-note important">
                                <strong>Önemli:</strong> Bu kategoriler ile
                                ilişkili <strong>{affectedExercises.length}</strong> egzersiz silinecektir:
                            </p>
                            <ul className="affected-plans-list">
                                {affectedExercises.map(exercise => (
                                    <li key={exercise.id}><span className="plan-title">{exercise.exercise_name}</span>
                                    </li>
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
                            setAffectedExercises([]);
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

                            const deletePromises = checkedCategories.map(categoryId =>
                                axios.delete(
                                    `${config[config.environment].apiUrl}/exercise/deleteExerciseCategory?exercise_category_id=${categoryId}`,
                                    {
                                        headers: {
                                            Authorization: localStorage.getItem("token"),
                                        },
                                    }
                                )
                            );

                            Promise.all(deletePromises)
                                .then(responses => {
                                    const allSuccessful = responses.every(response => response.status === 200);

                                    if (allSuccessful) {
                                        setCategoryData(prevData =>
                                            prevData.filter(category => !checkedCategories.includes(category.id))
                                        );

                                        setCheckedCategories([]);

                                        fetchExercises();

                                        setSuccessMessage(`${checkedCategories.length} kategori başarıyla silindi.`);
                                        setShowSuccessPopup(true);
                                    } else {
                                        setErrorMessage("Bazı kategoriler silinemedi.");
                                        setShowErrorPopup(true);

                                        axios
                                            .get(`${config[config.environment].apiUrl}/exercise/getMyExerciseCategories`, {
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
                                    setAffectedExercises([]);
                                })
                                .catch(error => {
                                    console.error("Error deleting categories:", error);
                                    setErrorMessage("Kategoriler silinirken bir hata oluştu.");
                                    setShowErrorPopup(true);

                                    setDeleteMultiCategoriesConfirmModal(false);
                                    setAffectedExercises([]);
                                });
                        }}
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
                        <label htmlFor="exerciseVideoUrl">Video URL</label>
                        <TextField
                            id="exerciseVideoUrl"
                            variant="outlined"
                            size="small"
                            className="text-input"
                            value={newExercise.video || ''}
                            onChange={(e) => setNewExercise({ ...newExercise, video: e.target.value })}
                            placeholder="Egzersiz video URL'si giriniz"
                            fullWidth
                        />
                    </div>
                    {newExercise.video && (
                        <div style={{ marginTop: 16 }}>
                            <ReactPlayer url={newExercise.video} controls width="100%" height="240px" />
                        </div>
                    )}
                    <div className="input-container">
                        <label htmlFor="exerciseImage">Egzersiz Resmi</label>
                        <input
                            type="file"
                            id="exerciseImage"
                            className="text-input"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setNewExercise({...newExercise, image: file});
                                        setImagePreview(reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        <label htmlFor="exerciseImage" className={`file-upload-label ${imagePreview ? 'has-file' : ''}`}>
                            <span className="file-upload-icon">📷</span>
                            {imagePreview ? 'Resim seçildi - Değiştirmek için tıklayın' : 'Resim seçmek için tıklayın'}
                        </label>
                        {imagePreview && (
                            <div className="image-preview-container">
                                <img src={imagePreview} alt="Egzersiz önizleme" className="image-preview" />
                                <button
                                    type="button"
                                    className="remove-image-btn"
                                    onClick={() => {
                                        setNewExercise({...newExercise, image: null});
                                        setImagePreview('');
                                        document.getElementById('exerciseImage').value = '';
                                    }}
                                >
                                    ✖
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="exercise-details-row">
                        <div className="input-container half-width">
                            <label htmlFor="exerciseDuration">Süre (Dakika)</label>
                            <input
                                type="number"
                                id="exerciseDuration"
                                className="text-input"
                                value={newExercise.duration}
                                onChange={(e) => setNewExercise({
                                    ...newExercise,
                                    duration: Math.min(1440, parseInt(e.target.value) || 0)
                                })}
                                min="0"
                                max="1440"
                            />
                        </div>
                        <div className="input-container half-width">
                            <label htmlFor="exerciseDifficulty">Zorluk (1-5)</label>
                            <input
                                type="number"
                                id="exerciseDifficulty"
                                className="text-input"
                                value={newExercise.difficulty}
                                onChange={(e) => {
                                    const value = e.target.value === '' ? 1 : parseInt(e.target.value, 10);
                                    if (isNaN(value)) return;
                                    setNewExercise({
                                        ...newExercise,
                                        difficulty: Math.max(1, Math.min(5, value))
                                    });
                                }}
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
                                onChange={(e) => {
                                    const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                                    if (isNaN(value)) return;
                                    setNewExercise({
                                        ...newExercise,
                                        calories_burned: Math.max(0, Math.min(5000, value))
                                    });
                                }}
                                min="0"
                                max="5000"
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
                            onChange={(e) => setEditExerciseData({
                                ...editExerciseData,
                                exercise_description: e.target.value
                            })}
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
                        <label htmlFor="editExerciseVideo">Video URL</label>
                        <TextField
                            id="editExerciseVideo"
                            variant="outlined"
                            size="small"
                            className="text-input"
                            value={editExerciseData.video || ''}
                            onChange={(e) => setEditExerciseData({ ...editExerciseData, video: e.target.value })}
                            placeholder="Egzersiz video URL'si giriniz"
                            fullWidth
                        />
                    </div>
                    {editExerciseData.video && (
                        <div style={{ marginTop: 16 }}>
                            <ReactPlayer url={editExerciseData.video} controls width="100%" height="240px" />
                        </div>
                    )}
                    <div className="input-container">
                        <label htmlFor="editExerciseImage">Egzersiz Resmi</label>
                        <input
                            type="file"
                            id="editExerciseImage"
                            className="text-input"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setEditExerciseData({...editExerciseData, image: file});
                                        setImagePreview(reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        <label htmlFor="editExerciseImage" className={`file-upload-label ${imagePreview ? 'has-file' : ''}`}>
                            <span className="file-upload-icon">📷</span>
                            {imagePreview ? 'Resim seçildi - Değiştirmek için tıklayın' : 'Resim seçmek için tıklayın'}
                        </label>
                        {imagePreview && (
                            <div className="image-preview-container">
                                <img src={imagePreview} alt="Egzersiz önizleme" className="image-preview" />
                                <button
                                    type="button"
                                    className="remove-image-btn"
                                    onClick={() => {
                                        setEditExerciseData({...editExerciseData, image: null});
                                        setImagePreview('');
                                        document.getElementById('editExerciseImage').value = '';
                                    }}
                                >
                                    ✖
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="exercise-details-row">
                        <div className="input-container half-width">
                            <label htmlFor="editExerciseDuration">Süre (Dakika)</label>
                            <input
                                type="number"
                                id="editExerciseDuration"
                                className="text-input"
                                value={editExerciseData.duration}
                                onChange={(e) => {
                                    const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                                    if (isNaN(value)) return;
                                    setEditExerciseData({
                                        ...editExerciseData,
                                        duration: Math.max(0, Math.min(1440, value))
                                    });
                                }}
                                min="0"
                                max="1440"
                            />
                        </div>
                        <div className="input-container half-width">
                            <label htmlFor="editExerciseDifficulty">Zorluk (1-5)</label>
                            <input
                                type="number"
                                id="editExerciseDifficulty"
                                className="text-input"
                                value={editExerciseData.difficulty}
                                onChange={(e) => {
                                    const value = e.target.value === '' ? 1 : parseInt(e.target.value, 10);
                                    if (isNaN(value)) return;
                                    setEditExerciseData({
                                        ...editExerciseData,
                                        difficulty: Math.max(1, Math.min(5, value))
                                    });
                                }}
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
                                onChange={(e) => {
                                    const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                                    if (isNaN(value)) return;
                                    setEditExerciseData({
                                        ...editExerciseData,
                                        calories_burned: Math.max(0, Math.min(5000, value))
                                    });
                                }}
                                min="0"
                                max="5000"
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
                        <strong>Not:</strong> Danışanınız bu egzersiz programını gerçekleştirdikçe, mobil uygulamada
                        ilerleme kaydedebilecek.
                    </p>
                    <div className="input-container">
                        <label htmlFor="userSelect">Danışan Seçin</label>
                        <select
                            id="userSelect"
                            className="text-input"
                            value={selectedUser?.id || ''}
                            onChange={(e) => {
                                const userId = e.target.value;
                                if (userId) {
                                    const numUserId = parseInt(userId, 10);

                                    const user = danisanList.find(u => String(u.id) === String(numUserId));
                                    if (user) {
                                        setSelectedUser(user);
                                        console.log("Selected user:", user.name, "ID:", user.id, "Type:", typeof user.id);
                                    } else {
                                        console.log("No user found with ID:", numUserId);
                                    }
                                } else {
                                    setSelectedUser(null);
                                    console.log("User selection cleared");
                                }
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
                    <div className="date-period-buttons">
                        <Typography variant="h5" sx={{mb: 1, mt: 2}}>
                            Hızlı Süre Seç:
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{mb: 2}}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setDateRange(1)}
                            >
                                1 Hafta
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setDateRange(2)}
                            >
                                2 Hafta
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setDateRange(3)}
                            >
                                3 Hafta
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setDateRange('month')}
                            >
                                1 Ay
                            </Button>
                        </Stack>
                    </div>
                    <div className="date-inputs-container">
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
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

            {/* Danışana Atanmış Egzersizler Modalı */}
            <Modal
                isOpen={clientExercisesModal}
                title={`${selectedClientInfo?.name || 'Danışan'} - Egzersiz Program Yönetimi`}
                onClose={() => setClientExercisesModal(false)}
                fullWidth={true}
            >
                <div className="modal-body">
                    <Box sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        mb: 3,
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px 8px 0 0',
                        overflow: 'hidden'
                    }}>
                        <Tabs
                            value={activeTab}
                            onChange={handleChangeTab}
                            aria-label="exercise tabs"
                            variant="fullWidth"
                            sx={{
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#087708',
                                    height: 3
                                },
                                '& .Mui-selected': {
                                    color: '#087708',
                                    fontWeight: 'bold'
                                }
                            }}
                        >
                            <Tab
                                label="Atanmış Egzersizler"
                                icon={<EventAvailableIcon/>}
                                iconPosition="start"
                                sx={{py: 2}}
                            />
                            <Tab
                                label="Egzersiz Geçmişi"
                                icon={<HistoryIcon/>}
                                iconPosition="start"
                                sx={{py: 2}}
                            />
                        </Tabs>
                    </Box>

                    {activeTab === 0 ? (
                        loadingClientExercises ? (
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                py: 5
                            }}>
                                <CircularProgress size={40} sx={{color: '#087708', mb: 2}}/>
                                <Typography variant="body1" color="text.secondary">Egzersiz programları
                                    yükleniyor...</Typography>
                            </Box>
                        ) : selectedClientExercises.length > 0 ? (
                            <Box sx={{
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                overflow: 'hidden',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}>
                                <List sx={{width: '100%'}}>
                                    {selectedClientExercises.map((item) => (
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
                                                secondaryAction={
                                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                        <PDFDownloadLink
                                                            document={
                                                                <ExerciseDocument
                                                                    exercise={item.Exercise}
                                                                    assignmentData={{
                                                                        clientName: selectedClientInfo?.name,
                                                                        startDate: item.start_date,
                                                                        endDate: item.end_date,
                                                                        note: item.note
                                                                    }}
                                                                    dietitian={dietitianInfo}
                                                                />
                                                            }
                                                            fileName={`${item.Exercise?.exercise_name.replace(/\s+/g, '_')}_egzersiz_programi.pdf`}
                                                            style={{textDecoration: 'none'}}
                                                        >
                                                            {({blob, url, loading, error}) => (
                                                                <Button
                                                                    size="small"
                                                                    startIcon={<FileDownloadIcon/>}
                                                                    disabled={loading}
                                                                    variant="outlined"
                                                                    color="primary"
                                                                    sx={{borderRadius: 6}}
                                                                >
                                                                    PDF
                                                                </Button>
                                                            )}
                                                        </PDFDownloadLink>

                                                        <Tooltip title="Atamayı Sil">
                                                            <IconButton
                                                                edge="end"
                                                                aria-label="delete"
                                                                onClick={() => handleDeleteAssignedExercise(item.id)}
                                                                color="error"
                                                                sx={{
                                                                    backgroundColor: 'rgba(244,67,54,0.1)',
                                                                    '&:hover': {
                                                                        backgroundColor: 'rgba(244,67,54,0.2)'
                                                                    }
                                                                }}
                                                            >
                                                                <DeleteIcon/>
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                }
                                            >
                                                <ListItemAvatar>
                                                    <Avatar sx={{
                                                        bgcolor: '#087708',
                                                        width: 48,
                                                        height: 48,
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                    }}>
                                                        <FitnessCenterIcon/>
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Typography
                                                            variant="h6"
                                                            fontWeight="500"
                                                            sx={{
                                                                color: '#2e7d32',
                                                                fontSize: '1.1rem',
                                                                mb: 0.5
                                                            }}
                                                        >
                                                            {item.Exercise?.exercise_name || "Egzersiz"}
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
                                                                {item.Exercise?.exercise_description?.substring(0, 120)}
                                                                {item.Exercise?.exercise_description?.length > 120 ? "..." : ""}
                                                            </Typography>

                                                            <Box sx={{
                                                                display: 'flex',
                                                                flexWrap: 'wrap',
                                                                gap: 0.5,
                                                                mt: 1
                                                            }}>
                                                                <Chip
                                                                    size="small"
                                                                    icon={<CalendarTodayIcon fontSize="small"/>}
                                                                    label={`${new Date(item.start_date).toLocaleDateString('tr-TR')} - ${new Date(item.end_date).toLocaleDateString('tr-TR')}`}
                                                                    sx={{
                                                                        mr: 1,
                                                                        mb: 1,
                                                                        bgcolor: '#e8f5e9',
                                                                        color: '#2e7d32',
                                                                        fontWeight: 500
                                                                    }}
                                                                />

                                                                {item.Exercise?.difficulty && (
                                                                    <Chip
                                                                        size="small"
                                                                        label={`Zorluk: ${item.Exercise.difficulty}/5`}
                                                                        color={item.Exercise.difficulty > 3 ? "error" : item.Exercise.difficulty > 1 ? "warning" : "success"}
                                                                        variant="outlined"
                                                                        sx={{mr: 1, mb: 1, fontWeight: 500}}
                                                                    />
                                                                )}

                                                                {item.Exercise?.calories_burned && (
                                                                    <Chip
                                                                        size="small"
                                                                        icon={<LocalFireDepartmentIcon
                                                                            fontSize="small"/>}
                                                                        label={`${item.Exercise.calories_burned} kcal`}
                                                                        color="primary"
                                                                        variant="outlined"
                                                                        sx={{mr: 1, mb: 1, fontWeight: 500}}
                                                                    />
                                                                )}

                                                                {item.Exercise?.duration && (
                                                                    <Chip
                                                                        size="small"
                                                                        icon={<AccessTimeIcon fontSize="small"/>}
                                                                        label={`${item.Exercise.duration} dakika`}
                                                                        sx={{
                                                                            mr: 1,
                                                                            mb: 1,
                                                                            bgcolor: '#e3f2fd',
                                                                            color: '#1565c0',
                                                                            fontWeight: 500
                                                                        }}
                                                                    />
                                                                )}
                                                            </Box>

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
                                    Bu danışana atanmış egzersiz programı bulunmamaktadır
                                </Typography>
                                <Typography variant="body2" color="text.secondary" align="center"
                                            sx={{mt: 1, maxWidth: 500}}>
                                    Sağ üst köşedeki "Egzersiz Ekle" butonunu kullanarak yeni egzersiz programları
                                    oluşturabilir ve danışanlarınıza atayabilirsiniz.
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<AddIcon/>}
                                    sx={{mt: 3}}
                                    onClick={() => setAddExerciseModal(true)}
                                >
                                    Yeni Egzersiz Ekle
                                </Button>
                            </Box>
                        )
                    ) : (
                        <div>
                            <Box sx={{mb: 3, p: 2, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e0e0e0'}}>
                                <Typography variant="subtitle1" sx={{
                                    mb: 2,
                                    fontWeight: 500,
                                    color: '#424242',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <FilterAltIcon sx={{mr: 1, fontSize: 20, color: '#757575'}}/>
                                    Tarih Aralığı Filtreleme
                                </Typography>
                                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end'}}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                                        <Box sx={{flex: '1 1 200px'}}>
                                            <DatePicker
                                                label="Başlangıç Tarihi"
                                                value={historyStartDate ? new Date(historyStartDate) : null}
                                                onChange={(newValue) => handleHistoryDateChange('start', newValue)}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        variant: "outlined",
                                                        size: "small",
                                                        sx: {
                                                            backgroundColor: '#fff',
                                                            borderRadius: 1,
                                                            '& .MuiOutlinedInput-root': {
                                                                '&:hover fieldset': {
                                                                    borderColor: '#087708',
                                                                },
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{flex: '1 1 200px'}}>
                                            <DatePicker
                                                label="Bitiş Tarihi"
                                                value={historyEndDate ? new Date(historyEndDate) : null}
                                                onChange={(newValue) => handleHistoryDateChange('end', newValue)}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        variant: "outlined",
                                                        size: "small",
                                                        sx: {
                                                            backgroundColor: '#fff',
                                                            borderRadius: 1,
                                                            '& .MuiOutlinedInput-root': {
                                                                '&:hover fieldset': {
                                                                    borderColor: '#087708',
                                                                },
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </LocalizationProvider>
                                </Box>
                            </Box>

                            {loadingHistory ? (
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    py: 5
                                }}>
                                    <CircularProgress sx={{color: '#087708', mb: 2}}/>
                                    <Typography variant="body1" color="text.secondary">Egzersiz geçmişi
                                        yükleniyor...</Typography>
                                </Box>
                            ) : exerciseHistory.filter(item => item.status === 'completed').length > 0 ? (
                                <Paper elevation={1} sx={{borderRadius: 2, overflow: 'hidden'}}>
                                    <Box sx={{
                                        p: 2,
                                        bgcolor: '#087708',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <CheckCircleIcon sx={{mr: 1}}/>
                                        <Typography variant="h6" sx={{fontWeight: 500}}>
                                            Tamamlanan Egzersiz Geçmişi
                                        </Typography>
                                    </Box>

                                    <List sx={{width: '100%', bgcolor: 'background.paper'}}>
                                        {exerciseHistory
                                            .filter(item => item.status === 'completed')
                                            .map((item) => (
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
                                                                bgcolor: '#43a047',
                                                                width: 48,
                                                                height: 48,
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                            }}>
                                                                <CheckCircleIcon/>
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center'
                                                                }}>
                                                                    <Typography
                                                                        variant="h6"
                                                                        fontWeight="500"
                                                                        sx={{
                                                                            color: '#2e7d32',
                                                                            fontSize: '1.1rem'
                                                                        }}
                                                                    >
                                                                        {item.Exercise?.exercise_name || "Egzersiz"}
                                                                    </Typography>
                                                                    <Chip
                                                                        label="Tamamlandı"
                                                                        color="success"
                                                                        size="small"
                                                                        icon={<CheckCircleIcon/>}
                                                                        sx={{fontWeight: 'medium'}}
                                                                    />
                                                                </Box>
                                                            }
                                                            secondary={
                                                                <React.Fragment>
                                                                    <Box sx={{
                                                                        mt: 1,
                                                                        py: 1,
                                                                        px: 1.5,
                                                                        bgcolor: '#e8f5e9',
                                                                        borderRadius: 1,
                                                                        display: 'flex',
                                                                        alignItems: 'center'
                                                                    }}>
                                                                        <EventIcon sx={{
                                                                            color: '#2e7d32',
                                                                            mr: 1,
                                                                            fontSize: 20
                                                                        }}/>
                                                                        <Typography component="span" variant="body2"
                                                                                    fontWeight="medium" color="#2e7d32">
                                                                            Tamamlanma
                                                                            Tarihi: {new Date(item.updatedAt).toLocaleString('tr-TR')}
                                                                        </Typography>
                                                                    </Box>

                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        flexWrap: 'wrap',
                                                                        gap: 0.5,
                                                                        mt: 1.5
                                                                    }}>
                                                                        <Chip
                                                                            size="small"
                                                                            icon={<AccessTimeIcon fontSize="small"/>}
                                                                            label={`Süre: ${item.duration || item.Exercise?.duration || 0} dakika`}
                                                                            sx={{
                                                                                mr: 1,
                                                                                mb: 1,
                                                                                bgcolor: '#e3f2fd',
                                                                                color: '#1565c0',
                                                                                fontWeight: 500
                                                                            }}
                                                                        />

                                                                        {item.Exercise?.calories_burned && (
                                                                            <Chip
                                                                                size="small"
                                                                                icon={<LocalFireDepartmentIcon
                                                                                    fontSize="small"/>}
                                                                                label={`${item.Exercise.calories_burned} kcal`}
                                                                                sx={{
                                                                                    mr: 1,
                                                                                    mb: 1,
                                                                                    bgcolor: '#ffebee',
                                                                                    color: '#c62828',
                                                                                    fontWeight: 500
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {item.Exercise?.difficulty && (
                                                                            <Chip
                                                                                size="small"
                                                                                label={`Zorluk: ${item.Exercise.difficulty}/5`}
                                                                                color={item.Exercise.difficulty > 3 ? "error" : item.Exercise.difficulty > 1 ? "warning" : "success"}
                                                                                variant="outlined"
                                                                                sx={{mr: 1, mb: 1, fontWeight: 500}}
                                                                            />
                                                                        )}
                                                                    </Box>
                                                                </React.Fragment>
                                                            }
                                                        />
                                                    </ListItem>
                                                    <Divider variant="inset" component="li"/>
                                                </React.Fragment>
                                            ))}
                                    </List>
                                </Paper>
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
                                    <EventBusyIcon sx={{fontSize: 60, color: '#bdbdbd', mb: 2}}/>
                                    <Typography variant="h6" color="text.secondary" align="center">
                                        Seçilen tarih aralığında tamamlanmış egzersiz bulunmamaktadır
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" align="center"
                                                sx={{mt: 1, maxWidth: 600}}>
                                        Danışanınız henüz herhangi bir egzersizi tamamlamamış veya seçtiğiniz tarih
                                        veya danışanınızın egzersizleri tamamlamasını bekleyebilirsiniz.
                                    </Typography>
                                </Box>
                            )}
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button
                        className="modal-btn close-btn"
                        onClick={() => setClientExercisesModal(false)}
                    >
                        Kapat
                    </button>
                </div>
            </Modal>

            {/* Delete Assignment Confirmation Modal */}
            <Modal
                isOpen={deleteAssignmentConfirmModal}
                title="Egzersiz Atamasını Sil"
                onClose={() => {
                    setDeleteAssignmentConfirmModal(false);
                    setAssignmentToDelete(null);
                }}
            >
                <div className="modal-body delete-confirm-modal">
                    <div className="delete-warning">
                        <WarningIcon className="warning-icon"/>
                        <p className="warning-text">
                            Bu egzersiz atamasını silmek istediğinize emin misiniz?
                        </p>
                    </div>
                    <p className="delete-note">Bu işlem geri alınamaz.</p>
                </div>
                <div className="modal-footer">
                    <button
                        className="modal-btn cancel-btn"
                        onClick={() => {
                            setDeleteAssignmentConfirmModal(false);
                            setAssignmentToDelete(null);
                        }}
                    >
                        Vazgeç
                    </button>
                    <button
                        className="modal-btn delete-confirm-btn"
                        onClick={confirmDeleteAssignment}
                    >
                        Sil
                    </button>
                </div>
            </Modal>
        </Default>
    );
}
