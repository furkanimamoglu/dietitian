import React, { useState, useRef, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';

/**
 * Koşullu PDF oluşturan bileşen
 * PDF sadece kullanıcı butona tıkladığında oluşturulur ve otomatik indirilir
 */
const ConditionalPDFLink = ({ document, fileName, buttonClass, buttonTitle, children }) => {
    const [showPDF, setShowPDF] = useState(false);
    const downloadLinkRef = useRef(null);

    const handleClick = () => {
        setShowPDF(true);
    };

    useEffect(() => {
        if (showPDF && downloadLinkRef.current) {
            const checkAndClick = () => {
                const button = downloadLinkRef.current.querySelector('button');
                if (button && !button.disabled) {
                    button.click();
                } else {
                    setTimeout(checkAndClick, 100);
                }
            };

            setTimeout(checkAndClick, 100);
        }
    }, [showPDF]);

    return showPDF ? (
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
        <div
            className={buttonClass}
            title={buttonTitle}
            style={{cursor: 'pointer', display: 'inline-flex'}}
            onClick={handleClick}
        >
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
