const User = require("../models/user");
const jwt = require("jsonwebtoken");

class AuthenticationController {
    async signin(req, res) {
        try {
            const { cedula, password } = req.body;
            let identity;
            if (cedula && password) {
                identity = await User.findOne({ "cedula": cedula, "password": password })
            }
            if (identity && identity['_id'] && identity['estado']) {
                let payload = { "id": identity['_id'], "colegio": identity['colegio'], 'nombre': identity['nombreCompleto'], 'role': identity['isAdmin'] };
                jwt.sign(payload, 'secret', (err, token) => {
                    res.json({
                        token
                    })
                });
            } else {
                throw Error;
            }
        } catch (err) {
            res.status(500).send({
                message:
                    err.message || "Error autenticando usuario"
            });
        }
    };
}

module.exports = new AuthenticationController();