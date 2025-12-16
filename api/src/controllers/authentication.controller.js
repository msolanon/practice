const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { privateKey } = require("../privateKey");
const CryptoUtils = require("../utils/CryptoUtils");

class AuthenticationController {
    async signin(req, res) {
        try {
            const decryptData = JSON.parse(CryptoUtils.decrypt(privateKey, req.body.data));
            console.log('Datos desencriptados en signin:', decryptData);
            const { cedula, password } = decryptData.data;
            if (cedula && password) {
                const identity = await User.findOne({ cedula });
                if (identity && identity['_id'] && identity['estado']) {
                    identity.comparePassword(password, function (err, isMatch) {
                        if (err) throw err;
                        if (isMatch) {
                            let payload = { "id": identity['_id'], "colegio": identity['colegio'], 'nombre': identity['nombreCompleto'], 'role': identity['isAdmin'] };

                            jwt.sign(payload, 'secret', (err, token) => {
                                const encryptedData = CryptoUtils.encrypt(privateKey, token);
                                console.log('Token encriptado en signin:', encryptedData);
                                res.json({
                                    token: encryptedData
                                })
                            });
                        } else {
                            res.status(500).send({
                                message: "La contraseña no coincide"
                            });
                        }
                    });
                } else {
                    throw Error;
                }
            }
        } catch (err) {
            res.status(500).send({
                message:
                    err.message || "Error autenticando usuario"
            });
        }
    }
}
module.exports = new AuthenticationController();