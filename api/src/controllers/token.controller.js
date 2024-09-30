const jwt = require("jsonwebtoken");
const user = require("../models/user");

class TokenController {

    async verifyToken(req, res, next) {
        try {
            const bearerHeader = req.headers['authorization'];
            if (bearerHeader !== undefined) {
                const bearerToken = bearerHeader.split(" ")[1];
                jwt.verify(bearerToken, 'secret', (err, authData) => {
                    if (err) {
                        res.sendStatus(403)
                    } else {
                        next();
                    }
                })
            }
        } catch (err) {
            res.status(403).send({
                message:
                    err.message || "Usuario no autorizado"
            });
        }
    }

    async getUserIdByToken(req, res, next) {
        const bearerHeader = req.headers['authorization'];
        const bearerToken = bearerHeader.split(" ")[1];
        let decoded = '';
        let identity;
        try {
            decoded = await jwt.verify(bearerToken, 'secret')
            identity = await user.findById(decoded.id);
            return identity
        } catch (error) {
            res.status(403).send({
                message: "Usuario no encontrado"
            });
        }
    }
}

module.exports = new TokenController();