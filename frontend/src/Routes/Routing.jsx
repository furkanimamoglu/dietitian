import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Clients from '../pages/Clients/Clients';
import Dashboard from '../pages/Dashboard/Dashboard';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';

function Routing() {
    return (
        <Routes>
            <Route path="*" element={<Dashboard />} />
            <Route path="/login/*" element={<Login />} />
            <Route path="/register/*" element={<Register />} />
            <Route path="/clients/*" element={<Clients />} />
        </Routes>
    );
}

export default Routing;