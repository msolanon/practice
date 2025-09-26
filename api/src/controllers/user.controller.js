const { Web3, ETH_DATA_FORMAT } = require("web3");
const User = require("../models/user");
const Ganador = require("../models/ganador");
const mongoose = require("mongoose");
const tokenController = require("./token.controller");
const config = require("../config");
const web3 = new Web3(config.NODE_URL);
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const cargoController = require("./cargo.controller");
const utilsController = require('./utils.controller');
const ganadorController = require("./ganador.controller");


const CLIENT_ID = '';
const CLIENT_SECRET = '';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '';
const errorCodes = {
    11000: 'Usuarios duplicados'
}
// Configurar cliente OAuth2
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

class UserController {
    async userByColegio(req, res) {
        try {
            const { idColegio } = req.params;
            let data = [];
            if (idColegio) {
                data = await User.find(
                    { "colegio": new mongoose.Types.ObjectId(idColegio) },
                    { cedula: 1, isAdmin: 1, nombreCompleto: 1, carne: 1, carrera: 1, correo: 1, colegio: 1, estado: 1 }
                ).then(doc => {
                    return doc.map(member => {
                        const colegioArray = member.colegio;
                        const index = colegioArray.findIndex(c => c.equals(idColegio));

                        return {
                            _id: member['_id'],
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
                    err.message || "Error autenticando usuario"
            });
        }
    };

    async userByColegioEstado(idColegio) {
        let counter;
        counter = await User.countDocuments({
            $or: [
                { "colegio": new mongoose.Types.ObjectId(idColegio), "estado": true },
                { "empleado": true }
            ]
        });
        return counter
    }

    async userByGanadores(req, res) {
        try {
            const { idColegio, puestos, tipoVotacion, modalidad } = req.params;
            let data = [];
            if (idColegio && puestos && tipoVotacion, modalidad) {

                let query = {};
                if (modalidad === 'Junta Directiva del Colegio') {
                    let dataCargo = await cargoController.getCargo(tipoVotacion, [puestos])//Nombre del puesto por tipo de votación 
                    let ganadores = await ganadorController.getGanador(idColegio, dataCargo['_id']);//trae ganador del colegio con este puesto
                    query = {
                        "colegio": new mongoose.Types.ObjectId(idColegio),
                        "_id": { $nin: [new mongoose.Types.ObjectId(ganadores['userId'])] },
                        "estado": true
                    };
                    data = await User.find(query,
                        { cedula: 1, isAdmin: 1, nombreCompleto: 1, carne: 1, carrera: 1, correo: 1, colegio: 1, estado: 1 }
                    ).then(doc => {
                        return doc.map(member => {
                            // arreglo d colegios
                            const colegioArray = member.colegio;
                            const index = colegioArray.findIndex(c => c.equals(idColegio));
                            return {
                                _id: member['_id'],
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
                else if (tipoVotacion === 'Junta Directiva General' && modalidad === "Extraordinaria") {
                    let dataCargo = await cargoController.getTipoVotacion("Junta Directiva del Colegio");//Filtro por Tipo de Votación Junta Directiva del Colegio  
                    console.log(dataCargo)
                    const cargoId = dataCargo.map(member => new mongoose.Types.ObjectId((member['_id'])));
                    console.log(cargoId, "CargoId")
                    console.log('soy el colegio', idColegio)
                    data = await ganadorController.getGanadoresByColegioCargo(idColegio, cargoId);

                    console.log(data, 'im data');
                }
                else if (tipoVotacion === 'Junta Directiva General' && modalidad === "Ordinaria") {
                    const añoActual = new Date().getFullYear();
                    let puestosOrdinaria = [];
                    (añoActual % 2 === 0)
                        ? puestosOrdinaria = ['Presidente', 'Secretario', 'Vocal I', 'Fiscal']
                        : puestosOrdinaria = ['Vicepresidente', 'Tesorero', 'Vocal II'];

                    let dataCargo = await cargoController.getCargos("Junta Directiva del Colegio", puestosOrdinaria)//Filtro por Tipo de Votación Junta Directiva del Colegio  
                    console.log(dataCargo)
                    const cargoId = dataCargo.map(member => new mongoose.Types.ObjectId((member['_id'])));
                    console.log(cargoId, "CargoId")
                    console.log('soy el colegio', idColegio)

                    data = await ganadorController.getGanadoresByColegioCargo(idColegio, cargoId);
                    console.log(data, 'im data ORDINARIA');
                }
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
                    err.message || "Error autenticando usuario"
            });
        }
    };

    async agregarMiembro(req, res, next) {
        try {
            let data = [];
            let userLength = 0;
            // await UtilsController.enviarCorreo();
            let cuentas = await web3.eth.getAccounts();
            let usuarios = await User.find({ nombreCompleto: { $ne: "Voto en Blanco" } });
            if (usuarios) userLength = usuarios.length;

            try {
                if (req.body) {
                    for (let i = 0; i < req.body.length; i++, userLength++) {
                        let userPassword = await utilsController.addPassword();
                        console.log("passs", userPassword)
                        let userAccount = cuentas[userLength];
                        req.body[i] = { ...req.body[i], contrasena: userPassword, cuenta: userAccount }
                        console.log(req.body[i]);
                        let newUser = await User.create(req.body[i]);
                        data.push(newUser);
                    }
                }
                res.json({
                    message: 'Usuario creado',
                    response: data
                })
            } catch (error) {
                let message = '';
                JSON.stringify(error.code);
                if (error && error?.code) {
                    message = errorCodes[error.code];
                } else {
                    message = error.message;
                }
                res.status(500).send({
                    message
                });
            }

        } catch (err) {
            res.status(500).send({
                message:
                    err.message || "Error autenticando usuario"
            });
        }
    };

    async updateStatus(req, res, next) {
        try {
            const user = await tokenController.getUserIdByToken(req, res, next);
            if (user.isAdmin) {
                let data = {};
                const { estado } = req.body
                const { idUser } = req.params
                try {
                    if (estado !== undefined && idUser) {
                        data = await User.updateOne({
                            _id: new mongoose.Types.ObjectId(idUser)
                        }, {
                            estado
                        });
                    }
                    res.json({
                        message: 'Usuario actualizado',
                        response: data
                    })
                } catch (error) {
                    res.status(500).send({
                        message:
                            error.message
                    });
                }

            } else {
                res.status(500).send({
                    message:
                        "El usuario no posee permisos para crear una votacion"
                });
            }
        } catch (err) {
            res.status(500).send({
                message:
                    err.message || "Error autenticando usuario"
            });
        }

    }

    async updateCargo(req, res, next) {
        try {
            const user = await tokenController.getUserIdByToken(req, res, next);
            if (user.isAdmin) {
                let data = {};
                const { cargo } = req.body
                const { idUser } = req.params
                try {
                    if (cargo !== undefined && idUser) {
                        data = await User.updateOne({
                            _id: new mongoose.Types.ObjectId(idUser)
                        }, {
                            cargo
                        });
                    }
                    res.json({
                        message: 'Usuario actualizado',
                        response: data
                    })
                } catch (error) {
                    res.status(500).send({
                        message:
                            error.message
                    });
                }

            } else {
                res.status(500).send({
                    message:
                        "El usuario no posee permisos para crear una votacion"
                });
            }
        } catch (err) {
            res.status(500).send({
                message:
                    err.message || "Error autenticando usuario"
            });
        }

    }
    async getEmpleados(req, res, next) {
        const user = await tokenController.getUserIdByToken(req, res, next);
        let data;
        try {
            if (user && user.isAdmin) {
                // traer solo los empleados
                data = await User.find({ 'empleado': true })
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

module.exports = new UserController();