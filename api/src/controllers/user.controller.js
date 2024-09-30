const User = require("../models/user");
const mongoose = require("mongoose");


class UserController {
    async userByColegio(req, res) {
        try {
            const { idColegio } = req.params;
            let data = [];
            if (idColegio) {
                data = await User.find({ "colegio": new mongoose.Types.ObjectId(idColegio) },
                    { cedula: 1, isAdmin: 1, nombreCompleto: 1, carrera: 1, correo: 1 })
                    .then(doc => doc)
            }
            if (data.length > 0) {
                res.json({
                    message: 'respuesta satisfactoria',
                    response: data
                })
            } else {
                throw Error('No existen usuarios asociados a ese colegio');
            }
        } catch (err) {
            res.status(500).send({
                message:
                    err.message || "Error authenticating user"
            });
        }
    };


}

module.exports = new UserController();