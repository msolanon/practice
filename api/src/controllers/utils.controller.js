const nodemailer = require('nodemailer');
const fs = require('fs');
const { mailTemplate } = require("./mailTemplate");
const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, ACCESS_TOKEN } = require('../config');


class UtilsController {
    async enviarCorreo(cedula, carne, correo, contrasena, nombre) {
        try {

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: 'cfiavotaciones@gmail.com',
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    refreshToken: REFRESH_TOKEN,
                    accessToken: ACCESS_TOKEN
                }
            });
            const variables = {
                cedula,
                carne,
                contrasena,
                nombre,
                uri: "https://www.sicop.go.cr/",//CAMBIAR
            }
            let htmlBody = mailTemplate;
            for (const [k, v] of Object.entries(variables)) {
                const re = new RegExp(`{{\\s*${k}\\s*}}`, 'g');
                htmlBody = htmlBody.replace(re, v || '');
            }
            await transporter.sendMail({
                from: '"Votaciones CFIA" <cfiavotaciones@gmail.com>',
                to: correo,
                subject: 'Credenciales - Votaciones Electrónicas del CFIA',
                html: htmlBody
            });

        } catch (err) {
            console.error(` Error al enviar correo:`, err.message);
        }
    };

    async addPassword() {
        const randomstring = Math.random().toString(36).substr(2, 8);
        return randomstring;
    }
}

module.exports = new UtilsController();

