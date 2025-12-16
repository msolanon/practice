
const mongoose = require("mongoose");
const cargo = require('../models/cargo');
const ganador = require('../models/ganador');
const votacion = require("../models/votacion");
const tokenController = require("./token.controller");
const cargoController = require('./cargo.controller');
const txLogController = require('./txLog.controller');


class GanadorController {
    async upsertGanador(colegioId, cargoId, userId) {
        try {
            if (colegioId && cargoId) {
                let data = await ganador.updateOne(
                    // Query filter to find the document
                    { colegioId: new mongoose.Types.ObjectId(colegioId), cargoId: new mongoose.Types.ObjectId(cargoId) },
                    { $set: { userId: new mongoose.Types.ObjectId(userId) } }, // Update operations
                    { upsert: true } // Enable upsert

                );
                return data ? data : {}
            }
        } catch (error) {
            return {}
        }
    }

    async getGanadoresByColegioCargo(colegioId, arrayCargos) {
        const data = await ganador.find({
            "colegioId": new mongoose.Types.ObjectId(colegioId),
            "cargoId": { $in: arrayCargos }
        }).populate('userId').then(doc => {
            return doc.map(member => {
                // arreglo d colegios
                const colegioArray = member['userId'].colegio;
                const index = colegioArray.findIndex(c => c.equals(colegioId));
                return {
                    _id: member['userId']['_id'],
                    cedula: member['userId'].cedula,
                    isAdmin: member['userId'].isAdmin,
                    nombreCompleto: member['userId'].nombreCompleto,
                    carne: index !== -1 && member['userId'].carne[index] ? member['userId'].carne[index] : null,
                    carrera: member['userId'].carrera,
                    correo: member['userId'].correo,
                    colegioIndex: index,
                    estado: member['userId'].estado
                };
            });
        });
        return data;
    }

    async getGanador(colegioId, cargoId) {
        try {
            if (colegioId && cargoId) {
                let data = await ganador.find({ "cargoId": new mongoose.Types.ObjectId(cargoId), "colegioId": new mongoose.Types.ObjectId(colegioId) });
                return data ? data : {}
            }
        } catch (error) {
            return {}
        }
    }

    async ganadores(req, res, next) {
        try {
            const cargoAsamblea = await cargo.findOne({ tipo: 'Asamblea de Representantes' });
            const arrayGanadores = await ganador.find({
                "colegioId": new mongoose.Types.ObjectId(req.params.idColegio),
                "cargoId": cargoAsamblea['_id']
            }).populate('userId').then(doc => {
                return doc.map(member => {
                    // arreglo d colegios
                    return {
                        _id: member['userId']['_id'],
                        nombreCompleto: member['userId'].nombreCompleto,
                        idColegio: new mongoose.Types.ObjectId(req.params.idColegio),
                        cargoId: cargoAsamblea['_id']
                    };
                });
            });
            res.json({
                message: 'Ganadores Obtenidos',
                response: arrayGanadores
            });
        } catch (error) {
        }
    }


    async asignarGanador(req, res, next) {
    }

    async asignarGanadorAsamblea(req, res, next) {
        try {
            const user = await tokenController.getUserIdByToken(req, res, next);
            if (user.isAdmin) {
                const { data, votacionId } = req.body
                try {
                    if (votacionId) {
                        // pone la votacion inactiva
                        await votacion.updateOne(
                            { _id: new mongoose.Types.ObjectId(votacionId) },
                            { $set: { estado: false } }
                        );
                        // get Cargo
                        let dataCargo = await cargoController.getCargo('Asamblea de Representantes', 'Asambleista')
                        //Update o Insert del Ganador según puesto y el colegio
                        for (const ganadorData of data) {
                            const { userId, colegioId } = ganadorData;
                            ganador.create(
                                // Query filter to find the document
                                { colegioId, cargoId: dataCargo['_id'], userId } // Update operations

                            );
                        }
                        await txLogController.agregarTxLog('000000000000', new Date(), '0000000', votacionId, 'Cierre')

                        res.json({
                            message: 'Puesto asignado al ganador y votacion cerrada correctamente',
                            response: { votacion: votacionId, ganador: data }
                        })
                    }
                } catch (error) {
                    res.status(500).send({
                        message:
                            error.message
                    });
                }

            } else {
                res.status(500).send({
                    message:
                        "El usuario no posee permisos para cerrar una votacion"
                });
            }
        } catch (err) {
            res.status(500).send({
                message:
                    err.message || "Error autenticando usuario"
            });
        }
    }

    async deleteGanador(req, res, next) {
        try {
            if (req.body) {
                for (const bodyItem of req.body) {
                    const borrados = await ganador.deleteOne(bodyItem);
                }
                res.json({
                    message: 'Ganadores eliminados'
                });
            }

        } catch (error) {
            console.error('Error al eliminar ganadores:', error);
        }

    }
}

module.exports = new GanadorController();