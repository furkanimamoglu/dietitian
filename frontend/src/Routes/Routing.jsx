import React from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';
import Dashboard from '../pages/Dietitian/Dashboard/Dashboard';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword.jsx";
import Danisanlarim from "../pages/Dietitian/Danisanlarim/Danisanlarim.jsx";
import ExceptionPage from "../pages/Exception/ExceptionPage.jsx";
import Randevularim from "../pages/Dietitian/Randevularim/Randevularim.jsx";
import Beslenme from "../pages/Dietitian/Beslenme/Beslenme.jsx";
import Danisan from "../pages/Dietitian/Danisan/Danisan.jsx";
import Tarifler from "../pages/Dietitian/Tarifler/Tarifler.jsx";
import Egzersizler from "../pages/Dietitian/Egzersizler/Egzersizler.jsx";
import Profil from "../pages/Dietitian/Profil/Profil.jsx";
import Ayarlar from "../pages/Dietitian/Ayarlar/Ayarlar.jsx";
import Mesaj from "../pages/Dietitian/Mesaj/Mesaj.jsx";
import ClientDashboard from "../pages/Client/ClientDashboard/ClientDashboard.jsx";

export default function Routing() {
    return (
        <Routes>
                {/* Diyetisyen Routes */}
                <Route path="/dashboard/*" element={<Dashboard/>}/>
                <Route path="/profil/*" element={<Profil/>}/>
                <Route path="/ayarlar/*" element={<Ayarlar/>}/>
                <Route path="/danisanlarim/*" element={<Danisanlarim/>}/>
                <Route path="/danisan/:id" element={<Danisan/>}/>
                <Route path="/beslenme/*" element={<Beslenme/>}/>
                <Route path="/randevularim/*" element={<Randevularim/>}/>
                <Route path="/mesaj/*" element={<Mesaj/>}/>
                <Route path="/egzersiz/*" element={<Egzersizler/>}/>
                <Route path="/finans/*" element={<Egzersizler/>}/>
                <Route path="/tarif/*" element={<Tarifler/>}/>
                <Route path="/login/*" element={<Login/>}/>
                <Route path="/register/*" element={<Register/>}/>
                <Route path="/forgotpassword/*" element={<ForgotPassword/>}/>

                {/* Danışan Routes */}
                <Route path="/client/dashboard/*" element={<ClientDashboard/>}/>

                {/* Error Routes */}
                <Route path="/*" element={ExceptionPage(404)}/>
                <Route path="/400" element={ExceptionPage(400)}/>
                <Route path="/401" element={ExceptionPage(401)}/>
                <Route path="/403" element={ExceptionPage(403)}/>
                <Route path="/500" element={ExceptionPage(500)}/>
                <Route path="/502" element={ExceptionPage(502)}/>
                <Route path="/503" element={ExceptionPage(503)}/>
                <Route path="/504" element={ExceptionPage(504)}/>
        </Routes>
    );
}