import React from 'react';
import './ExceptionPage.css';
import {green} from "@mui/material/colors";
import {Box, Paper} from "@mui/material";
import Default from "../../components/Layouts/Default.jsx";

export default function ExceptionPage(statusCode) {
    switch (statusCode) {
        case 400:
            return (
                <Default>
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
                                mt: 30,
                                mb: 30,
                                width: 600,
                                padding: 4,
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <h1>400 Bad Request</h1>
                            <p>The request could not be understood or was missing required parameters.</p>
                        </Paper>
                    </Box>
                </Default>
            );
        case 401:
            return (
                <Default>
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
                                mt: 30,
                                mb: 30,
                                width: 600,
                                padding: 4,
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <h1>401 Unauthorized</h1>
                            <p>You are not authorized to access this resource. Please log in.</p>
                        </Paper>
                    </Box>
                </Default>
            );
        case 403:
            return (
                <Default>
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
                                mt: 30,
                                mb: 30,
                                width: 600,
                                padding: 4,
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <h1>403 Forbidden</h1>
                            <p>You do not have permission to access this resource.</p>
                        </Paper>
                    </Box>
                    </Default>
            );
        case 404:
            return (
                <Default>
                    <Box
                        sx={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column"
                        }}
                    >
                        <Paper
                            elevation={3}
                            sx={{
                                mt: 30,
                                mb: 30,
                                width: 600,
                                padding: 4,
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <h1>404 Not Found</h1>
                            <p>The page you are looking for could not be found.</p>
                        </Paper>
                    </Box>
                </Default>
            );
        case 500:
            return (
                <Default>
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
                                mt: 30,
                                mb: 30,
                                width: 600,
                                padding: 4,
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <h1>500 Internal Server Error</h1>
                            <p>An unexpected error occurred on the server. Please try again later.</p>
                        </Paper>
                    </Box>
                </Default>
            );
        case 502:
            return (
                <Default>
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
                                mt: 30,
                                mb: 30,
                                width: 600,
                                padding: 4,
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <h1>502 Bad Gateway</h1>
                            <p>The server received an invalid response from the upstream server.</p>
                        </Paper>
                    </Box>
                </Default>
            );
        case 503:
            return (
                <Default>
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
                                mt: 30,
                                mb: 30,
                                width: 600,
                                padding: 4,
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <h1>503 Service Unavailable</h1>
                            <p>The server is currently unavailable (overloaded or down). Please try again later.</p>
                        </Paper>
                    </Box>
                </Default>
            );
        case 504:
            return (
                <Default>
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
                                mt: 30,
                                mb: 30,
                                width: 600,
                                padding: 4,
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <h1>504 Gateway Timeout</h1>
                            <p>The server did not respond in time. Please try again later.</p>
                        </Paper>
                    </Box>
                </Default>
            );
        default:
            return (
                <Default>
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
                                mt: 30,
                                mb: 30,
                                width: 600,
                                padding: 4,
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <h1>{statusCode} Error</h1>
                            <p>An unexpected error occurred. Please try again later.</p>
                        </Paper>
                    </Box>
                </Default>
            );
    }
}
