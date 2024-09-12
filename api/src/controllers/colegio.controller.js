const colegio = require("../models/colegio");
const jwt = require("jsonwebtoken");

class ColegioController {
    async agregarColegio(req, res, next) {
        try {
            const bearerHeader = req.headers['authorization'];
            if (bearerHeader !== undefined) {
                const bearerToken = bearerHeader.split(" ")[1];;
                jwt.verify(bearerToken, 'secretkey', async (err, authData) => {
                    if (err) {
                        res.sendStatus(403)
                    } else {
                        let data = {};
                        try {
                            if (req.body) {
                                data = await colegio.create(req.body);
                            }
                            res.json({
                                message: 'Colegio creado',
                                response: data
                            })
                        } catch (error) {
                            res.status(500).send({
                                message:
                                    error.message
                            });
                        }

                    }
                })
            } else {
                res.status(500).send({
                    message: "Error authenticating user"
                });
            }
        } catch (err) {
            console.log('Here error');
            res.status(500).send({
                message:
                    err.message || "Error authenticating user"
            });
        }
    };
}

module.exports = new ColegioController();