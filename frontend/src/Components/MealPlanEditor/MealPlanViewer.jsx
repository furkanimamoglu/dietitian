import React, { useState } from 'react';
import './MealPlanEditor.css';

/**
 * MealPlanViewer - Salt okunur beslenme planı görüntüleyici bileşeni
 * MealPlanEditor'ün görsel özelliklerini korur ancak düzenleme işlevselliği yoktur
 */
const MealPlanViewer = ({ mealPlan, title, description }) => {
    // Sabitleri tanımla
    const DAYS_OF_WEEK = [
        "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"
    ];

    // Tabloda gösterilen gün
    const [selectedDay, setSelectedDay] = useState(DAYS_OF_WEEK[0]);

    // Bir öğünün tüm yemek öğelerini düz bir dizi olarak döndüren yardımcı fonksiyon
    const getMealItemsArray = (mealData) => {
        if (!mealData) return [];

        // Diziyse direkt döndür
        if (Array.isArray(mealData)) {
            return [...mealData];
        }

        // Karmaşık format - ana öğünler ve alternatiflerle
        if (mealData.main && Array.isArray(mealData.main)) {
            return [...mealData.main];
        }

        // String formatı (geriye dönük uyumluluk)
        if (typeof mealData === 'string') {
            return mealData.split(',').map(item => item.trim()).filter(item => item !== '');
        }

        return [];
    };

    // Bir öğünün alternatiflerini döndüren yardımcı fonksiyon
    const getMealAlternatives = (mealData, mainItem) => {
        if (!mealData || typeof mealData !== 'object' || Array.isArray(mealData) || !mealData.alternatives) {
            return [];
        }

        return mealData.alternatives[mainItem] || [];
    };

    // Bir günde bulunan tüm öğünleri döndüren yardımcı fonksiyon
    const getMealTypesForDay = (day) => {
        if (!mealPlan || !mealPlan[day]) return [];
        return Object.keys(mealPlan[day]);
    };

    // Eski formatı destekleme (geriye dönük uyumluluk) için
    const normalizeMealItem = (item) => {
        // Eğer item bir nesne ise ve name özelliği varsa, yeni format olarak kabul et
        if (item && typeof item === 'object' && item.name) {
            return item;
        }

        // Eğer string ise, porsiyon bilgisini ayrıştır ve yeni formata çevir
        if (typeof item === 'string') {
            const parts = item.split(':');
            if (parts.length > 1) {
                return {
                    name: parts[0].trim(),
                    portion: parts.slice(1).join(':').trim()
                };
            }
            return {
                name: item.trim(),
                portion: null
            };
        }

        // Geçersiz veya boş değerse boş nesne döndür
        return { name: '', portion: null };
    };

    return (
        <div className="mui-meal-plan-container">
            {/* Başlık ve Açıklama */}
            {(title || description) && (
                <div className="mui-meal-plan-header">
                    {title && <h2 className="mui-meal-plan-title">{title}</h2>}
                    {description && <p className="mui-meal-plan-subtitle">{description}</p>}
                </div>
            )}

            {/* Tablo Kapsayıcı */}
            <div className="mui-table-container">
                <table className="mui-meal-plan-table">
                    <thead>
                        <tr>
                            {/* Boş köşe hücresi */}
                            <th className="mui-table-header-cell mui-sticky-cell">
                                <div className="mui-header-content">
                                    Öğünler
                                </div>
                            </th>

                            {/* Günler - Sütun Başlıkları */}
                            {DAYS_OF_WEEK.map((day) => (
                                <th
                                    key={day}
                                    className={`mui-table-header-cell mui-day-header ${selectedDay === day ? 'active-day' : ''}`}
                                    onClick={() => setSelectedDay(day)}
                                >
                                    <div className="mui-day-header-content">
                                        {day}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Her öğün tipi için bir satır oluştur */}
                        {getMealTypesForDay(selectedDay).map((mealType, rowIndex) => (
                            <tr
                                key={mealType}
                                className={`mui-meal-row ${rowIndex % 2 === 0 ? 'mui-even-row' : 'mui-odd-row'}`}
                            >
                                {/* Öğün Adı Hücresi */}
                                <td className="mui-meal-type-cell mui-sticky-cell">
                                    <div className="mui-meal-type-content">
                                        <div
                                            className="mui-meal-type-indicator"
                                            style={{
                                                backgroundColor: mealType === "Kahvaltı" ? "#FF9800" :
                                                                 mealType === "Öğle Yemeği" ? "#4CAF50" :
                                                                 mealType === "Akşam Yemeği" ? "#2196F3" :
                                                                 "#9C27B0"
                                            }}
                                        ></div>
                                        <div className="mui-meal-type-name">
                                            {mealType}
                                        </div>
                                    </div>
                                </td>

                                {/* Her gün için o öğündeki yemekleri göster */}
                                {DAYS_OF_WEEK.map((day) => (
                                    <td key={`${day}-${mealType}`} className="mui-meal-cell">
                                        <div className="mui-meal-cell-content">
                                            <div className="mui-meals-list">
                                                {/* Ana yemek öğelerini göster */}
                                                {mealPlan && mealPlan[day] && mealPlan[day][mealType] ?
                                                    getMealItemsArray(mealPlan[day][mealType]).map((item, index) => {
                                                        const normalizedItem = normalizeMealItem(item);
                                                        return (
                                                            <div key={index} className="mui-meal-item-wrapper">
                                                                <div
                                                                    className="mui-meal-chip"
                                                                    style={{
                                                                        borderColor: mealType === "Kahvaltı" ? "#FF9800" :
                                                                                    mealType === "Öğle Yemeği" ? "#4CAF50" :
                                                                                    mealType === "Akşam Yemeği" ? "#2196F3" :
                                                                                    "#9C27B0",
                                                                        backgroundColor: "white"
                                                                    }}
                                                                >
                                                                    <span className="mui-chip-label">{normalizedItem.name}</span>
                                                                    {normalizedItem.portion && (
                                                                        <span className="mui-portion-label">
                                                                            {normalizedItem.portion}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Alternatifler */}
                                                                {mealPlan[day][mealType] && typeof mealPlan[day][mealType] === 'object' &&
                                                                !Array.isArray(mealPlan[day][mealType]) &&
                                                                mealPlan[day][mealType].alternatives &&
                                                                mealPlan[day][mealType].alternatives[item] && (
                                                                    <div style={{ marginLeft: '15px', marginTop: '4px', marginBottom: '8px' }}>
                                                                        {getMealAlternatives(mealPlan[day][mealType], item).map((alt, altIndex) => {
                                                                            const normalizedAlt = normalizeMealItem(alt);
                                                                            return (
                                                                                <div
                                                                                    key={altIndex}
                                                                                    className="mui-meal-chip"
                                                                                    style={{
                                                                                        borderColor: '#FF9E80',
                                                                                        backgroundColor: '#FFF8E1',
                                                                                        fontSize: '0.8rem',
                                                                                        margin: '2px 0'
                                                                                    }}
                                                                                >
                                                                                    <i style={{ fontSize: '0.75rem', marginRight: '5px', color: '#757575' }}>
                                                                                        alternatif:
                                                                                    </i>
                                                                                    <span className="mui-chip-label">{normalizedAlt.name}</span>
                                                                                    {normalizedAlt.portion && (
                                                                                        <span className="mui-portion-label">
                                                                                            {normalizedAlt.portion}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    }) : (
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            height: '100%',
                                                            color: '#aaa',
                                                            fontStyle: 'italic',
                                                            fontSize: '0.9rem'
                                                        }}>
                                                            Öğün içeriği girilmemiş
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MealPlanViewer;
