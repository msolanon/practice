const User = require("../models/user");
const mongoose = require("mongoose");


class UserController {
    async userByColegio(req, res) {
        try {
            const { idColegio } = req.params;
            let data = [];
            if (idColegio) {
                data = await User.find(
                    { "colegio": new mongoose.Types.ObjectId(idColegio) },
                    { cedula: 1, isAdmin: 1, nombreCompleto: 1, carne: 1, carrera: 1, correo: 1, colegio:1 , estado:1}
                ).then(doc => {
                    return doc.map(member => {
                        const colegioArray = member.colegio;
                        const index = colegioArray.findIndex(c => c.equals(idColegio));
            
                        return {
                            cedula: member.cedula,
                            isAdmin: member.isAdmin,
                            nombreCompleto: member.nombreCompleto,
                            carne: index !== -1 && member.carne[index] ? member.carne[index] : null, 
                            carrera: member.carrera,
                            correo: member.correo,
                            colegioIndex: index,
                            estado: member.estado
                        };
                    });
                });
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

    async agregarMiembro(req, res, next) {
        try {
            let data = {};
            try {
                if (req.body) {
                    data = await User.create(req.body);
                }
                res.json({
                    message: 'Usuario creado',
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

}

module.exports = new UserController();