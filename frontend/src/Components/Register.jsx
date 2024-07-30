import React, { useState } from 'react';
import './Register.css'
import config from "../config.js";

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        fetch(  config.apiUrl+"dietitian/register", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
                email: email,
                phone: phone
            }),
        })
            .then(data => {
                if (data) {
                    setMessage('Kayıt olma işlemi başarılı.');
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
        <div className="register-container">
            <form onSubmit={handleSubmit} className="register-form">
                <h2>Kayıt Ol</h2>
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
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label>Telefon Numarası:</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
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
                <button type="submit">Kayıt Ol</button>
            </form>
        </div>
    );
}

export default Register;