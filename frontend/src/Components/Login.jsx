import React, { useState } from 'react';
import './Login.css'
import config from "../config.js";

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        fetch(  config.apiUrl+"dietitian/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        })
            .then(data => {
                if (data.status) {
                    setMessage('Giriş başarılı!'+data.status);
                } else {
                    setMessage('Kullanıcı adı veya şifre yanlış.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                setMessage('Hata: Bir sorun oluştu, teknik ekip ile görüşün.');
            });
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Login</h2>
                {message && <p>{message}</p>}
                <div>
                    <label>Kullanıcı Adı:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label>Şifre:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit">Giriş Yap</button>
            </form>
        </div>
    );
}

export default Login;