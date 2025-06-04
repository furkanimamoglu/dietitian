import React, { useState } from 'react';
import './MealPlanEditor.css';

const MealPlanEditor = () => {
    const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const mealTypes = [
        { name: 'Sabah', color: '#FFC107', icon: '🌅' },
        { name: 'Öğle', color: '#FF9800', icon: '☀️' },
        { name: 'Akşam', color: '#9C27B0', icon: '🌙' },
        { name: 'Aperatif', color: '#E91E63', icon: '🥂' }
    ];

    // Meal plan state with alternatives
    const [mealPlan, setMealPlan] = useState(() => {
        const initialPlan = {};
        days.forEach(day => {
            initialPlan[day] = {};
            mealTypes.forEach(meal => {
                initialPlan[day][meal.name] = {
                    'Ana Menü': [],
                    'Alternatif 1': [],
                    'Alternatif 2': []
                };
            });
        });
        return initialPlan;
    });

    const [editingCell, setEditingCell] = useState(null);
    const [newMealInput, setNewMealInput] = useState('');
    const [selectedAlternative, setSelectedAlternative] = useState('Ana Menü');

    const alternativeOptions = ['Ana Menü', 'Alternatif 1', 'Alternatif 2'];

    // Add new meal to specific alternative
    const addMeal = (day, mealType, alternative, mealText) => {
        if (mealText && mealText.trim()) {
            setMealPlan(prev => ({
                ...prev,
                [day]: {
                    ...prev[day],
                    [mealType]: {
                        ...prev[day][mealType],
                        [alternative]: [...prev[day][mealType][alternative], mealText.trim()]
                    }
                }
            }));
            setNewMealInput('');
            setEditingCell(null);
        }
    };

    // Remove meal from specific alternative
    const removeMeal = (day, mealType, alternative, index) => {
        setMealPlan(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [mealType]: {
                    ...prev[day][mealType],
                    [alternative]: prev[day][mealType][alternative].filter((_, i) => i !== index)
                }
            }
        }));
    };

    // Start editing for a specific alternative
    const startEditing = (day, mealType, alternative) => {
        setEditingCell(`${day}-${mealType}-${alternative}`);
        setNewMealInput('');
        setSelectedAlternative(alternative);
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingCell(null);
        setNewMealInput('');
        setSelectedAlternative('Ana Menü');
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
                                <span className="mui-header-icon">🍽️</span>
                                <span>Öğün / Gün</span>
                            </div>
                        </th>
                        {days.map(day => (
                            <th key={day} className="mui-table-header-cell mui-day-header">
                                {day}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {mealTypes.map((mealType, index) => (
                        <tr key={mealType.name} className={`mui-meal-row ${index % 2 === 0 ? 'mui-even-row' : 'mui-odd-row'}`}>
                            <td className="mui-meal-type-cell mui-sticky-cell">
                                <div className="mui-meal-type-content">
                                    <div
                                        className="mui-meal-type-indicator"
                                        style={{ backgroundColor: mealType.color }}
                                    />
                                    <span className="mui-meal-type-name">
                      {mealType.icon} {mealType.name}
                    </span>
                                </div>
                            </td>
                            {days.map(day => (
                                <td key={`${day}-${mealType.name}`} className="mui-meal-cell">
                                    <div className="mui-meal-cell-content">
                                        {/* Alternative Sections */}
                                        {alternativeOptions.map(alternative => (
                                            <div key={alternative} className="mui-alternative-section">
                                                <div className="mui-alternative-header">
                                                    <span className="mui-alternative-title">{alternative}</span>
                                                    <span className="mui-alternative-count">
                              ({mealPlan[day][mealType.name][alternative].length})
                            </span>
                                                </div>

                                                {/* Existing meals for this alternative */}
                                                <div className="mui-meals-list">
                                                    {mealPlan[day][mealType.name][alternative].map((meal, mealIndex) => (
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
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Statistics Cards */}
            <div className="mui-statistics-section">
                <h3 className="mui-statistics-title">
                    Öğün İstatistikleri
                </h3>
                <div className="mui-statistics-grid">
                    {mealTypes.map(mealType => {
                        const totalMeals = days.reduce((total, day) => {
                            return total + alternativeOptions.reduce((altTotal, alt) => {
                                return altTotal + mealPlan[day][mealType.name][alt].length;
                            }, 0);
                        }, 0);

                        const mainMeals = days.reduce((total, day) =>
                            total + mealPlan[day][mealType.name]['Ana Menü'].length, 0
                        );

                        const alternativeMeals = totalMeals - mainMeals;

                        return (
                            <div key={mealType.name} className="mui-statistics-card">
                                <div className="mui-statistics-card-content">
                                    <div className="mui-statistics-header">
                                        <div
                                            className="mui-statistics-icon"
                                            style={{ backgroundColor: mealType.color }}
                                        >
                                            {mealType.icon}
                                        </div>
                                        <span className="mui-statistics-meal-name">
                      {mealType.name}
                    </span>
                                    </div>
                                    <div className="mui-statistics-count">
                                        {totalMeals}
                                    </div>
                                    <div className="mui-statistics-breakdown">
                                        <div className="mui-stats-detail">Ana: {mainMeals}</div>
                                        <div className="mui-stats-detail">Alt: {alternativeMeals}</div>
                                    </div>
                                    <div className="mui-statistics-label">
                                        toplam öğün
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Save Button */}
            <div className="mui-save-section">
                <button
                    className="mui-save-program-btn"
                    onClick={() => console.log('Saving meal plan:', mealPlan)}
                >
                    💾 Programı Kaydet
                </button>
            </div>
        </div>
    );
};

export default MealPlanEditor;

