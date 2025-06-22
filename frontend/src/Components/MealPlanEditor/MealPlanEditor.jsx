import React, { useState, useEffect, useRef } from 'react';
import './MealPlanEditor.css';
import { showErrorToast, showSuccessToast } from '../../utils/toastUtil';
import axios from 'axios';
import config from '../../config';

const MealPlanEditor = ({ onSave, onCancel, isSaving, editTitle = '', editDescription = '', editCategoryId = '', existingPlan = null }) => {
    const [title, setTitle] = useState(existingPlan?.title || editTitle);
    const [description, setDescription] = useState(existingPlan?.description || editDescription);
    const [categoryId, setCategoryId] = useState(existingPlan?.category_id || editCategoryId);
    const [categories, setCategories] = useState([]);
    const [planImage, setPlanImage] = useState(existingPlan?.image && !existingPlan.image.includes('placeholder.png') ? existingPlan.image : null);
    const [imagePreview, setImagePreview] = useState(existingPlan?.image && !existingPlan.image.includes('placeholder.png') ? existingPlan.image : '')

    useEffect(() => {
        if (!existingPlan) {
            setTitle(editTitle);
            setDescription(editDescription);
            setCategoryId(editCategoryId);
        }
    }, [editTitle, editDescription, editCategoryId, existingPlan]);

    const defaultDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const defaultMealTypes = [
        { id: '1', name: 'Kahvaltı', color: '#FFC107', order: 0, time: '08:00' },
        { id: '2', name: 'Öğle Yemeği', color: '#FF9800', order: 1, time: '13:00' },
        { id: '3', name: 'Akşam Yemeği', color: '#9C27B0', order: 2, time: '19:00' },
        { id: '4', name: 'Aparatif', color: '#E91E63', order: 3, time: '16:00' }
    ];

    const defaultMainMenu = 'Alternatif';

    const dayOrderMap = Object.fromEntries(defaultDays.map((day, index) => [day, index]));

    const getInitialMealTypes = () => {
        if (existingPlan?.mealPlan && Object.keys(existingPlan.mealPlan).length > 0) {
            const existingMealNames = new Set();
            const existingMealTimes = {};

            Object.values(existingPlan.mealPlan).forEach(dayData => {
                Object.entries(dayData).forEach(([mealName, mealData]) => {
                    existingMealNames.add(mealName);

                    if (!existingMealTimes[mealName]) {
                        if (typeof mealData === 'object' && mealData.info && mealData.info.time) {
                            existingMealTimes[mealName] = mealData.info.time;
                        }
                        // data.time yapısında saati ara (eski format)
                        else if (typeof mealData === 'object' && mealData.data && mealData.data.time) {
                            existingMealTimes[mealName] = mealData.data.time;
                        }
                    }
                });
            });

            const matchedMealTypes = defaultMealTypes
                .filter(mealType => existingMealNames.has(mealType.name))
                .map(mealType => ({
                    ...mealType,
                    time: existingMealTimes[mealType.name] || mealType.time
                }));

            // Özel öğün tipleri için de saat bilgisini kullan
            const newMealTypes = Array.from(existingMealNames)
                .filter(mealName => !defaultMealTypes.some(mt => mt.name === mealName))
                .map((mealName, index) => ({
                    id: `existing-${index}`,
                    name: mealName,
                    color: '#' + Math.floor(Math.random()*16777215).toString(16),
                    order: defaultMealTypes.length + index,
                    time: existingMealTimes[mealName] || '' // Kaydedilmiş saat bilgisini kullan
                }));

            return [...matchedMealTypes, ...newMealTypes].sort((a, b) => a.order - b.order);
        }
        return [...defaultMealTypes];
    };

    const getInitialDays = () => {
        if (existingPlan?.mealPlan && Object.keys(existingPlan.mealPlan).length > 0) {
            const existingDays = Object.keys(existingPlan.mealPlan);
            return existingDays
                .filter(day => defaultDays.includes(day))
                .sort((a, b) => dayOrderMap[a] - dayOrderMap[b]);
        }
        return [...defaultDays];
    };

    const [days, setDays] = useState(() => getInitialDays());
    const [mealTypes, setMealTypes] = useState(() => getInitialMealTypes());

    const [unusedDays, setUnusedDays] = useState(() => {
        const activeDays = getInitialDays();
        return defaultDays.filter(day => !activeDays.includes(day));
    });
    const [unusedMealTypes, setUnusedMealTypes] = useState(() => {
        const activeMealTypes = getInitialMealTypes();
        return defaultMealTypes.filter(defaultMeal =>
            !activeMealTypes.some(activeMeal => activeMeal.name === defaultMeal.name)
        );
    });

    const [showAddDay, setShowAddDay] = useState(false);
    const [showAddMeal, setShowAddMeal] = useState(false);

    const [editingMealType, setEditingMealType] = useState(null);
    const [editedMealName, setEditedMealName] = useState('');
    const [editedMealTime, setEditedMealTime] = useState('');

    const [copiedDay, setCopiedDay] = useState(null);

    const [editingCellAlternative, setEditingCellAlternative] = useState(null); // format: "day-mealType"
    const [newAlternativeName, setNewAlternativeName] = useState('');

    const [editingAlternativeName, setEditingAlternativeName] = useState(null); // format: "day-mealType-alternativeName"
    const [editedAlternativeName, setEditedAlternativeName] = useState('');

    const [mealPlan, setMealPlan] = useState(() => {
        if (existingPlan?.mealPlan && typeof existingPlan.mealPlan === 'object' && !Array.isArray(existingPlan.mealPlan) && Object.keys(existingPlan.mealPlan).length > 0) {
            console.log('Existing plan detected, processing...', existingPlan.mealPlan);

            const normalizedPlan = {};
            const existingDays = Object.keys(existingPlan.mealPlan);
            const existingMealNames = new Set();

            Object.values(existingPlan.mealPlan).forEach(dayData => {
                Object.keys(dayData).forEach(mealName => {
                    existingMealNames.add(mealName);
                });
            });

            existingDays.forEach(day => {
                if (defaultDays.includes(day)) {
                    normalizedPlan[day] = {};

                    Array.from(existingMealNames).forEach(mealName => {
                        if (existingPlan.mealPlan[day] && existingPlan.mealPlan[day][mealName]) {
                            const currentMealData = existingPlan.mealPlan[day][mealName];

                            if (typeof currentMealData === 'string') {
                                const items = currentMealData.trim() ?
                                    currentMealData.split(',').map(item => item.trim()) : [];
                                normalizedPlan[day][mealName] = {
                                    info: {
                                        image: '',
                                        time: mealTypes.find(m => m.name === mealName)?.time || ''
                                    },
                                    [defaultMainMenu]: items
                                };
                            } else if (Array.isArray(currentMealData)) {
                                normalizedPlan[day][mealName] = {
                                    [defaultMainMenu]: [...currentMealData]
                                };
                            } else if (currentMealData && typeof currentMealData === 'object') {
                                normalizedPlan[day][mealName] = { ...currentMealData };

                                // Eğer data alt dalı yoksa ekle
                                if (!normalizedPlan[day][mealName].data) {
                                    normalizedPlan[day][mealName].info = {
                                        image: '',
                                        time: mealTypes.find(m => m.name === mealName)?.time || ''
                                    };
                                }
                                // Eğer data varsa info'ya kopyala ve data'yı sil
                                else {
                                    normalizedPlan[day][mealName].info = { ...normalizedPlan[day][mealName].data };
                                    delete normalizedPlan[day][mealName].data;
                                }
                            } else {
                                normalizedPlan[day][mealName] = {
                                    info: {
                                        image: '',
                                        time: mealTypes.find(m => m.name === mealName)?.time || ''
                                    },
                                    [defaultMainMenu]: []
                                };
                            }
                        } else {
                            normalizedPlan[day][mealName] = {
                                info: {
                                    image: '',
                                    time: mealTypes.find(m => m.name === mealName)?.time || ''
                                },
                                [defaultMainMenu]: []
                            };
                        }
                    });
                }
            });

            console.log('Normalized plan:', normalizedPlan);
            return normalizedPlan;
        }

        const initialPlan = {};
        defaultDays.forEach(day => {
            initialPlan[day] = {};
            defaultMealTypes.forEach(meal => {
                initialPlan[day][meal.name] = {
                    info: { image: '', time: meal.time || '' },
                    [defaultMainMenu]: []
                };
            });
        });
        return initialPlan;
    });

    useEffect(() => {
        axios.get(`${config[config.environment].apiUrl}/nutrition/getNutritionCategories`, {
            headers: {Authorization: localStorage.getItem("token")}
        })
            .then(response => {
                setCategories(response.data || []);

                if (existingPlan?.category_id) {
                    setCategoryId(existingPlan.category_id);
                }
            })
            .catch(error => {
                console.error("Kategoriler yüklenirken hata oluştu:", error);
                showErrorToast("Kategoriler yüklenirken bir hata oluştu.");
            });
    }, [existingPlan]);

    const getAlternativesForCell = (day, mealType) => {
        if (mealPlan[day] && mealPlan[day][mealType]) {
            // "info" özelliğini hariç tutarak alternatif menüleri döndür
            return Object.keys(mealPlan[day][mealType]).filter(key => key !== 'info');
        }
        return [defaultMainMenu];
    };

    const removeDay = (dayToRemove) => {
        if (days.length <= 1) {
            showErrorToast("En az bir gün bulunmalıdır! Son günü silemezsiniz.");
            return;
        }

        setDays(days.filter(day => day !== dayToRemove));
        setUnusedDays([...unusedDays, dayToRemove]);

        setMealPlan(prev => {
            const updated = {...prev};
            delete updated[dayToRemove];
            return updated;
        });

        showSuccessToast(`${dayToRemove} günü başarıyla silindi.`);
    };

    const removeMealType = (mealTypeToRemove) => {
        if (mealTypes.length <= 1) {
            showErrorToast("En az bir öğün bulunmalıdır! Son öğünü silemezsiniz.");
            return;
        }

        setMealTypes(mealTypes.filter(meal => meal.id !== mealTypeToRemove.id));
        setUnusedMealTypes([...unusedMealTypes, mealTypeToRemove]);

        setMealPlan(prev => {
            const updated = {...prev};
            days.forEach(day => {
                if (updated[day] && updated[day][mealTypeToRemove.name]) {
                    delete updated[day][mealTypeToRemove.name];
                }
            });
            return updated;
        });

        showSuccessToast(`${mealTypeToRemove.name} öğünü başarıyla silindi.`);
    };

    const addDay = (dayToAdd) => {
        const newDaysArray = [...days, dayToAdd].sort((a, b) => dayOrderMap[a] - dayOrderMap[b]);
        setDays(newDaysArray);
        setUnusedDays(unusedDays.filter(day => day !== dayToAdd));
        setShowAddDay(false);

        setMealPlan(prev => {
            const updated = {...prev};
            updated[dayToAdd] = {};
            mealTypes.forEach(meal => {
                updated[dayToAdd][meal.name] = {
                    info: { image: '', time: meal.time || '' },
                    [defaultMainMenu]: []
                };
            });
            return updated;
        });
    };

    const addMealType = (mealTypeToAdd) => {
        const newMealTypes = [...mealTypes, mealTypeToAdd].sort((a, b) => a.order - b.order);
        setMealTypes(newMealTypes);
        setUnusedMealTypes(unusedMealTypes.filter(meal => meal.id !== mealTypeToAdd.id));
        setShowAddMeal(false);

        setMealPlan(prev => {
            const updated = {...prev};
            days.forEach(day => {
                if (!updated[day]) updated[day] = {};
                updated[day][mealTypeToAdd.name] = {
                    info: { image: '', time: mealTypeToAdd.time || '' },
                    [defaultMainMenu]: []
                };
            });
            return updated;
        });
    };

    const startEditingMealName = (mealType) => {
        setEditingMealType(mealType);
        setEditedMealName(mealType.name);
        setEditedMealTime(mealType.time || '');
    };

    const saveMealName = () => {
        if (!editedMealName.trim()) return;

        const oldName = editingMealType.name;
        const newName = editedMealName.trim();

        setMealTypes(mealTypes.map(meal =>
            meal.id === editingMealType.id
                ? { ...meal, name: newName, time: editedMealTime }
                : meal
        ));

        setMealPlan(prev => {
            const updated = {...prev};
            days.forEach(day => {
                if (updated[day] && updated[day][oldName]) {
                    updated[day][newName] = {...updated[day][oldName]};

                    if (updated[day][newName].info) {
                        updated[day][newName].info.time = editedMealTime;
                    }

                    if (oldName !== newName) {
                        delete updated[day][oldName];
                    }
                }
            });
            return updated;
        });

        setEditingMealType(null);
        setEditedMealName('');
        setEditedMealTime('');
    };

    const addCellAlternative = (day, mealType) => {
        if (!newAlternativeName.trim()) return;

        const alternativeName = newAlternativeName.trim();

        const cellAlternatives = getAlternativesForCell(day, mealType);
        if (cellAlternatives.includes(alternativeName)) {
            setNewAlternativeName('');
            setEditingCellAlternative(null);
            return;
        }

        setMealPlan(prev => {
            const updated = {...prev};
            if (!updated[day][mealType][alternativeName]) {
                updated[day][mealType][alternativeName] = [];
            }
            return updated;
        });

        setNewAlternativeName('');
        setEditingCellAlternative(null);
    };

    const removeCellAlternative = (day, mealType, alternativeToRemove) => {
        if (alternativeToRemove === defaultMainMenu) return;

        setMealPlan(prev => {
            const updated = {...prev};
            if (updated[day]?.[mealType]) {
                const { [alternativeToRemove]: removed, ...rest } = updated[day][mealType];
                updated[day][mealType] = rest;
            }
            return updated;
        });
    };

    const [editingCell, setEditingCell] = useState(null);
    const [newMealInput, setNewMealInput] = useState('');
    const [newMealAmount, setNewMealAmount] = useState('');

    const addMeal = (day, mealType, alternative, mealText, mealAmount) => {
        if (!mealText || !mealText.trim()) {
            setNewMealInput('');
            setNewMealAmount('');
            setEditingCell(null);
            return;
        }

        const mealItem = {
            name: mealText.trim(),
            portion: mealAmount ? mealAmount.trim() : null
        };

        setMealPlan(prev => {
            const updated = {...prev};
            if (!updated[day][mealType][alternative]) {
                updated[day][mealType][alternative] = [];
            }
            updated[day][mealType][alternative] = [...updated[day][mealType][alternative], mealItem];
            return updated;
        });

        setNewMealInput('');
        setNewMealAmount('');
        setEditingCell(null);
    };

    const removeMeal = (day, mealType, alternative, index) => {
        setMealPlan(prev => {
            const updated = {...prev};
            updated[day][mealType][alternative] = [
                ...updated[day][mealType][alternative].slice(0, index),
                ...updated[day][mealType][alternative].slice(index + 1)
            ];
            return updated;
        });
    };

    const startEditing = (day, mealType, alternative) => {
        setEditingCell(`${day}-${mealType}-${alternative}`);
        setNewMealInput('');
        setNewMealAmount('');
    };

    const startAddingAlternative = (day, mealType) => {
        setEditingCellAlternative(`${day}-${mealType}`);

        const currentAlternatives = Object.keys(mealPlan[day]?.[mealType] || {});
        const alternativeNumbers = currentAlternatives
            .filter(alt => alt.startsWith('Alternatif '))
            .map(alt => {
                const num = parseInt(alt.replace('Alternatif ', ''), 10);
                return isNaN(num) ? 0 : num;
            });

        const maxNumber = alternativeNumbers.length > 0 ? Math.max(...alternativeNumbers) : 0;
        const nextNumber = maxNumber + 1;

        const startNumber = 2;
        const newNumber = Math.max(nextNumber, startNumber);

        setNewAlternativeName(`Alternatif ${newNumber}`);
    };

    const cancelEditing = () => {
        setEditingCell(null);
        setNewMealInput('');
        setNewMealAmount('');
    };

    const cancelAddingAlternative = () => {
        setEditingCellAlternative(null);
        setNewAlternativeName('');
    };

    const handleKeyPress = (e, day, mealType, alternative) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addMeal(day, mealType, alternative, newMealInput, newMealAmount);
        } else if (e.key === 'Escape') {
            cancelEditing();
        }
    };

    const handleAlternativeKeyPress = (e, day, mealType) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCellAlternative(day, mealType);
        } else if (e.key === 'Escape') {
            cancelAddingAlternative();
        }
    };

    const startEditingAlternativeName = (day, mealType, alternative) => {
        setEditingAlternativeName(`${day}-${mealType}-${alternative}`);
        setEditedAlternativeName(alternative);
    };

    const saveAlternativeName = (day, mealType, oldName) => {
        if (!editedAlternativeName.trim() || editedAlternativeName === oldName) {
            cancelEditingAlternativeName();
            return;
        }

        const newName = editedAlternativeName.trim();

        if (mealPlan[day]?.[mealType]?.[newName]) {
            showErrorToast("Bu isimde bir alternatif zaten var!");
            cancelEditingAlternativeName();
            return;
        }

        setMealPlan(prev => {
            const updated = {...prev};

            updated[day][mealType][newName] = [...updated[day][mealType][oldName]];

            const { [oldName]: removed, ...rest } = updated[day][mealType];
            updated[day][mealType] = rest;

            updated[day][mealType] = {
                ...rest,
                [newName]: updated[day][mealType][newName]
            };

            return updated;
        });

        cancelEditingAlternativeName();
        showSuccessToast(`Alternatif ismi başarıyla değiştirildi: ${oldName} -> ${newName}`);
    };

    const cancelEditingAlternativeName = () => {
        setEditingAlternativeName(null);
        setEditedAlternativeName('');
    };

    const handleAlternativeNameKeyPress = (e, day, mealType, oldName) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveAlternativeName(day, mealType, oldName);
        } else if (e.key === 'Escape') {
            cancelEditingAlternativeName();
        }
    };

    const copyDay = (dayToCopy) => {
        setCopiedDay(dayToCopy);
        showSuccessToast(`${dayToCopy} günü kopyalandı. Şimdi başka bir güne yapıştırabilirsiniz.`);
    };

    const pasteDay = (targetDay) => {
        if (!copiedDay) {
            showErrorToast("Önce bir gün kopyalamalısınız!");
            return;
        }

        if (copiedDay === targetDay) {
            showErrorToast("Aynı güne yapıştırma işlemi yapamazsınız!");
            return;
        }

        setMealPlan(prev => {
            const updated = {...prev};

            mealTypes.forEach(meal => {
                if (updated[copiedDay] && updated[copiedDay][meal.name]) {
                    updated[targetDay][meal.name] = JSON.parse(JSON.stringify(updated[copiedDay][meal.name]));
                }
            });

            return updated;
        });

        showSuccessToast(`${copiedDay} günündeki içerik ${targetDay} gününe başarıyla yapıştırıldı.`);
    };

    const saveMealPlan = async () => {
        try {
            if (!title || title.trim() === "") {
                showErrorToast("Lütfen bir plan başlığı giriniz.");
                return;
            }

            if (!categoryId) {
                showErrorToast("Lütfen bir kategori seçiniz.");
                return;
            }

            let isEmpty = true;
            for (const day in mealPlan) {
                if (Object.keys(mealPlan[day]).length > 0) {
                    isEmpty = false;
                    break;
                }
            }

            if (isEmpty) {
                showErrorToast("En az bir güne öğün eklenmelidir.");
                return;
            }

            if (isSaving) return;

            let imageUrl = existingPlan?.image || "/placeholder.png";

            if (planImage && planImage instanceof File) {
                const formData = new FormData();
                formData.append('image', planImage);

                try {
                    const uploadResponse = await axios.post(`${config[config.environment].apiUrl}/upload`, formData, {
                        headers: {
                            Authorization: localStorage.getItem("token"),
                            'Content-Type': 'multipart/form-data'
                        }
                    });

                    if (uploadResponse.data && uploadResponse.data.imageUrl) {
                        imageUrl = uploadResponse.data.imageUrl;
                    }
                } catch (uploadError) {
                    console.error("Resim yükleme hatası:", uploadError);
                    showErrorToast("Resim yüklenirken bir hata oluştu. Plan kaydedilecek ancak varsayılan görsel kullanılacak.");
                }
            }

            const planData = {
                nutrition_plan_id: existingPlan?.id ? parseInt(existingPlan.id) : null,
                title: title,
                description: description || "",
                image: imageUrl,
                category_id: parseInt(categoryId),
                mealPlan: mealPlan
            };

            console.log('Saving meal plan:', planData);

            const endpoint = `${config[config.environment].apiUrl}/nutrition/updateNutritionPlan`;
            const method = 'put';

            const response = await axios({
                method,
                url: endpoint,
                data: planData,
                headers: {
                    'Authorization': localStorage.getItem("token")
                }
            });

            if (response.status === 200) {
                onSave(response.data);
            }
        } catch (error) {
            console.error("Beslenme planı kaydetme hatası:", error);
            showErrorToast(`Beslenme planı güncellenemedi. Lütfen tekrar deneyin.`);
        }
    };

    const containerRef = useRef(null);
    const addDayMenuRef = useRef(null);
    const addMealMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showAddDay && addDayMenuRef.current && !addDayMenuRef.current.contains(event.target)) {
                setShowAddDay(false);
            }

            if (showAddMeal && addMealMenuRef.current && !addMealMenuRef.current.contains(event.target)) {
                setShowAddMeal(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        // Temizleme
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showAddDay, showAddMeal]);

    return (
        <div className="mui-meal-plan-container" ref={containerRef}>
            {/* Header */}
            <div className="mui-meal-plan-header">
                <h2 className="mui-meal-plan-title">
                    Haftalık Beslenme Programı
                </h2>
                <p className="mui-meal-plan-subtitle">
                    Her gün için öğün planınızı düzenleyin
                </p>
            </div>

            {/* Plan Detayları Formu */}
            <div className="mui-plan-details-form">
                <div className="mui-form-row">
                    <div className="mui-form-group">
                        <label htmlFor="plan-title">Plan Başlığı <span className="required">*</span></label>
                        <input
                            type="text"
                            id="plan-title"
                            className="mui-form-control"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Beslenme planı başlığı"
                            required
                        />
                    </div>
                </div>

                <div className="mui-form-row">
                    <div className="mui-form-group">
                        <label htmlFor="plan-description">Açıklama</label>
                        <textarea
                            id="plan-description"
                            className="mui-form-control"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Beslenme planı hakkında açıklama"
                            rows={2}
                        ></textarea>
                    </div>
                </div>

                <div className="mui-form-row">
                    <div className="mui-form-group">
                        <label htmlFor="plan-category">Kategori <span className="required">*</span></label>
                        <select
                            id="plan-category"
                            className="mui-form-control"
                            value={categoryId}
                            onChange={e => setCategoryId(e.target.value)}
                            required
                        >
                            <option value="">Kategori Seçin</option>
                            {categories.map(category => (
                                <option
                                    key={category.category_id || category.id}
                                    value={category.category_id || category.id}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mui-form-row">
                    <div className="mui-form-group">
                        <label htmlFor="plan-image">Plan Görseli</label>
                        {/* Gerçek dosya input'unu gizle */}
                        <input
                            type="file"
                            id="plan-image"
                            className="mui-form-control"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    // Resmi önizleme için URL'e dönüştür
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setPlanImage(file);
                                        setImagePreview(reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="plan-image" className="file-upload-label">
                            <span className="file-upload-icon">📷</span>
                            {imagePreview ? 'Resim seçildi - Değiştirmek için tıklayın' : 'Resim seçmek için tıklayın'}
                        </label>
                        {imagePreview && (
                            <div className="image-preview-container">
                                <img src={imagePreview} alt="Plan önizleme" className="image-preview" />
                                <button
                                    type="button"
                                    className="remove-image-btn"
                                    onClick={() => {
                                        setPlanImage(null);
                                        setImagePreview('');
                                        document.getElementById('plan-image').value = '';
                                    }}
                                >
                                    ✖
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="mui-table-container">
                <table className="mui-meal-plan-table">
                    <thead>
                    <tr>
                        <th className="mui-table-header-cell mui-sticky-cell">
                            <div className="mui-header-content">
                                <span>Öğün / Gün</span>
                            </div>
                        </th>
                        {days.map(day => (
                            <th key={day} className="mui-table-header-cell mui-day-header">
                                <div className="mui-day-header-content">
                                    <div className="mui-day-actions">
                                        <button
                                            className="mui-btn mui-btn-icon mui-copy-btn"
                                            onClick={() => copyDay(day)}
                                            title="Bu günü kopyala"
                                            style={{
                                                backgroundColor: '#2196F3',
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                border: 'none',
                                                marginRight: '5px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                fontSize: '12px'
                                            }}
                                        >
                                            <span>📋</span>
                                        </button>
                                        <button
                                            className={`mui-btn mui-btn-icon mui-paste-btn ${copiedDay ? 'active' : ''}`}
                                            onClick={() => pasteDay(day)}
                                            disabled={!copiedDay || copiedDay === day}
                                            title={
                                                !copiedDay ? "Önce bir gün kopyalamalısınız" :
                                                copiedDay === day ? "Aynı güne yapıştıramazsınız" :
                                                `${copiedDay} gününü buraya yapıştır`
                                            }
                                            style={{
                                                backgroundColor: '#4CAF50',
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                border: 'none',
                                                opacity: (!copiedDay || copiedDay === day) ? '0.5' : '1',
                                                cursor: (!copiedDay || copiedDay === day) ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                fontSize: '12px',
                                                animation: (copiedDay && copiedDay !== day) ? 'pulse 1.5s infinite' : 'none'
                                            }}
                                        >
                                            <span>📄</span>
                                        </button>
                                    </div>
                                    <span>{day}</span>
                                    <button
                                        className="mui-remove-btn"
                                        onClick={() => removeDay(day)}
                                        title="Bu günü kaldır"
                                    >
                                        ×
                                    </button>
                                </div>
                            </th>
                        ))}
                        <th className="mui-table-header-cell mui-add-column-cell">
                            {showAddDay ? (
                                <div className="mui-add-day-panel" ref={addDayMenuRef}>
                                    <div className="mui-add-day-header">
                                        <span>Eklemek istediğiniz günü seçin</span>
                                    </div>
                                    <div className="mui-day-buttons">
                                        {unusedDays.map(day => (
                                            <button
                                                key={day}
                                                className="mui-day-select-btn"
                                                onClick={() => addDay(day)}
                                            >
                                                <span className="mui-day-name">{day}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {unusedDays.length === 0 && (
                                        <div className="mui-no-days-message">
                                            Eklenecek başka gün kalmadı
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    className="mui-add-btn"
                                    onClick={() => setShowAddDay(true)}
                                    disabled={unusedDays.length === 0}
                                    title={unusedDays.length === 0 ? "Eklenecek gün kalmadı" : "Yeni gün ekle"}
                                >
                                    +
                                </button>
                            )}
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {mealTypes.map((mealType, index) => (
                        <tr key={mealType.name} className={`mui-meal-row ${index % 2 === 0 ? 'mui-even-row' : 'mui-odd-row'}`}>
                            <td className="mui-meal-type-cell mui-sticky-cell">
                                <div className="mui-meal-type-content">
                                    {editingMealType && editingMealType.id === mealType.id ? (
                                        <div className="mui-edit-meal-name-form">
                                            <div className="mui-meal-form-field">
                                                <label htmlFor="meal-name-input" className="mui-time-picker-label">Öğün Adı</label>
                                                <input
                                                    id="meal-name-input"
                                                    type="text"
                                                    value={editedMealName}
                                                    onChange={(e) => setEditedMealName(e.target.value)}
                                                    className="mui-meal-input"
                                                    autoFocus
                                                    placeholder="Öğün adı"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') saveMealName();
                                                        else if (e.key === 'Escape') setEditingMealType(null);
                                                    }}
                                                />
                                            </div>

                                            <div className="mui-meal-form-field">
                                                <label htmlFor="meal-time-input" className="mui-time-picker-label">Öğün Saati</label>
                                                <div className="mui-time-picker-container">
                                                    <span className="mui-time-picker-icon">🕒</span>
                                                    <input
                                                        id="meal-time-input"
                                                        type="time"
                                                        value={editedMealTime}
                                                        onChange={(e) => setEditedMealTime(e.target.value)}
                                                        className="mui-meal-time-input"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mui-form-actions">
                                                <button
                                                    className="mui-btn mui-btn-contained mui-btn-small"
                                                    onClick={saveMealName}
                                                    style={{ backgroundColor: mealType.color }}
                                                >
                                                    ✓ Kaydet
                                                </button>
                                                <button
                                                    className="mui-btn mui-btn-outlined mui-btn-small"
                                                    onClick={() => setEditingMealType(null)}
                                                >
                                                    ✗ İptal
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mui-meal-type-header">
                                            <span
                                                className="mui-meal-type-name"
                                                onClick={() => startEditingMealName(mealType)}
                                                title="Öğun adını ve saatini düzenlemek için tıklayın"
                                            >
                                                {mealType.name}
                                                {mealType.time && <span className="mui-meal-time"> ({mealType.time})</span>}
                                            </span>
                                            <button
                                                className="mui-remove-btn"
                                                onClick={() => removeMealType(mealType)}
                                                title="Bu öğünü kaldır"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </td>
                            {days.map(day => (
                                <td key={`${day}-${mealType.name}`} className="mui-meal-cell">
                                    <div className="mui-meal-cell-content">
                                        {/* Alternatif Sekmeleri */}
                                        <div className="mui-alternatives-tabs">
                                            {getAlternativesForCell(day, mealType.name).map(alternative => (
                                                <div key={alternative} className="mui-alternative-section">
                                                    <div className="mui-alternative-header">
                                                        {editingAlternativeName === `${day}-${mealType.name}-${alternative}` ? (
                                                            <div className="mui-edit-alternative-name-form">
                                                                <input
                                                                    type="text"
                                                                    value={editedAlternativeName}
                                                                    onChange={(e) => setEditedAlternativeName(e.target.value)}
                                                                    className="mui-alternative-input"
                                                                    autoFocus
                                                                    onKeyDown={(e) => handleAlternativeNameKeyPress(e, day, mealType.name, alternative)}
                                                                />
                                                                <div className="mui-form-actions">
                                                                    <button
                                                                        className="mui-btn mui-btn-contained mui-btn-small"
                                                                        onClick={() => saveAlternativeName(day, mealType.name, alternative)}
                                                                        style={{ backgroundColor: mealType.color }}
                                                                    >
                                                                        ✓
                                                                    </button>
                                                                    <button
                                                                        className="mui-btn mui-btn-outlined mui-btn-small"
                                                                        onClick={cancelEditingAlternativeName}
                                                                    >
                                                                        ✗
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <span
                                                                    className="mui-alternative-title editable"
                                                                    onClick={() => startEditingAlternativeName(day, mealType.name, alternative)}
                                                                    title="Alternatif adını düzenlemek için tıklayın"
                                                                >
                                                                    {alternative}
                                                                </span>
                                                                <span className="mui-alternative-count">
                                                                    ({mealPlan[day]?.[mealType.name]?.[alternative]?.length || 0})
                                                                </span>
                                                                {alternative !== defaultMainMenu && (
                                                                    <button
                                                                        className="mui-alternative-delete"
                                                                        onClick={() => removeCellAlternative(day, mealType.name, alternative)}
                                                                        title="Bu alternatifi kaldır"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Existing meals for this alternative */}
                                                    <div className="mui-meals-list">
                                                        {mealPlan[day]?.[mealType.name]?.[alternative]?.map((meal, mealIndex) => (
                                                            <div
                                                                key={mealIndex}
                                                                className="mui-meal-chip"
                                                                style={{
                                                                    backgroundColor: `${mealType.color}20`,
                                                                    borderColor: mealType.color,
                                                                }}
                                                            >
                                                                <span className="mui-chip-label">{meal.name}{meal.portion ? `: ${meal.portion}` : ''}</span>
                                                                <button
                                                                    className="mui-chip-delete"
                                                                    onClick={() => removeMeal(day, mealType.name, alternative, mealIndex)}
                                                                    style={{ color: mealType.color }}
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Add meal section */}
                                                    {editingCell === `${day}-${mealType.name}-${alternative}` ? (
                                                        <div className="mui-add-meal-form">
                                                            <input
                                                                type="text"
                                                                value={newMealInput}
                                                                onChange={(e) => setNewMealInput(e.target.value)}
                                                                onKeyDown={(e) => handleKeyPress(e, day, mealType.name, alternative)}
                                                                placeholder="Yemek adını giriniz..."
                                                                className="mui-meal-input"
                                                                autoFocus
                                                            />
                                                            <input
                                                                type="text"
                                                                value={newMealAmount}
                                                                onChange={(e) => setNewMealAmount(e.target.value)}
                                                                placeholder="Miktar / Porsiyon"
                                                                className="mui-meal-amount-input"
                                                            />
                                                            <div className="mui-form-actions">
                                                                <button
                                                                    className="mui-btn mui-btn-contained"
                                                                    onClick={() => addMeal(day, mealType.name, alternative, newMealInput, newMealAmount)}
                                                                    style={{ backgroundColor: mealType.color }}
                                                                >
                                                                    💾 Ekle
                                                                </button>
                                                                <button
                                                                    className="mui-btn mui-btn-outlined"
                                                                    onClick={cancelEditing}
                                                                >
                                                                    ❌ İptal
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            className="mui-add-meal-btn"
                                                            onClick={() => startEditing(day, mealType.name, alternative)}
                                                            style={{
                                                                borderColor: `${mealType.color}50`,
                                                                color: mealType.color,
                                                            }}
                                                        >
                                                            + Yemek Ekle
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Hücreye özel alternatif ekleme bölümü */}
                                        {editingCellAlternative === `${day}-${mealType.name}` ? (
                                            <div className="mui-add-cell-alternative-form">
                                                <input
                                                    type="text"
                                                    value={newAlternativeName}
                                                    onChange={(e) => setNewAlternativeName(e.target.value)}
                                                    onKeyDown={(e) => handleAlternativeKeyPress(e, day, mealType.name)}
                                                    placeholder="Alternatif adı..."
                                                    className="mui-meal-input"
                                                    autoFocus
                                                />
                                                <div className="mui-form-actions">
                                                    <button
                                                        className="mui-btn mui-btn-contained"
                                                        onClick={() => addCellAlternative(day, mealType.name)}
                                                        style={{ backgroundColor: mealType.color }}
                                                    >
                                                        ✓ Ekle
                                                    </button>
                                                    <button
                                                        className="mui-btn mui-btn-outlined"
                                                        onClick={cancelAddingAlternative}
                                                    >
                                                        ✗ İptal
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                className="mui-add-alternative-cell-btn"
                                                onClick={() => startAddingAlternative(day, mealType.name)}
                                                title="Bu öğün için yeni bir alternatif menü ekle"
                                                style={{
                                                    borderColor: `${mealType.color}50`,
                                                    color: mealType.color,
                                                }}
                                            >
                                                + Alternatif Ekle
                                            </button>
                                        )}
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Yeni Öğün ekle butonu - tablonun dışına alındı */}
            <div className="mui-add-meal-section">
                {showAddMeal ? (
                    <div className="mui-add-meal-type-container">
                        <div className="mui-add-meal-type-form mui-dialog">
                            <div className="mui-dialog-header">
                                <h4 className="mui-dialog-title">Yeni Öğün Ekle</h4>
                                <button
                                    className="mui-dialog-close-btn"
                                    onClick={() => {
                                        setShowAddMeal(false);
                                        setEditedMealName('');
                                    }}
                                    aria-label="Kapat"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="mui-dialog-content">
                                <div className="mui-meal-form-field">
                                    <label htmlFor="new-meal-name" className="mui-input-label">Öğün Adı</label>
                                    <div className="mui-input-container">
                                        <input
                                            id="new-meal-name"
                                            type="text"
                                            className="mui-text-input"
                                            placeholder="Öğün adını girin..."
                                            value={editedMealName}
                                            onChange={(e) => setEditedMealName(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="mui-meal-form-field">
                                    <label htmlFor="new-meal-time" className="mui-input-label">Öğün Saati</label>
                                    <div className="mui-input-container mui-time-picker-container">
                                        <span className="mui-input-icon">🕒</span>
                                        <input
                                            id="new-meal-time"
                                            type="time"
                                            className="mui-time-input"
                                            value={editedMealTime}
                                            onChange={(e) => setEditedMealTime(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mui-dialog-actions">
                                <button
                                    className="mui-btn mui-btn-text"
                                    onClick={() => {
                                        setShowAddMeal(false);
                                        setEditedMealName('');
                                        setEditedMealTime('');
                                    }}
                                >
                                    İptal
                                </button>
                                <button
                                    className="mui-btn mui-btn-contained mui-btn-primary"
                                    onClick={() => {
                                        if (editedMealName.trim()) {
                                            const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
                                            const newMealType = {
                                                id: `new-${Date.now()}`,
                                                name: editedMealName.trim(),
                                                color: randomColor,
                                                order: mealTypes.length,
                                                time: editedMealTime
                                            };
                                            addMealType(newMealType);
                                            setEditedMealName('');
                                            setEditedMealTime('');
                                            setShowAddMeal(false);
                                        }
                                    }}
                                    disabled={!editedMealName.trim()}
                                >
                                    Kaydet
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button
                        className="mui-modern-add-meal-btn"
                        onClick={() => setShowAddMeal(true)}
                    >
                        <span className="mui-modern-add-icon">+</span>
                        <span>Öğün Ekle</span>
                    </button>
                )}
            </div>

            {/* Kaydet/İptal butonlarını bileşen içine taşıdım */}
            <div className="mui-editor-actions">
                <button
                    className="mui-btn mui-btn-outlined mui-cancel-action-btn"
                    onClick={onCancel}
                >
                    İptal
                </button>
                <button
                    className="mui-btn mui-btn-contained mui-save-action-btn"
                    onClick={() => saveMealPlan()}
                    disabled={isSaving}
                >
                    {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>
        </div>
    );
};

export default MealPlanEditor;
