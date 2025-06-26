import React, { useState } from 'react';
import './MealPlanEditor.css';

/**
 * MealPlanViewer - Salt okunur beslenme planı görüntüleyici bileşeni
 * MealPlanEditor'ün görsel özelliklerini korur ancak düzenleme işlevselliği yoktur
 */
const MealPlanViewer = ({ mealPlan, title, description, mealTypes }) => {
    // Sabitleri tanımla
    const DAYS_OF_WEEK = [
        "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"
    ];

    // Tabloda gösterilen gün
    const [selectedDay, setSelectedDay] = useState(DAYS_OF_WEEK[0]);

    // Her hücre içindeki ana menü
    const defaultMainMenu = 'Alternatif';

    // Bir öğünün alternatiflerini döndüren yardımcı fonksiyon
    const getAlternativesForCell = (day, mealType) => {
        if (!mealPlan || !mealPlan[day] || !mealPlan[day][mealType]) {
            return [defaultMainMenu];
        }

        // Object formatı - standardize edilmiş MealPlanEditor formatı
        if (typeof mealPlan[day][mealType] === 'object' && !Array.isArray(mealPlan[day][mealType])) {
            // Ana Menü formatı - her alternatif için ayrı liste
            if (!mealPlan[day][mealType].main) {
                // "info" dışındaki tüm anahtarları alternatif olarak döndür
                return Object.keys(mealPlan[day][mealType]).filter(key => key !== 'info');
            }
        }

        return [defaultMainMenu];
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

    // Çeşitli mealPlan formatlarını işleyebilmek için daha güçlü işleme fonksiyonu
    const processMealData = (day, mealType, alternative) => {
        if (!mealPlan || !mealPlan[day] || !mealPlan[day][mealType]) {
            return [];
        }

        const mealData = mealPlan[day][mealType];

        // 1. Standardize edilmiş MealPlanEditor formatı (her alternatif için ayrı liste)
        if (typeof mealData === 'object' && !Array.isArray(mealData) && !mealData.main) {
            // Belirtilen alternatif için yemek listesini döndür
            if (mealData[alternative]) {
                return Array.isArray(mealData[alternative]) ? [...mealData[alternative]] : [];
            }
            return [];
        }

        // 2. Array formatı - basit yemek listesi (Ana Menü için)
        if (Array.isArray(mealData) && alternative === defaultMainMenu) {
            return [...mealData];
        }

        // 3. String formatı - virgülle ayrılmış liste (Ana Menü için)
        if (typeof mealData === 'string' && alternative === defaultMainMenu) {
            return mealData.split(',').map(item => item.trim()).filter(item => item !== '');
        }

        // 4. Beslenme.jsx formatı (Ana Menü için main, alternatifler için alternatives içinden)
        if (typeof mealData === 'object' && !Array.isArray(mealData) && mealData.main) {
            if (alternative === defaultMainMenu) {
                return Array.isArray(mealData.main) ? [...mealData.main] : [];
            } else if (mealData.alternatives && mealData.alternatives[alternative]) {
                return Array.isArray(mealData.alternatives[alternative]) ?
                    [...mealData.alternatives[alternative]] : [];
            }
        }

        return [];
    };

    // Öğün saatini almak için yardımcı fonksiyon
    const getMealTime = (day, mealType) => {
        if (!mealPlan || !mealPlan[day] || !mealPlan[day][mealType]) {
            // Saat bilgisi mealPlan'da yoksa, meal type'dan almaya çalışalım
            const mealTypeObj = mealTypes ? mealTypes.find(m => m.name === mealType) : null;
            return mealTypeObj?.time || '';
        }

        // MealPlanEditor formatı (info objesi içinde time)
        if (mealPlan[day][mealType].info && mealPlan[day][mealType].info.time) {
            return mealPlan[day][mealType].info.time;
        }

        // Saat bilgisi mealPlan'da yoksa, meal type'dan almaya çalışalım
        const mealTypeObj = mealTypes ? mealTypes.find(m => m.name === mealType) : null;
        return mealTypeObj?.time || '';
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
                                            {getMealTime(selectedDay, mealType) && (
                                                <span className="mui-meal-time"> ({getMealTime(selectedDay, mealType)})</span>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* Her gün için o öğündeki yemekleri göster */}
                                {DAYS_OF_WEEK.map((day) => {
                                    // O gün ve öğün için alternatif listesini al
                                    const alternatives = getAlternativesForCell(day, mealType);

                                    return (
                                        <td key={`${day}-${mealType}`} className="mui-meal-cell">
                                            <div className="mui-meal-cell-content">
                                                {/* Alternatif Sekmeleri */}
                                                <div className="mui-alternatives-tabs">
                                                    {alternatives.map(alternative => {
                                                        // Her alternatif için yemek listesini al
                                                        const mealItems = processMealData(day, mealType, alternative);

                                                        return (
                                                            <div key={alternative} className="mui-alternative-section">
                                                                <div className="mui-alternative-header">
                                                                    <span className="mui-alternative-title">{alternative}</span>
                                                                    <span className="mui-alternative-count">
                                                                        ({mealItems.length || 0})
                                                                    </span>
                                                                </div>

                                                                {/* Yemekler Listesi */}
                                                                <div className="mui-meals-list">
                                                                    {mealItems.length > 0 ? (
                                                                        mealItems.map((item, itemIndex) => {
                                                                            const normalizedItem = normalizeMealItem(item);

                                                                            return (
                                                                                <div
                                                                                    key={itemIndex}
                                                                                    className="mui-meal-chip"
                                                                                    style={{
                                                                                        backgroundColor: alternative === defaultMainMenu ?
                                                                                            `${mealType === "Kahvaltı" ? "#FF980020" : 
                                                                                              mealType === "Öğle Yemeği" ? "#4CAF5020" :
                                                                                              mealType === "Akşam Yemeği" ? "#2196F320" : "#9C27B020"}` :
                                                                                            '#FFF8E1',
                                                                                        borderColor: alternative === defaultMainMenu ?
                                                                                            (mealType === "Kahvaltı" ? "#FF9800" :
                                                                                             mealType === "Öğle Yemeği" ? "#4CAF50" :
                                                                                             mealType === "Akşam Yemeği" ? "#2196F3" : "#9C27B0") :
                                                                                            '#FF9E80'
                                                                                    }}
                                                                                >
                                                                                    <span className="mui-chip-label">{normalizedItem.name}</span>
                                                                                    {normalizedItem.portion && (
                                                                                        <span className="mui-portion-label">
                                                                                            {normalizedItem.portion}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })
                                                                    ) : (
                                                                        <div style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            padding: '8px',
                                                                            color: '#aaa',
                                                                            fontStyle: 'italic',
                                                                            fontSize: '0.85rem'
                                                                        }}>
                                                                            Yemek girilmemiş
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MealPlanViewer;
