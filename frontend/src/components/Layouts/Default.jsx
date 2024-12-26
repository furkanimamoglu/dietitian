import React from 'react';

import Header from "../Header/Header.jsx";
import Navbar from "../Navbar/Navbar.jsx";
import Footer from "../Footer/Footer.jsx";

export default function Default(props) {
    return (
        <>
            <Header/>
            <Navbar/>
            {props.children}
            <Footer/>
        </>
    );
};