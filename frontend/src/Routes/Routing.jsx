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

export default function Routing() {
    return (
        <Routes>
            {/* Diyetisyen Routes */}
                <Route path="/dashboard/*" element={<Dashboard/>}/>
                <Route path="/danisanlarim/*" element={<Danisanlarim/>}/>
                <Route path="/danisan/*" element={<Danisan/>}/>
                <Route path="/beslenme/*" element={<Beslenme/>}/>
                <Route path="/randevularim/*" element={<Randevularim/>}/>
                <Route path="/egzersiz/*" element={<Egzersizler/>}/>
                <Route path="/tarif/*" element={<Tarifler/>}/>
                <Route path="/login/*" element={<Login/>}/>
                <Route path="/register/*" element={<Register/>}/>
                <Route path="/forgotpassword/*" element={<ForgotPassword/>}/>

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