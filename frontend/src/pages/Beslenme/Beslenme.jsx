import React, {useEffect, useRef, useState} from 'react';
import './Beslenme.css';
import Default from "../../Components/Layouts/Default.jsx";
import MealPlanEditor from "../../Components/MealPlanEditor/MealPlanEditor.jsx";
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
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NoteIcon from '@mui/icons-material/Note';
import DescriptionIcon from '@mui/icons-material/Description';

import MealPlanViewer from "../../Components/MealPlanEditor/MealPlanViewer.jsx";
import ConditionalPDFLink from "../../Components/ConditionalPDFLink/ConditionalPDFLink.jsx";

import {Document, Font, Page, StyleSheet, Text, View} from '@react-pdf/renderer';

import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    LinearProgress,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material';

import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {tr} from "date-fns/locale";

Font.register({
    family: 'Open Sans',
    src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf'
});

const pdfStyles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#fff',
        padding: 8,
        fontFamily: 'Open Sans'
    },
    header: {
        backgroundColor: '#2E7D32',
        padding: 6,
        marginBottom: 8,
        borderRadius: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerContent: {
        flex: 1
    },
    headerTitle: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 2
    },
    headerSubtitle: {
        color: '#E8F5E8',
        fontSize: 6,
        marginBottom: 1
    },
    headerInfo: {
        color: '#E8F5E8',
        fontSize: 6,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    logoContainer: {
        width: 40,
        height: 40,
        backgroundColor: 'white',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8
    },
    logo: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fd9200'
    },
    infoSection: {
        flexDirection: 'row',
        marginBottom: 6,
        gap: 4
    },
    infoBox: {
        flex: 1,
        padding: 6,
        backgroundColor: '#F8F9FA',
        borderRadius: 3,
        borderLeft: '1px solid #4CAF50'
    },
    infoTitle: {
        fontSize: 6,
        fontWeight: 'bold',
        marginBottom: 1,
        color: '#2E7D32'
    },
    infoContent: {
        fontSize: 5,
        color: '#424242',
        lineHeight: 1.1
    },
    daysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 2,
        marginBottom: 6
    },
    dayCard: {
        width: '13.5%',
        backgroundColor: 'white',
        borderRadius: 3,
        overflow: 'hidden',
        border: '0.3px solid #E0E0E0',
        marginBottom: 2
    },
    dayHeader: {
        backgroundColor: '#FF6B35',
        padding: 2,
        alignItems: 'center'
    },
    dayHeaderText: {
        color: 'white',
        fontSize: 6,
        fontWeight: 'bold',
        letterSpacing: 0.2
    },
    dayContent: {
        padding: 3
    },
    mealSection: {
        marginBottom: 2
    },
    mealTitle: {
        fontSize: 5,
        fontWeight: 'bold',
        marginBottom: 1,
        color: '#2E7D32',
        backgroundColor: '#E8F5E8',
        padding: 1,
        borderRadius: 1,
        textAlign: 'center'
    },
    alternativeGroup: {
        marginBottom: 1,
        paddingLeft: 1
    },
    alternativeTitle: {
        fontSize: 4,
        fontWeight: 'bold',
        color: '#FF6B35',
        marginBottom: 0.5
    },
    mealItem: {
        fontSize: 4,
        marginBottom: 0.5,
        paddingLeft: 2,
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    mealItemBullet: {
        fontSize: 4,
        marginRight: 1,
        color: '#4CAF50',
        fontWeight: 'bold'
    },
    mealItemContent: {
        flex: 1
    },
    mealItemName: {
        fontSize: 4,
        color: '#424242',
        lineHeight: 1.1
    },
    mealItemPortion: {
        fontSize: 3,
        color: '#757575',
        marginTop: 0.2
    },
    noMealText: {
        fontSize: 4,
        color: '#9E9E9E',
        paddingLeft: 2,
        textAlign: 'center',
        marginTop: 1
    },
    emptyDay: {
        width: '100%',
        backgroundColor: '#F5F5F5',
        borderRadius: 3,
        padding: 8,
        alignItems: 'center',
        marginBottom: 4
    },
    emptyDayText: {
        fontSize: 6,
        color: '#757575',
        textAlign: 'center'
    },
    footer: {
        position: 'absolute',
        bottom: 8,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 8
    },
    footerText: {
        fontSize: 5,
        color: '#2E7D32',
        textAlign: 'center',
        marginBottom: 1
    },
    footerWebsite: {
        fontSize: 5,
        color: '#FF6B35',
        fontWeight: 'bold'
    },
    statsSection: {
        flexDirection: 'row',
        marginBottom: 6,
        backgroundColor: '#F0F4FF',
        padding: 4,
        borderRadius: 3,
        justifyContent: 'space-around'
    },
    statItem: {
        alignItems: 'center'
    },
    statNumber: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#2E7D32'
    },
    statLabel: {
        fontSize: 5,
        color: '#757575',
        marginTop: 0.5
    }
});

