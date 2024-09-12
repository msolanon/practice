const user = require("../models/user");
const jwt = require("jsonwebtoken");

class AuthenticationController {
    async verify(req, res, next) {
        try {
            const bearerHeader = req.headers['authorization'];
            if (bearerHeader !== undefined) {
                console.log('entré')
                const bearerToken = bearerHeader.split(" ")[1];
                console.log(bearerToken);
                jwt.verify(bearerToken, 'secretkey', (err, authData) => {
                    if (err) {
                        res.sendStatus(403)
                    } else {
                        res.json({
                            message: 'Post Created',
                            authData
                        })
                    }
                })
            }
        } catch (err) {
            res.status(500).send({
                message:
                    err.message || "Error authenticating user"
            });
        }
    };

    async signin(req, res) {
        try {
            jwt.sign({ user: user }, 'secretkey', (err, token) => {
                res.json({
                    token
                })
            });
        } catch (err) {
            res.status(500).send({
                message:
                    err.message || "Error authenticating user"
            });
        }
    };

    async verifyToken(req, res, next) {
        const bearerHeader = req.headers['authorization'];
        console.log(bearerHeader, 'soy prueba')
        if (bearerHeader !== undefined) {
            console.log('entré')
            const bearerToken = bearerHeader.split(" ")[1];
            req.token = bearerToken;
            this.verify()
            next();
        } else {
            res.sendStatus(403);
        }
    }
}

module.exports = new AuthenticationController();