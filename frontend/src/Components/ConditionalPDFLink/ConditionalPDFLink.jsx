import React, { useState, useRef, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';

/**
 * Koşullu PDF oluşturan bileşen
 * PDF sadece kullanıcı butona tıkladığında oluşturulur ve otomatik indirilir
 */
const ConditionalPDFLink = ({ document, fileName, buttonClass, buttonTitle, children }) => {
    const [showPDF, setShowPDF] = useState(false);
    const downloadLinkRef = useRef(null);

    // PDF oluşturmayı tetikleyen fonksiyon
    const handleClick = () => {
        setShowPDF(true);
    };

    // PDF linkine otomatik tıklama için effect
    useEffect(() => {
        if (showPDF && downloadLinkRef.current) {
            const checkAndClick = () => {
                // PDF oluşturulduktan sonra indirme işlemini tetikle
                const button = downloadLinkRef.current.querySelector('button');
                if (button && !button.disabled) {
                    button.click();
                } else {
                    // Hala hazır değilse, biraz bekleyip tekrar dene
                    setTimeout(checkAndClick, 100);
                }
            };

            // PDF'in oluşturulması için kısa bir süre bekle
            setTimeout(checkAndClick, 100);
        }
    }, [showPDF]);

    return showPDF ? (
        // PDF oluşturmayı tetikleyen kullanıcı tıklaması sonrasında PDFDownloadLink gösteriliyor
        <div ref={downloadLinkRef} style={{ display: 'inline-block' }}>
            <PDFDownloadLink
                document={document}
                fileName={fileName}
                style={{textDecoration: 'none'}}
            >
                {children}
            </PDFDownloadLink>
        </div>
    ) : (
        // PDF oluşturma tetiklenmeden önce, children yapısını koruyarak buton gösteriliyor
        <div
            className={buttonClass}
            title={buttonTitle}
            style={{cursor: 'pointer', display: 'inline-flex'}}
            onClick={handleClick}
        >
            {/*
               Children içeriği, özellikle icon'u korumak için
               children fonksiyonuna "sahte" bir loading durumu gönderiyoruz
            */}
            {typeof children === 'function'
                ? children({
                    loading: false,
                    error: false,
                    blob: null,
                    url: null
                })
                : children
            }
        </div>
    );
};

export default ConditionalPDFLink;