const NutritionPlanDocument = ({ dietitian, program }) => {
    console.log("Rendering NutritionPlanDocument with program:", program);
    console.log("Rendering NutritionPlanDocument with dietitian:", dietitian);
    const today = new Date();
    const dateStr = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`;
    const mealPlanData = program?.mealPlan || {};
    const hasMealPlan = Object.keys(mealPlanData).length > 0;

    const calculateStats = () => {
        let totalDays = 0;
        let totalMeals = 0;
        let totalItems = 0;

        Object.keys(mealPlanData).forEach(day => {
            const dayData = mealPlanData[day] || {};
            let dayHasMeals = false;

            Object.keys(dayData).forEach(meal => {
                const mealData = dayData[meal] || {};
                Object.keys(mealData).forEach(altGroup => {
                    const items = mealData[altGroup] || [];
                    if (Array.isArray(items) && items.length > 0) {
                        dayHasMeals = true;
                        totalMeals++;
                        totalItems += items.length;
                    }
                });
            });

            if (dayHasMeals) totalDays++;
        });

        return { totalDays, totalMeals, totalItems };
    };

    const stats = calculateStats();

    const renderMealItem = (item, index) => {
        if (!item || !item.name) return null;

        return (
            <View style={pdfStyles.mealItem} key={`item-${index}`}>
                <Text style={pdfStyles.mealItemBullet}>•</Text>
                <View style={pdfStyles.mealItemContent}>
                    <Text style={pdfStyles.mealItemName}>{item.name}</Text>
                    {item.portion && (
                        <Text style={pdfStyles.mealItemPortion}>Porsiyon: {item.portion}</Text>
                    )}
                </View>
            </View>
        );
    };

    return (
        <Document>
            <Page size={[842, 595]} orientation="landscape" style={pdfStyles.page} wrap>
                {/* Başlık ve Logo */}
                <View style={pdfStyles.header}>
                    <View style={pdfStyles.headerContent}>
                        <Text style={pdfStyles.headerTitle}>{program?.title || 'Beslenme Programı'}</Text>
                        <View style={pdfStyles.headerInfo}>
                            <Text>Oluşturulma: {dateStr}</Text>
                            <Text>Diyetisyen: {dietitian.name}</Text>
                        </View>
                    </View>
                    <View style={pdfStyles.logoContainer}>
                        <Text style={pdfStyles.logo}>Diyetia</Text>
                    </View>
                </View>

                {/* Program Bilgileri */}
                <View style={pdfStyles.infoSection}>
                    <View style={pdfStyles.infoBox}>
                        <Text style={pdfStyles.infoTitle}>Program Adı</Text>
                        <Text style={pdfStyles.infoContent}>{program?.title || 'İsimsiz Program'}</Text>
                    </View>
                    <View style={pdfStyles.infoBox}>
                        <Text style={pdfStyles.infoTitle}>Açıklama</Text>
                        <Text style={pdfStyles.infoContent}>{program?.description || 'Açıklama yok'}</Text>
                    </View>
                </View>

                {/* İstatistikler */}
                {hasMealPlan && (
                    <View style={pdfStyles.statsSection}>
                        <View style={pdfStyles.statItem}>
                            <Text style={pdfStyles.statNumber}>{stats.totalDays}</Text>
                            <Text style={pdfStyles.statLabel}>Aktif Gün</Text>
                        </View>
                        <View style={pdfStyles.statItem}>
                            <Text style={pdfStyles.statNumber}>{stats.totalMeals}</Text>
                            <Text style={pdfStyles.statLabel}>Öğün</Text>
                        </View>
                        <View style={pdfStyles.statItem}>
                            <Text style={pdfStyles.statNumber}>{stats.totalItems}</Text>
                            <Text style={pdfStyles.statLabel}>Besin Öğesi</Text>
                        </View>
                    </View>
                )}

                {/* Günler ve Yemekler */}
                    {hasMealPlan ? (
                        (() => {
                            const days = Object.keys(mealPlanData);
                        const dayCards = days.map((day, dayIndex) => {
                            const dayData = mealPlanData[day] || {};
                            const dayHasMeals = Object.keys(dayData).some(meal => {
                                const mealData = dayData[meal] || {};
                                return Object.keys(mealData).some(altGroup => {
                                    const items = mealData[altGroup] || [];
                                    return Array.isArray(items) && items.length > 0;
                                });
                            });

                            return (
                                <View
                                    style={{ ...pdfStyles.dayCard, width: '32%', minHeight: 120 }}
                                    key={`day-${dayIndex}`}
                                    wrap={false}
                                    break={dayIndex % 3 === 0 && dayIndex !== 0}
                                >
                                    <View style={pdfStyles.dayHeader}>
                                        <Text style={pdfStyles.dayHeaderText}>{day}</Text>
                                    </View>
                                    <View style={pdfStyles.dayContent}>
                                        {dayHasMeals ? (
                                            Object.keys(dayData).map((meal, mealIndex) => {
                                                const mealData = dayData[meal] || {};
                                                const mealHasItems = Object.keys(mealData).some(altGroup => {
                                                    const items = mealData[altGroup] || [];
                                                    return Array.isArray(items) && items.length > 0;
                                                });

                                                if (!mealHasItems) return null;

                                                return (
                                                    <View style={pdfStyles.mealSection} key={`meal-${mealIndex}`}>
                                                        <Text style={pdfStyles.mealTitle}>{meal}</Text>
                                                        {Object.keys(mealData).map((alternativeGroup, altIndex) => {
                                                            const items = mealData[alternativeGroup] || [];

                                                            if (!Array.isArray(items) || items.length === 0) {
                                                                return null;
                                                            }

                                                            return (
                                                                <View style={pdfStyles.alternativeGroup} key={`alt-${altIndex}`}>
                                                                    {Object.keys(mealData).length > 1 && (
                                                                        <Text style={pdfStyles.alternativeTitle}>
                                                                            {alternativeGroup}
                                                                        </Text>
                                                                    )}
                                                                    {items.map((item, itemIndex) =>
                                                                        renderMealItem(item, itemIndex)
                                                                    )}
                                                                </View>
                                                            );
                                                        })}
                                                    </View>
                                                );
                                            })
                                        ) : (
                                            <Text style={pdfStyles.noMealText}>Bu gün için öğün planı bulunmuyor</Text>
                                        )}
                                    </View>
                                </View>
                            );
                        });

                        // 3'lü satırlara böl ve her satırı bir View ile sar
                        const rows = [];
                        for (let i = 0; i < dayCards.length; i += 3) {
                            rows.push(
                                <View style={{ flexDirection: 'row', gap: 8, width: '100%' }} key={`row-${i}`} wrap={false}>
                                    {dayCards.slice(i, i + 3)}
                                    </View>
                                );
                            }
                            return rows;
                        })()
                    ) : (
                        <View style={pdfStyles.emptyDay}>
                            <Text style={pdfStyles.emptyDayText}>
                                Bu beslenme programında günlük öğün planı bulunmuyor
                            </Text>
                        </View>
                    )}

                {/* Altbilgi */}
                <View style={pdfStyles.footer}>
                    <Text style={pdfStyles.footerText}>
                        Bu beslenme programı uzman diyetisyen tarafından hazırlanmıştır.
                    </Text>
                    <Text style={pdfStyles.footerWebsite}>www.diyetia.com</Text>
                </View>
            </Page>
        </Document>
    );
};

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
        </div>
    );
};

const NutritionCard = ({item, onAddToUser, onPrint, onEdit, onDelete, onView, dietitian}) => {
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
                    <ConditionalPDFLink
                        document={<NutritionPlanDocument dietitian={dietitian} program={item}/>}
                        fileName={`${item.title.replace(/\s+/g, '_')}_beslenme_programi.pdf`}
                        buttonClass="action-button print-btn"
                        buttonTitle="Yazdır"
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
                    </ConditionalPDFLink>
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

export default function Beslenme() {
    const [categoryData, setCategoryData] = useState([]);
    const [checkedCategories, setCheckedCategories] = useState([]);
    const [danisanList, setDanisanList] = useState([]);
    const [filteredDanisanList, setFilteredDanisanList] = useState([]);
    const [danisanSearchTerm, setDanisanSearchTerm] = useState('');
    const [beslenmeData, setBeslenmeData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [planSearchTerm, setPlanSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const [clientProgramsModal, setClientProgramsModal] = useState(false);
    const [selectedClientPrograms, setSelectedClientPrograms] = useState([]);
    const [loadingClientPrograms, setLoadingClientPrograms] = useState(false);
    const [selectedClientInfo, setSelectedClientInfo] = useState(null);

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

    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editCategoryId, setEditCategoryId] = useState('');

    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

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

    const [newPlan, setNewPlan] = useState({
        title: '',
        description: '',
        category_id: ''
    });

    const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteCategoryConfirmModal, setDeleteCategoryConfirmModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [deleteMultiCategoriesConfirmModal, setDeleteMultiCategoriesConfirmModal] = useState(false);
    const [affectedPlans, setAffectedPlans] = useState([]);

    const [selectedDay, setSelectedDay] = useState(DAYS_OF_WEEK[0]);
    const [mealPlan, setMealPlan] = useState(() => {
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

    const [isSaving, setIsSaving] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const [planImage, setPlanImage] = useState(null);
    const [editImage, setEditImage] = useState(null);
    const [dietitianInfo, setDietitianInfo] = useState({});

    useEffect( () => {
        axios.get(`${config[config.environment].apiUrl}/dietitian/getDietitianInfo`, {
            headers: {Authorization: localStorage.getItem("token")}
        })
            .then(response => {
                setDietitianInfo(response.data);
            })
            .catch(error => {
                console.error("Error fetching dietitian info:", error);
            });
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

    useEffect(() => {
        axios
            .get(`${config[config.environment].apiUrl}/nutrition/getNutritionCategories`, {
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

    const fetchNutritionPlans = () => {
        setLoading(true);
        axios
            .get(`${config[config.environment].apiUrl}/nutrition/getNutritionPlans`, {
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
        const matchesCategory = checkedCategories.length === 0 || checkedCategories.includes(item.category_id);
        const matchesTitle = item.title.toLowerCase().includes(planSearchTerm.toLowerCase());
        return matchesCategory && matchesTitle;
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
            axios.delete(`${config[config.environment].apiUrl}/nutrition/deleteNutritionCategory?category_id=${categoryId}`, {
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

        axios.delete(`${config[config.environment].apiUrl}/nutrition/deleteNutritionCategory?category_id=${categoryToDelete.id}`, {
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

        axios.post(`${config[config.environment].apiUrl}/nutrition/addNutritionCategory`, newCategory, {
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

    const handleAddPlan = async () => {
        if (!newPlan.title.trim() || !newPlan.category_id) return;

        let imageUrl = '';
        if (planImage) {
            const formData = new FormData();
            formData.append('image', planImage);

            try {
                const uploadRes = await axios.post(
                    `${config[config.environment].apiUrl}/upload?type=nutrition`,
                    formData,
                    {
                        headers: {
                            Authorization: localStorage.getItem("token"),
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                imageUrl = uploadRes.data.imageUrl;
            } catch (err) {
                console.error("Resim yüklenirken hata oluştu:", err);
                setErrorMessage("Resim yüklenirken bir hata oluştu.");
                setShowErrorPopup(true);
                return;
            }
        }

        const planData = {
            title: newPlan.title.trim(),
            description: newPlan.description.trim(),
            category_id: newPlan.category_id,
            image: imageUrl,
            mealPlan: {}
        };

        DAYS_OF_WEEK.forEach(day => {
            planData.mealPlan[day] = {};
            MEALS.forEach(meal => {
                planData.mealPlan[day][meal] = [];
            });
        });

        axios.post(`${config[config.environment].apiUrl}/nutrition/addNutritionPlan`, planData, {
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
        if (!selectedProgram || !selectedUser || !startDate || !endDate) {
            console.log("Missing required fields:", {
                programExists: !!selectedProgram,
                userExists: !!selectedUser,
                startDateExists: !!startDate,
                endDateExists: !!endDate
            });
            return;
        }

        const addData = {
            client_id: selectedUser.id,
            nutrition_plan_id: selectedProgram.id,
            start_date: startDate,
            end_date: endDate,
            note: assignmentNote
        };

        console.log("Assigning nutrition plan with data:", addData);

        axios.post(`${config[config.environment].apiUrl}/nutrition/assignNutritionPlanToClient`, addData, {
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

                try {
                    axios.post(
                        `${config[config.environment].apiUrl}/notification/sendNutritionPlanAssignedNotification`,
                        { client_id: response.data.client_id },
                        { headers: { Authorization: localStorage.getItem("token") } }
                    );
                    console.log(`Bildirim gönderildi: client_id=${response.data.client_id}`);
                } catch (notificationError) {
                    console.error("Bildirim gönderilirken hata oluştu:", notificationError);
                }

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
                } else if (initialPlan[day] && initialPlan[day][meal] && Array.isArray(initialPlan[day][meal])) {
                    fullPlan[day][meal] = [...initialPlan[day][meal]];
                } else if (initialPlan[day] && initialPlan[day][meal] && typeof initialPlan[day][meal] === 'string') {
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

    const handleSaveMealPlan = (responseData) => {
        setIsSaving(false);
        try {
            fetchNutritionPlans();

            setEditProgramModal(false);

            setSuccessMessage(`"${editTitle}" programı başarıyla ${selectedProgram && selectedProgram.id ? 'güncellendi' : 'oluşturuldu'}.`);
            setShowSuccessPopup(true);

            setEditTitle('');
            setEditDescription('');
            setEditCategoryId('');
            setImagePreview('');
            setEditImage(null);

            const emptyPlan = {};
            DAYS_OF_WEEK.forEach(day => {
                emptyPlan[day] = {};
                MEALS.forEach(meal => {
                    emptyPlan[day][meal] = [];
                });
            });
            setMealPlan(emptyPlan);
            setSelectedProgram(null);
        } catch (error) {
            console.error("Beslenme planı işleme hatası:", error);
            setErrorMessage("Beslenme planı kaydedilirken bir hata oluştu.");
            setShowErrorPopup(true);
        }
    };

    const handleViewProgram = (item) => {
        setSelectedProgram(item);
        setViewProgramModal(true);
    };

    const handleOpenDeleteConfirm = (item) => {
        setItemToDelete(item);
        setDeleteConfirmModal(true);
    };

    const handleDelete = () => {
        if (!itemToDelete) return;

        axios.delete(`${config[config.environment].apiUrl}/nutrition/deleteNutritionPlan?nutrition_plan_id=${itemToDelete.id}`, {
            headers: {Authorization: localStorage.getItem("token")}
        })
            .then(() => {
                const planName = itemToDelete.title;

                setBeslenmeData(prev => prev.filter(dataItem => dataItem.id !== itemToDelete.id));
                setDeleteConfirmModal(false);
                setItemToDelete(null);

                setSuccessMessage(`"${planName}" programı başarıyla silindi.`);
                setShowSuccessPopup(true);
            })
            .catch(error => {
                console.error("Error deleting nutrition plan:", error);
                setDeleteConfirmModal(false);
                setItemToDelete(null);
            });
    };

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

    const renderDanisanAvatar = (danisan) => {
        const defaultAvatar = '/path/to/default/avatar.png';
        const profilePhoto = danisan.profilePhoto;

        return (
            <Avatar
                src={profilePhoto ? profilePhoto : defaultAvatar}
                alt={danisan.name}
            />
        );
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
                                disabled={categoryData.length === 0}
                            >
                                <AddIcon/>
                                <span className="btn-text">Plan</span>
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
                    <div className="search-filter-bar" style={{ width: '100%', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 16, background: '#fff' }}>
                            <TextField
                                variant="outlined"
                                size="small"
                                    placeholder="Plan Adına Göre Ara"
                                    value={planSearchTerm}
                                    onChange={(e) => setPlanSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: planSearchTerm && (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                        onClick={() => setPlanSearchTerm('')}
                                                edge="end"
                                    >
                                        <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            style={{ maxWidth: 300, flex: 1, background: '#fff' }}
                            />
                        {/* Buraya ek filtreler eklenebilir */}
                    </div>
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
                                    dietitian={dietitianInfo}
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
                            <PeopleIcon sx={{mr: 1}}/> Plan Yönetimi
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
                                                button
                                                onClick={() => {
                                                    setSelectedClientInfo(danisan);
                                                    setLoadingClientPrograms(true);
                                                    axios.get(`${config[config.environment].apiUrl}/nutrition/getClientNutritionPlans?client_id=${danisan.id}`, {
                                                        headers: {Authorization: localStorage.getItem("token")}
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
                                                    {renderDanisanAvatar(danisan)}
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
                    <div className="input-container">
                        <label htmlFor="nutritionImage" className={`file-upload-label ${imagePreview ? 'has-file' : ''}`}>
                            <span className="file-upload-icon">📷</span>
                            {imagePreview ? 'Resim seçildi - Değiştirmek için tıklayın' : 'Resim seçmek için tıklayın'}
                        <input
                            type="file"
                            id="nutritionImage"
                            className="text-input"
                            accept="image/*"
                                style={{ display: 'none' }}
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setPlanImage(file);
                                        setImagePreview(reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        </label>
                        {imagePreview && (
                            <div className="image-preview-container">
                                <img src={imagePreview} alt="Program önizleme" className="image-preview" />
                                <button
                                    type="button"
                                    className="remove-image-btn"
                                    onClick={() => {
                                        setEditImage(null);
                                        setImagePreview('');
                                        document.getElementById('nutritionImage').value = '';
                                    }}
                                >
                                    ✖
                                </button>
                            </div>
                        )}
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
                        <div className="date-period-buttons">
                            <Typography variant="h5" sx={{mb: 1, mt: 2}}>
                                Hızlı Süre Seç:
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" mt={1}>
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
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
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
                sx={{ width: '100%' }}
            >
                <div className="modal-body">
                    <MealPlanEditor
                        onSave={handleSaveMealPlan}
                        onCancel={() => setEditProgramModal(false)}
                        isSaving={isSaving}
                        editTitle={editTitle}
                        editDescription={editDescription}
                        editCategoryId={editCategoryId}
                        existingPlan={selectedProgram}
                    />
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
                    <MealPlanViewer
                        mealPlan={selectedProgram?.mealPlan}
                        title={selectedProgram?.title}
                        description={selectedProgram?.description}
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
            <Dialog
                open={clientProgramsModal}
                onClose={() => setClientProgramsModal(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle sx={{
                    backgroundColor: '#1976d2',
                    color: 'green',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2
                }}>
                    <Typography variant="h4" component="div">
                        {selectedClientInfo?.name} - Atanan Programlar
                    </Typography>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={() => setClientProgramsModal(false)}
                        aria-label="close"
                    >
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{p: 3}}>
                    {loadingClientPrograms ? (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            my: 5
                        }}>
                            <CircularProgress size={40} sx={{mb: 2}}/>
                            <Typography variant="body1" color="text.secondary">
                                Programlar yükleniyor...
                            </Typography>
                        </Box>
                    ) : selectedClientPrograms.length > 0 ? (
                        <Box>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    mb: 3,
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3
                                }}
                            >
                                <Avatar
                                    sx={{
                                        bgcolor: selectedClientInfo?.image ? 'transparent' : '#087708',
                                        width: 80,
                                        height: 80,
                                        boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)'
                                    }}
                                    src={selectedClientInfo?.image || ''}
                                >
                                    {!selectedClientInfo?.image && selectedClientInfo?.name.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" component="div" gutterBottom fontWeight="500">
                                        {selectedClientInfo?.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {selectedClientInfo?.email}
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                                        <Chip
                                            icon={<EventIcon fontSize="small"/>}
                                            label={`${selectedClientPrograms.length} Aktif Program`}
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Stack>
                                </Box>
                            </Paper>

                            <Box sx={{mt: 2}}>
                                <Grid container spacing={3}>
                                    {selectedClientPrograms.map((program, index) => {
                                        const formatDate = (dateStr) => {
                                            if (!dateStr) return "Belirtilmemiş";
                                            const date = new Date(dateStr);
                                            return date.toLocaleDateString('tr-TR', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric'
                                            });
                                        };

                                        const calculateDaysBetween = (start, end) => {
                                            if (!start || !end) return null;
                                            const startDate = new Date(start);
                                            const endDate = new Date(end);
                                            const diffTime = endDate - startDate;
                                            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                        };

                                        const daysBetween = calculateDaysBetween(program.start_date, program.end_date);

                                        const getProgramStatus = () => {
                                            const today = new Date();
                                            const startDate = new Date(program.start_date);
                                            const endDate = new Date(program.end_date);

                                            if (today < startDate) {
                                                return {status: "Başlamamış", color: "#3f51b5", chipColor: "primary"};
                                            } else if (today > endDate) {
                                                return {status: "Tamamlandı", color: "#4caf50", chipColor: "success"};
                                            } else {
                                                return {status: "Devam Ediyor", color: "#ff9800", chipColor: "warning"};
                                            }
                                        };

                                        const status = getProgramStatus();

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
                                            <Grid item xs={12} key={index}>
                                                <Card
                                                    elevation={2}
                                                    sx={{
                                                        borderRadius: '10px',
                                                        overflow: 'visible'
                                                    }}
                                                >
                                                    <CardHeader
                                                        title={
                                                            <Typography variant="h6" component="div">
                                                                {program.title}
                                                            </Typography>
                                                        }
                                                        action={
                                                            <Chip
                                                                label={status.status}
                                                                color={status.chipColor}
                                                                size="small"
                                                                sx={{fontWeight: 'medium'}}
                                                            />
                                                        }
                                                    />
                                                    <CardContent sx={{pt: 0}}>
                                                        <Paper
                                                            elevation={0}
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                backgroundColor: '#f8f9fa',
                                                                p: 2,
                                                                borderRadius: '8px',
                                                                mb: 2
                                                            }}
                                                        >
                                                            <Box sx={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center'
                                                            }}>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Başlangıç
                                                                </Typography>
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    mt: 0.5
                                                                }}>
                                                                    <CalendarTodayIcon
                                                                        color="primary"
                                                                        fontSize="small"
                                                                        sx={{mr: 0.5}}
                                                                    />
                                                                    <Typography variant="body1" fontWeight="medium">
                                                                        {formatDate(program.start_date)}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>

                                                            <Divider orientation="vertical" flexItem/>

                                                            <Box sx={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center'
                                                            }}>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Bitiş
                                                                </Typography>
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    mt: 0.5
                                                                }}>
                                                                    <EventAvailableIcon
                                                                        color="primary"
                                                                        fontSize="small"
                                                                        sx={{mr: 0.5}}
                                                                    />
                                                                    <Typography variant="body1" fontWeight="medium">
                                                                        {formatDate(program.end_date)}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>

                                                            <Divider orientation="vertical" flexItem/>

                                                            <Box sx={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center'
                                                            }}>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Süre
                                                                </Typography>
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    mt: 0.5
                                                                }}>
                                                                    <AccessTimeIcon
                                                                        color="primary"
                                                                        fontSize="small"
                                                                        sx={{mr: 0.5}}
                                                                    />
                                                                    <Typography variant="body1" fontWeight="medium">
                                                                        {daysBetween} gün
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </Paper>

                                                        <Box sx={{mb: 2}}>
                                                            <Box sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                mb: 0.5
                                                            }}>
                                                                <Typography variant="body2" fontWeight="medium">
                                                                    Program İlerlemesi
                                                                </Typography>
                                                                <Typography variant="body2" fontWeight="medium">
                                                                    {progressPercent}%
                                                                </Typography>
                                                            </Box>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={progressPercent}
                                                                color={
                                                                    status.chipColor === "success" ? "success" :
                                                                        status.chipColor === "primary" ? "primary" : "warning"
                                                                }
                                                                sx={{
                                                                    height: 8,
                                                                    borderRadius: 2,
                                                                    backgroundColor: 'rgba(0,0,0,0.1)'
                                                                }}
                                                            />
                                                        </Box>

                                                        {program.description && (
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'flex-start',
                                                                mb: 2
                                                            }}>
                                                                <DescriptionIcon
                                                                    fontSize="small"
                                                                    color="action"
                                                                    sx={{mt: 0.3, mr: 1}}
                                                                />
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {program.description || "Açıklama bulunmuyor."}
                                                                </Typography>
                                                            </Box>
                                                        )}

                                                        {program.note && (
                                                            <Box sx={{
                                                                border: '1px solid rgba(0, 0, 0, 0.12)',
                                                                borderRadius: 1,
                                                                p: 1.5,
                                                                mb: 2,
                                                                backgroundColor: '#fffde7'
                                                            }}>
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    mb: 0.5
                                                                }}>
                                                                    <NoteIcon fontSize="small" sx={{mr: 1}}
                                                                              color="warning"/>
                                                                    <Typography variant="body2" fontWeight="medium">
                                                                        Diyetisyen Notu
                                                                    </Typography>
                                                                </Box>
                                                                <Typography variant="body2" color="text.secondary"
                                                                            sx={{pl: 3.5}}>
                                                                    {program.note}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </CardContent>

                                                    <CardActions sx={{justifyContent: 'flex-end', p: 2, pt: 0}}>
                                                        {(() => {
                                                            const programDetails = beslenmeData.find(item => item.id === program.nutrition_plan_id);
                                                            if (programDetails) {
                                                                return (
                                                                    <ConditionalPDFLink
                                                                        document={<NutritionPlanDocument dietitian={dietitianInfo} program={programDetails}/>}
                                                                        fileName={`${programDetails.title.replace(/\s+/g, '_')}_beslenme_programi.pdf`}
                                                                        buttonClass="MuiButtonBase-root MuiButton-root MuiButton-outlined"
                                                                        buttonTitle="PDF İndir"
                                                                    >
                                                                        {({blob, url, loading, error}) => (
                                                                            <Button
                                                                                variant="outlined"
                                                                                startIcon={<FileDownloadIcon/>}
                                                                                disabled={loading}
                                                                            >
                                                                                {loading ? 'Hazırlanıyor...' : 'PDF İndir'}
                                                                            </Button>
                                                                        )}
                                                                    </ConditionalPDFLink>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            startIcon={<RestaurantIcon/>}
                                                            onClick={() => {
                                                                const programDetails = beslenmeData.find(item => item.id === program.nutrition_plan_id);
                                                                if (programDetails) {
                                                                    setSelectedProgram(programDetails);
                                                                    setViewProgramModal(true);
                                                                    setClientProgramsModal(false);
                                                                }
                                                            }}
                                                        >
                                                            Programı Görüntüle
                                                        </Button>
                                                    </CardActions>
                                                </Card>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 5,
                            textAlign: 'center'
                        }}>
                            <RestaurantIcon sx={{fontSize: 70, color: '#ccc', mb: 2}}/>
                            <Typography variant="h6" gutterBottom>
                                Atanmış Program Bulunamadı
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
                                Bu danışana henüz bir beslenme programı atanmamış.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => setClientProgramsModal(false)}
                            >
                                Kapat
                            </Button>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Default>
    );
}

