import React from 'react';
import {Route, Routes} from 'react-router-dom';
import Dashboard from '../pages/Dashboard/Dashboard';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword.jsx";
import Danisanlarim from "../pages/Danisanlarim/Danisanlarim.jsx";
import ExceptionPage from "../pages/Exception/ExceptionPage.jsx";
import Randevularim from "../pages/Randevularim/Randevularim.jsx";
import Beslenme from "../pages/Beslenme/Beslenme.jsx";
import Danisan from "../pages/Danisan/Danisan.jsx";
import Tarifler from "../pages/Tarifler/Tarifler.jsx";
import Egzersizler from "../pages/Egzersizler/Egzersizler.jsx";
import Ayarlar from "../pages/Ayarlar/Ayarlar.jsx";
import Mesaj from "../pages/Mesaj/Mesaj.jsx";
import Finans from "../pages/Finans/Finans.jsx";
import LandingPage from "../pages/LandingPage/LandingPage.jsx";
import Odeme from "../pages/Odeme/Odeme.jsx";

export default function Routing() {
    return (
        <Routes>
            <Route path="/app/*" element={<LandingPage/>}/>
            {/* Diyetisyen Routes */}
            <Route path="/app/anasayfa/*" element={<Dashboard/>}/>
            <Route path="/app/ayarlar/*" element={<Ayarlar/>}/>
            <Route path="/app/danisanlarim/*" element={<Danisanlarim/>}/>
            <Route path="/app/danisan/:id" element={<Danisan/>}/>
            <Route path="/app/finans/*" element={<Finans/>}/>
            <Route path="/app/beslenme/*" element={<Beslenme/>}/>
            <Route path="/app/randevularim/*" element={<Randevularim/>}/>
            <Route path="/app/mesaj/*" element={<Mesaj/>}/>
            <Route path="/app/egzersiz/*" element={<Egzersizler/>}/>
            <Route path="/app/finans/*" element={<Egzersizler/>}/>
            <Route path="/app/tarif/*" element={<Tarifler/>}/>
            <Route path="/app/girisyap/*" element={<Login/>}/>
            <Route path="/app/kayitol/*" element={<Register/>}/>
            <Route path="/app/sifremiunuttum/*" element={<ForgotPassword/>}/>
            <Route path="/app/odeme/*" element={<Odeme/>}/>

            {/* Error Routes */}
            <Route path="/app/*" element={ExceptionPage(404)}/>
            <Route path="/app/400" element={ExceptionPage(400)}/>
            <Route path="/app/401" element={ExceptionPage(401)}/>
            <Route path="/app/403" element={ExceptionPage(403)}/>
            <Route path="/app/500" element={ExceptionPage(500)}/>
            <Route path="/app/502" element={ExceptionPage(502)}/>
            <Route path="/app/503" element={ExceptionPage(503)}/>
            <Route path="/app/504" element={ExceptionPage(504)}/>
        </Routes>
    );
}