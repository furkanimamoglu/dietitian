import React from "react";
import "./LandingPage.css"; // İsterseniz LandingPage'e özel CSS'lerinizi buraya ekleyin

export default function LandingPage() {
    return (
        <div className="landing-page-container">
            <iframe
                src="/landingpage/index.html"
                title="Landing Page Content"
                style={{
                    width: '100%',
                    height: '100vh',
                    border: 'none',
                    overflowX: 'hidden',
                    overflowY: 'auto'
                }}
            ></iframe>
        </div>
    );
}