import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import Header from "../Header/Header.jsx";
import Navbar from "../Navbar/Navbar.jsx";
import Footer from "../Footer/Footer.jsx";
import {Box} from "@mui/material";
import axios from "axios";
import config from "../../config.js";

export default function Default(props) {
    const navigate = useNavigate();
    const [dietitianInfo, setDietitianInfo] = useState({});

    const getDietitianInfo = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${config[config.environment].apiUrl}/dietitian/getDietitianInfo`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token || ''
                }
            });
            if (response.data) {
                setDietitianInfo(response.data);
            }
        } catch (error) {
            console.error('Diyetisyen bilgisi alınamadı.', error);
        }
    };

    useEffect(() => {
        getDietitianInfo();
    }, []);

    useEffect(() => {
        if(dietitianInfo.subscription_type === "free") {
            navigate('/odeme');
        }
    }, [dietitianInfo]);

    return (
        <>
            <Header/>
            <Navbar/>
            <Box
                sx={{
                    flex: 1,
                    height: 'calc(100vh - 120px)',
                    overflowY: 'auto',
                    overflowX: 'auto',
                    padding: '1rem',
                    mt: {xs: '3rem', sm: '2rem'},
                    pb: '60px',
                }}
            >
                {props.children}
            </Box>
            <Footer/>
        </>
    );
};