import React from 'react';

import Footer from "../Footer/Footer.jsx";

export default function DefaultWithFooter(props) {
    return (
        <>
            {props.children}
            <Footer/>
        </>
    );
};