const nodemailer = require('nodemailer');
const fs = require('fs');
const { mailTemplate } = require("./mailTemplate");
const { google } = require('googleapis');
const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN } = require('../config');


class UtilsController {
    async enviarCorreo(cedula, carne, correo, contrasena, nombre) {
        try {
            const oAuth2Client = new google.auth.OAuth2("900223720690-l0o1cclrig453d4hn9c2snjdimhd23u6.apps.googleusercontent.com", "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", "https://developers.google.com/oauthplayground");
            oAuth2Client.setCredentials({ refresh_token: "1//04gY6caL7NOUzCgYIARAAGAQSNwF-L9IrUIadloaJrjKK-NpntR_nLRGvnZEzJ_xn-V6bNXU-X9VERO1_wYF6XHjSqdn0afIBaOw" });

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: 'cfiavotaciones@gmail.com',
                    clientId: "900223720690-l0o1cclrig453d4hn9c2snjdimhd23u6.apps.googleusercontent.com",
                    clientSecret: "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",
                    refreshToken: "1//04gY6caL7NOUzCgYIARAAGAQSNwF-L9IrUIadloaJrjKK-NpntR_nLRGvnZEzJ_xn-V6bNXU-X9VERO1_wYF6XHjSqdn0afIBaOw",
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

