import React from 'react';
import Header from "../../components/Header/Header.jsx";
import Navbar from "../../components/Navbar/Navbar.jsx";
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import Default from "../../components/Layouts/Default.jsx";

const settings = {
    width: 200,
    height: 200,
    value: 60,
};

export default function Dashboard() {

    const myDiv = (<div style={{padding: '1rem', background: 'red'}}> my div </div>)

    return (
        <>
            <Default
                myDiv={myDiv}
            >


            <Navbar />
            <h1>Ana sayfa içeriği buraya gelecek</h1>
            <Gauge
                {...settings}
                cornerRadius="50%"
                sx={(theme) => ({
                    [`& .${gaugeClasses.valueText}`]: {
                        fontSize: 40,
                    },
                    [`& .${gaugeClasses.valueArc}`]: {
                        fill: '#52b202',
                    },
                    [`& .${gaugeClasses.referenceArc}`]: {
                        fill: theme.palette.text.disabled,
                    },
                })}
            />
            </Default>
        </>
    );
};