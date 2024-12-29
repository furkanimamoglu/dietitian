import React from 'react';
import {Gauge, gaugeClasses} from '@mui/x-charts/Gauge';
import './Dashboard.css';
import Default from "../../components/Layouts/Default.jsx";

const settings = {
    width: 200,
    height: 200,
    value: 60,
};

export default function Dashboard() {


    return (
        <Default>
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
    );
};