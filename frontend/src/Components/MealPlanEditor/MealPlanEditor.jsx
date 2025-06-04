import React, { useState } from 'react';
import './MealPlanEditor.css';

const MealPlanEditor = ({ onSave, onCancel, isSaving }) => {  // Props ekledim
    const defaultDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const defaultMealTypes = [
        { id: '1', name: 'Sabah', color: '#FFC107', order: 0 },
        { id: '2', name: 'Öğle', color: '#FF9800', order: 1 },
        { id: '3', name: 'Akşam', color: '#9C27B0', order: 2 },
        { id: '4', name: 'Aperatif', color: '#E91E63', order: 3 }
    ];

    // Her hücre içindeki ana menü
    const defaultMainMenu = 'Ana Menü';

    // Orijinal günlerin sırası için indeks haritası
    const dayOrderMap = Object.fromEntries(defaultDays.map((day, index) => [day, index]));

    // Aktif olan günler ve öğünler için state
    const [days, setDays] = useState([...defaultDays]);
    const [mealTypes, setMealTypes] = useState([...defaultMealTypes]);

    // Kullanılmayan günler ve öğünler için state
    const [unusedDays, setUnusedDays] = useState([]);
    const [unusedMealTypes, setUnusedMealTypes] = useState([]);

    // Yeni gün/öğün ekleme durumu için state
    const [showAddDay, setShowAddDay] = useState(false);
    const [showAddMeal, setShowAddMeal] = useState(false);

    // Öğün düzenleme için state
    const [editingMealType, setEditingMealType] = useState(null);
    const [editedMealName, setEditedMealName] = useState('');

    // Yeni alternatif ekleme için state
    const [editingCellAlternative, setEditingCellAlternative] = useState(null); // format: "day-mealType"
    const [newAlternativeName, setNewAlternativeName] = useState('');

    // Meal plan state - her hücre için birden fazla alternatif içerebilir
    const [mealPlan, setMealPlan] = useState(() => {
        const initialPlan = {};
        defaultDays.forEach(day => {
            initialPlan[day] = {};
            defaultMealTypes.forEach(meal => {
                initialPlan[day][meal.name] = {
                    [defaultMainMenu]: [] // Başlangıçta sadece Ana Menü var
                };
            });
        });
        return initialPlan;
    });

    // Alternatif listeleri - her hücre için ayrı alternatif listesi tutuyoruz
    const getAlternativesForCell = (day, mealType) => {
        if (mealPlan[day] && mealPlan[day][mealType]) {
            return Object.keys(mealPlan[day][mealType]);
        }
        return [defaultMainMenu];
    };

    // Gün silme fonksiyonu
    const removeDay = (dayToRemove) => {
        setDays(days.filter(day => day !== dayToRemove));
        setUnusedDays([...unusedDays, dayToRemove]);
    };

    // Öğün silme fonksiyonu
    const removeMealType = (mealTypeToRemove) => {
        setMealTypes(mealTypes.filter(meal => meal.id !== mealTypeToRemove.id));
        setUnusedMealTypes([...unusedMealTypes, mealTypeToRemove]);
    };

    // Gün ekleme fonksiyonu
    const addDay = (dayToAdd) => {
        // Mevcut günlere ekleme yaparken orijinal sırayı korumak için
        const newDaysArray = [...days, dayToAdd].sort((a, b) => dayOrderMap[a] - dayOrderMap[b]);
        setDays(newDaysArray);
        setUnusedDays(unusedDays.filter(day => day !== dayToAdd));
        setShowAddDay(false);

        // Yeni gün için öğün planlarını da oluştur
        setMealPlan(prev => {
            const updated = {...prev};
            updated[dayToAdd] = {};
            mealTypes.forEach(meal => {
                updated[dayToAdd][meal.name] = {
                    [defaultMainMenu]: [] // Başlangıçta sadece Ana Menü var
                };
            });
            return updated;
        });
    };

    // Öğün ekleme fonksiyonu
    const addMealType = (mealTypeToAdd) => {
        // Öğünleri order numarasına göre sıralayarak ekle
        const newMealTypes = [...mealTypes, mealTypeToAdd].sort((a, b) => a.order - b.order);
        setMealTypes(newMealTypes);
        setUnusedMealTypes(unusedMealTypes.filter(meal => meal.id !== mealTypeToAdd.id));
        setShowAddMeal(false);

        // Yeni öğun için tüm günlerdeki planlamayı güncelle
        setMealPlan(prev => {
            const updated = {...prev};
            days.forEach(day => {
                if (!updated[day]) updated[day] = {};
                updated[day][mealTypeToAdd.name] = {
                    [defaultMainMenu]: [] // Başlangıçta sadece Ana Menü var
                };
            });
            return updated;
        });
    };

    // Öğün adı düzenleme fonksiyonu
    const startEditingMealName = (mealType) => {
        setEditingMealType(mealType);
        setEditedMealName(mealType.name);
    };

    // Öğün adını kaydetme
    const saveMealName = () => {
        if (!editedMealName.trim()) return;

        const oldName = editingMealType.name;
        const newName = editedMealName.trim();

        // Öğün listesini güncelle
        setMealTypes(mealTypes.map(meal =>
            meal.id === editingMealType.id
                ? { ...meal, name: newName }
                : meal
        ));

        // Meal planı güncelle - öğün adı değiştiğinde
        setMealPlan(prev => {
            const updated = {...prev};
            days.forEach(day => {
                if (updated[day]) {
                    updated[day][newName] = {...prev[day][oldName]};
                    delete updated[day][oldName];
                }
            });
            return updated;
        });

        setEditingMealType(null);
        setEditedMealName('');
    };

    // Hücreye özel alternatif ekleme fonksiyonu
    const addCellAlternative = (day, mealType) => {
        if (!newAlternativeName.trim()) return;

        const alternativeName = newAlternativeName.trim();

        // Aynı isimli alternatif varsa ekleme
        const cellAlternatives = getAlternativesForCell(day, mealType);
        if (cellAlternatives.includes(alternativeName)) {
            setNewAlternativeName('');
            setEditingCellAlternative(null);
            return;
        }

        // Hücrenin alternatiflerini güncelle
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

    // Alternatif silme fonksiyonu
    const removeCellAlternative = (day, mealType, alternativeToRemove) => {
        // Ana Menü silinemez
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

    // Add new meal to specific alternative
    const addMeal = (day, mealType, alternative, mealText) => {
        if (!mealText || !mealText.trim()) {
            setNewMealInput('');
            setEditingCell(null);
            return;
        }

        setMealPlan(prev => {
            const updated = {...prev};
            if (!updated[day][mealType][alternative]) {
                updated[day][mealType][alternative] = [];
            }
            updated[day][mealType][alternative] = [...updated[day][mealType][alternative], mealText.trim()];
            return updated;
        });

        setNewMealInput('');
        setEditingCell(null);
    };

    // Remove meal from specific alternative
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

    // Start editing for a specific alternative
    const startEditing = (day, mealType, alternative) => {
        setEditingCell(`${day}-${mealType}-${alternative}`);
        setNewMealInput('');
    };

    // Start adding a new alternative
    const startAddingAlternative = (day, mealType) => {
        setEditingCellAlternative(`${day}-${mealType}`);
        setNewAlternativeName('');
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingCell(null);
        setNewMealInput('');
    };

    // Cancel adding alternative
    const cancelAddingAlternative = () => {
        setEditingCellAlternative(null);
        setNewAlternativeName('');
    };

    // Handle key press
    const handleKeyPress = (e, day, mealType, alternative) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addMeal(day, mealType, alternative, newMealInput);
        } else if (e.key === 'Escape') {
            cancelEditing();
        }
    };

    // Handle key press for alternative input
    const handleAlternativeKeyPress = (e, day, mealType) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCellAlternative(day, mealType);
        } else if (e.key === 'Escape') {
            cancelAddingAlternative();
        }
    };

    // Öğun ekleme fonksiyonu - yeni sürüm
    const addNewMealType = () => {
        // Yeni öğün için rastgele renk oluştur
        const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);

        // "Yeni Öğün" şeklinde isim ver
        const newName = `Yeni Öğün ${mealTypes.length + 1}`;

        // Yeni öğün oluştur
        const newMealType = {
            id: `new-${Date.now()}`,
            name: newName,
            color: randomColor,
            order: mealTypes.length
        };

        // Öğünü ekle
        const newMealTypes = [...mealTypes, newMealType].sort((a, b) => a.order - b.order);
        setMealTypes(newMealTypes);

        // Yeni öğun için tüm günlerdeki planlamayı güncelle
        setMealPlan(prev => {
            const updated = {...prev};
            days.forEach(day => {
                if (!updated[day]) updated[day] = {};
                updated[day][newName] = {
                    [defaultMainMenu]: []
                };
            });
            return updated;
        });

        // Öğün eklendikten sonra düzenleme moduna geç
        setTimeout(() => {
            startEditingMealName(newMealType);
        }, 100);
    }

    return (
        <div className="mui-meal-plan-container">
            {/* Header */}
            <div className="mui-meal-plan-header">
                <h2 className="mui-meal-plan-title">
                    Haftalık Beslenme Programı
                </h2>
                <p className="mui-meal-plan-subtitle">
                    Her gün için öğün planınızı düzenleyin
                </p>
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
                                <div className="mui-add-selector">
                                    <select
                                        className="mui-selector"
                                        onChange={(e) => e.target.value && addDay(e.target.value)}
                                        value=""
                                    >
                                        <option value="">Gün seçin...</option>
                                        {unusedDays.map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                    <button
                                        className="mui-cancel-btn"
                                        onClick={() => setShowAddDay(false)}
                                    >
                                        İptal
                                    </button>
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
                                            <input
                                                type="text"
                                                value={editedMealName}
                                                onChange={(e) => setEditedMealName(e.target.value)}
                                                className="mui-meal-input"
                                                autoFocus
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') saveMealName();
                                                    else if (e.key === 'Escape') setEditingMealType(null);
                                                }}
                                            />
                                            <div className="mui-form-actions">
                                                <button
                                                    className="mui-btn mui-btn-contained mui-btn-small"
                                                    onClick={saveMealName}
                                                    style={{ backgroundColor: mealType.color }}
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    className="mui-btn mui-btn-outlined mui-btn-small"
                                                    onClick={() => setEditingMealType(null)}
                                                >
                                                    ✗
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mui-meal-type-header">
                                            <span
                                                className="mui-meal-type-name"
                                                onClick={() => startEditingMealName(mealType)}
                                                title="Öğün adını düzenlemek için tıklayın"
                                            >
                                                {mealType.name}
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
                                                        <span className="mui-alternative-title">{alternative}</span>
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
                                                                <span className="mui-chip-label">{meal}</span>
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
                                                            <div className="mui-form-actions">
                                                                <button
                                                                    className="mui-btn mui-btn-contained"
                                                                    onClick={() => addMeal(day, mealType.name, alternative, newMealInput)}
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
                        <div className="mui-add-meal-type-form">
                            <button
                                className="mui-cancel-btn"
                                onClick={() => {
                                    setShowAddMeal(false);
                                    setEditedMealName('');
                                }}
                            >
                                ×
                            </button>
                            <h4>Yeni Öğün Ekle</h4>
                            <input
                                type="text"
                                className="mui-meal-input"
                                placeholder="Öğün adını girin..."
                                value={editedMealName}
                                onChange={(e) => setEditedMealName(e.target.value)}
                                autoFocus
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && editedMealName.trim()) {
                                        const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
                                        const newMealType = {
                                            id: `new-${Date.now()}`,
                                            name: editedMealName.trim(),
                                            color: randomColor,
                                            order: mealTypes.length
                                        };
                                        addMealType(newMealType);
                                        setEditedMealName('');
                                    }
                                }}
                            />
                            <div className="mui-form-actions">
                                <button
                                    className="mui-btn mui-btn-contained"
                                    onClick={() => {
                                        if (editedMealName.trim()) {
                                            const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
                                            const newMealType = {
                                                id: `new-${Date.now()}`,
                                                name: editedMealName.trim(),
                                                color: randomColor,
                                                order: mealTypes.length
                                            };
                                            addMealType(newMealType);
                                            setEditedMealName('');
                                        }
                                    }}
                                    disabled={!editedMealName.trim()}
                                >
                                    Ekle
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
                    onClick={() => {
                        // JSON formatında console.log'a yazdır
                        console.log('Beslenme Programı JSON:', JSON.stringify(mealPlan, null, 2));

                        // Normal kaydetme işlemini gerçekleştir
                        onSave(mealPlan);
                    }}
                    disabled={isSaving}
                >
                    {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>
        </div>
    );
};

export default MealPlanEditor;

