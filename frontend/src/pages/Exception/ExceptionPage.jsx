import React from 'react';
import './ExceptionPage.css';
import Header from "../../components/Header/Header.jsx";
import Navbar from "../../components/Navbar/Navbar.jsx";
import {green} from "@mui/material/colors";
import {Box, Paper} from "@mui/material";

export default function ExceptionPage(statusCode) {
    switch (statusCode) {
        case 400:
            return (
                <>
                    <Header/>
                    <Navbar/>
                    <Box
                        sx={{
                            height: "90vh",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: green[50],
                        }}
                    >
                        <Paper
                            elevation={3}
                            sx={{
                                padding: 4,
                                width: 300,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <h1>400 Bad Request</h1>
                            <p>The request could not be understood or was missing required parameters.</p>
                        </Paper>
                    </Box>
                </>
            );
        case 401:
            return (
                <>
                    <Header/>
                    <Navbar/>
                    <Box
                        sx={{
                            height: "100vh",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: green[50],
                        }}
                    >
                        <Paper
                            elevation={3}
                            sx={{
                                padding: 4,
                                width: 300,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <h1>401 Unauthorized</h1>
                            <p>You are not authorized to access this resource. Please log in.</p>
                        </Paper>
                    </Box>
                </>
            );
        case 403:
            return (
                <>
                    <Header/>
                    <Navbar/>
                    <Box
                        sx={{
                            height: "100vh",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: green[50],
                        }}
                    >
                        <Paper
                            elevation={3}
                            sx={{
                                padding: 4,
                                width: 300,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <h1>403 Forbidden</h1>
                            <p>You do not have permission to access this resource.</p>
                        </Paper>
                    </Box>
                </>
            );
        case 404:
            return (
                <>
                    <Navbar/>
                    <Box
                        sx={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: green[50],
                        }}
                    >
                        <Paper
                            elevation={3}
                            sx={{
                                padding: 4,
                                width: 300,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <h1>404 Not Found</h1>
                            <p>The page you are looking for could not be found.</p>
                        </Paper>
                    </Box>
                </>
            );
        case 500:
            return (
                <>
                    <Header/>
                    <Navbar/>
                    <Box
                        sx={{
                            height: "100vh",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: green[50],
                        }}
                    >
                        <Paper
                            elevation={3}
                            sx={{
                                padding: 4,
                                width: 300,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <h1>500 Internal Server Error</h1>
                            <p>An unexpected error occurred on the server. Please try again later.</p>
                        </Paper>
                    </Box>
                </>
            );
        case 502:
            return (
                <>
                    <Header/>
                    <Navbar/>
                    <Box
                        sx={{
                            height: "100vh",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: green[50],
                        }}
                    >
                        <Paper
                            elevation={3}
                            sx={{
                                padding: 4,
                                width: 300,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <h1>502 Bad Gateway</h1>
                            <p>The server received an invalid response from the upstream server.</p>
                        </Paper>
                    </Box>
                </>
            );
        case 503:
            return (
                <>
                    <Header/>
                    <Navbar/>
                    <Box
                        sx={{
                            height: "100vh",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: green[50],
                        }}
                    >
                        <Paper
                            elevation={3}
                            sx={{
                                padding: 4,
                                width: 300,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <h1>503 Service Unavailable</h1>
                            <p>The server is currently unavailable (overloaded or down). Please try again later.</p>
                        </Paper>
                    </Box>
                </>
            );
        case 504:
            return (
                <>
                    <Header/>
                    <Navbar/>
                    <Box
                        sx={{
                            height: "100vh",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: green[50],
                        }}
                    >
                        <Paper
                            elevation={3}
                            sx={{
                                padding: 4,
                                width: 300,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <h1>504 Gateway Timeout</h1>
                            <p>The server did not respond in time. Please try again later.</p>
                        </Paper>
                    </Box>
                </>
            );
        default:
            return (
                <>
                    <Header/>
                    <Navbar/>
                    <Box
                        sx={{
                            height: "100vh",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: green[50],
                        }}
                    >
                        <Paper
                            elevation={3}
                            sx={{
                                padding: 4,
                                width: 300,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <h1>{statusCode} Error</h1>
                            <p>An unexpected error occurred. Please try again later.</p>
                        </Paper>
                    </Box>
                </>
            );
    }
}
