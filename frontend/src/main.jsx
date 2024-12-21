import ReactDOM from 'react-dom/client';
import React from 'react';
import AppThemeProvider from './themes/AppThemeProvider';
import App from './App.jsx';
import './main.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AppThemeProvider>
            <App />
        </AppThemeProvider>
    </React.StrictMode>,
);