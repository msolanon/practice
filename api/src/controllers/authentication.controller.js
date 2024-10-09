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
            if (identity && identity['_id']) {
                let payload = { "id": identity['_id'] };
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
                    err.message || "Error authenticating user"
            });
        }
    };
}

module.exports = new AuthenticationController();