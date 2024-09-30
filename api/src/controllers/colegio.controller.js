const Colegio = require("../models/colegio");
const jwt = require("jsonwebtoken");
const tokenController = require("./token.controller");

class ColegioController {
    async agregarColegio(req, res, next) {
        try {
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

        } catch (err) {
            res.status(500).send({
                message:
                    err.message || "Error authenticating user"
            });
        }
    };

    async getColegios(req, res, next) {
        const user = await tokenController.getUserIdByToken(req, res, next);
        let data;
        try {
            // traer todos los colegios is usuario es admin
            if (user && user.isAdmin) {
                data = await Colegio.find();
            } else if (user) {
                // traer solo los colegios a los que pertenece si no es admin
                data = await Colegio.find({ '_id': user.colegio })
            }
            res.json({
                message: 'respuesta satisfactoria',
                response: data
            })
        } catch (error) {
            res.status(500).send({
                message:
                    err.message || "Error"
            });
        }

    }

}

module.exports = new ColegioController();