import React from 'react';

import Header from "../Header/Header.jsx";

export default function Default(props) {
    return (
        <>
            <Header />
            {props.children}
        </>
    );
};