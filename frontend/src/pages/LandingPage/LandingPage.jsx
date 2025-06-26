import React from "react";
import "./LandingPage.css";

export default function LandingPage() {
    return (
        <div className="landing-page-container">
            <iframe
<<<<<<< prod_to_main
                src="/landingpage/index.html?version=1.0.3"
=======
                src="/landingpage/index.html?version=1.0.2"
>>>>>>> main
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