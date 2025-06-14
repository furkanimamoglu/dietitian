import React from "react";
import "./LandingPage.css";

export default function LandingPage() {
    return (
        <div className="landing-page-container">
            <iframe
                src="/landingpage/index.html?version=1.0.1"
                title="Landing Page Content"
                style={{
                    width: '100%',
                    height: '99vh',
                    border: 'none',
                    overflowX: 'hidden',
                    overflowY: 'auto'
                }}
            ></iframe>
        </div>
    );
}