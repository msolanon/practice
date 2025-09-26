const nodemailer = require('nodemailer');


class UtilsController {
    async enviarCorreo() {
        try {
            const accessToken = await oAuth2Client.getAccessToken();

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: 'cfiavotaciones@gmail.com',
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    refreshToken: REFRESH_TOKEN,
                    accessToken: accessToken.token
                }
            });

            const info = {
                from: '"Votaciones CFIA" <cfiavotaciones@gmail.com>',
                to: "valeriabmonge24@gmail.com",
                subject: "Hello ",
                text: "Hello world?", // plain‑text body
                html: "<b>Hello world?</b>", // HTML body
            }

            const result = await transporter.sendMail(info);

        } catch (err) {
            console.error(` Error al enviar correo:`, err.message);
        }
    };

    async addPassword() {
        const randomstring = Math.random().toString(36).substr(2, 8);
        // const usuarioPrueba = {
        //     nombreCompleto: 'Prueba',
        //     cedula: '1234567',
        //     carne: '1234',
        //     estado: true,
        //     correo: 'msolanon1994@gmail.com',
        //     empleado: true,
        //     contrasena: randomstring,
        //     cuenta:'0xdCDA1d86EEc918D653F3A2F30E037E1c264f46F9',
        //     isAdmin: true
        // };
        return randomstring;
    }
}

module.exports = new UtilsController();

