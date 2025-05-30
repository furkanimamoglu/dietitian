const nodemailer = require("nodemailer");
const axios = require("axios");

async function sendTestMail() {
    let transporter = nodemailer.createTransport({
        host: "mail.diyetia.com",
        port: 587,
        secure: false,
        auth: {
            user: "destek",
            pass: "!6129Furkan",
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    let info = await transporter.sendMail({
        from: '"Diyetia Destek" <destek@diyetia.com>',
        to: "slj5s.test@inbox.testmail.app",
        subject: "Test Maili - Diyetia",
        text: "Merhaba, bu mail nodemailer ile test amaçlı gönderildi.",
    });

    console.log("Mail gönderildi: %s", info.messageId);

    const res = await axios.get('https://api.testmail.app/api/json', {
        params: {
            apikey: '3a43fe57-0b60-41f6-b2f5-bf1520d7ce04',
            namespace: 'slj5s'
        }
    });

    console.log("Testmail API yanıtı:", res.data.emails);
}

sendTestMail().catch(console.error);
