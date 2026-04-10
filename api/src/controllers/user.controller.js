const { Web3, ETH_DATA_FORMAT } = require("web3");
const User = require("../models/user");
const Ganador = require("../models/ganador");
const mongoose = require("mongoose");
const tokenController = require("./token.controller");
const config = require("../config");
const web3 = new Web3(config.NODE_URL);
const nodemailer = require('nodemailer');
const cargoController = require("./cargo.controller");
const utilsController = require('./utils.controller');
const ganadorController = require("./ganador.controller");
const { privateKey } = require("../privateKey");

const CryptoUtils = require("../utils/CryptoUtils");



const errorCodes = {
    11000: 'Usuarios duplicados'
}
// Configurar cliente OAuth2

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
                const encryptedData = CryptoUtils.encrypt(privateKey, JSON.stringify(data));
                res.json({
                    message: 'respuesta satisfactoria',
                    response: encryptedData
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

    async userByColegioEstado(colegioId) {
        let count;
        const data = await User.find({
            $or: [
                { "colegio": new mongoose.Types.ObjectId(colegioId) },
                { "empleado": true }
            ],
            $and: [{ "estado": true }]
        });
        if (data.length > 0) {
            count = data.length;
        }
        return count;
    }

    renderTemplate(tpl, variables = {}) {
        let html = tpl;
        for (const [k, v] of Object.entries(variables)) {
            const re = new RegExp('{{\\s*${k}\\s*}}', 'g');
            html = html.replace(re, v || '');
        }
        return html;
    }

    //dropdown para agregar votacion - Trae los q no han ganado
    async userByGanadores(req, res) {
        try {
            const { idColegio, puestos, tipoVotacion, modalidad } = req.params;
            let data = [];
            if (idColegio && puestos && tipoVotacion, modalidad) {

                let query = {};
                if (tipoVotacion === 'Junta Directiva del Colegio' || tipoVotacion === 'Asamblea de Representantes') {
                    let dataCargo = await cargoController.getCargo(tipoVotacion, [puestos])//Nombre del puesto por tipo de votación 
                    let ganadores = await ganadorController.getGanador(idColegio, dataCargo['_id']);//trae ganador del colegio con este puesto
                    query = {
                        "colegio": new mongoose.Types.ObjectId(idColegio),
                        "estado": true
                    };
                    if (ganadores && ganadores.length > 0) {
                        const ganadoresId = ganadores.map(ganador => ganador['userId']);
                        query["_id"] = { $nin: ganadoresId }
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
                    const cargoId = dataCargo.map(member => new mongoose.Types.ObjectId((member['_id'])));
                    data = await ganadorController.getGanadoresByColegioCargo(idColegio, cargoId);

                }
                else if (tipoVotacion === 'Junta Directiva General' && modalidad === "Ordinaria") {
                    const añoActual = new Date().getFullYear();
                    let puestosOrdinaria = [];
                    (añoActual % 2 === 0)
                        ? puestosOrdinaria = ['Presidente', 'Secretario', 'Vocal I', 'Fiscal']
                        : puestosOrdinaria = ['Vicepresidente', 'Tesorero', 'Vocal II'];

                    let dataCargo = await cargoController.getCargos("Junta Directiva del Colegio", puestosOrdinaria)//Filtro por Tipo de Votación Junta Directiva del Colegio  
                    const cargoId = dataCargo.map(member => new mongoose.Types.ObjectId((member['_id'])));

                    data = await ganadorController.getGanadoresByColegioCargo(idColegio, cargoId);
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
            // console.log('Cuerpo de la solicitud recibido en agregarMiembro:');
            const user = await tokenController.getUserIdByToken(req, res, next);
            if (!user.isAdmin) {
                return res.status(500).send({
                    message:
                        "El usuario no posee permisos para agregar miembros"
                });
            }
            let data = [];
            let userLength = 0;
            const arregloErrores = []
            let cuentas = await web3.eth.getAccounts();
            let usuarios = await User.find({ nombreCompleto: { $ne: "Voto en Blanco" } });
            if (usuarios) userLength = usuarios.length;
            // try {
            if (req.body) {
                const decryptData = JSON.parse(CryptoUtils.decrypt(privateKey, req.body.data));
                for (let i = 0; i < decryptData.data.length; i++) {
                    let userPassword = await utilsController.addPassword();
                    let userAccount = cuentas[userLength];
                    decryptData.data[i] = { ...decryptData.data[i], contrasena: userPassword, cuenta: userAccount }
                    let newUser = await User.create(decryptData.data[i]).catch(err => {
                        if (err && err?.errorResponse && err?.errorResponse?.errmsg) {
                            arregloErrores.push(err.errorResponse.errmsg);
                        }
                    });
                    console.log('Errores', arregloErrores);
                    if (newUser && newUser?.cedula) {
                        data.push(newUser);
                    }
                    if (newUser && newUser.correo) {
                        await utilsController.enviarCorreo(newUser.cedula, newUser.carne, newUser.correo, userPassword, newUser.nombreCompleto);
                    }
                    userLength = userLength + 1;
                }
            }
            res.json({
                message: 'Usuario creado',
                response: CryptoUtils.encrypt(privateKey, JSON.stringify(data)),
                errors: arregloErrores
            })
            // } catch (error) {
            //     let message = '';
            //     JSON.stringify(error.code);
            //     if (error && error?.code) {
            //         message = errorCodes[error.code];
            //     } else {
            //         message = error.message;
            //     }
            //     res.status(500).send({
            //         message
            //     });
            // }

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

    // tabla empleados
    async getEmpleados(req, res, next) {
        const user = await tokenController.getUserIdByToken(req, res, next);
        let data;
        try {
            if (user && user.isAdmin) {
                // traer solo los empleados
                data = await User.find({ 'empleado': true })
            }
            if (data.length > 0) {
                const encryptedData = CryptoUtils.encrypt(privateKey, JSON.stringify(data));
                res.json({
                    message: 'respuesta satisfactoria',
                    response: encryptedData
                })
            }
        } catch (error) {
            res.status(500).send({
                message:
                    error.message || "Error"
            });
        }

    }

}

module.exports = new UserController();