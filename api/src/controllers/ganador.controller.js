
const mongoose = require("mongoose");

const ganador = require('../models/ganador');

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
                let data = await ganador.findOne({ "cargoId": new mongoose.Types.ObjectId(cargoId), "colegioId": new mongoose.Types.ObjectId(colegioId) });
                return data ? data : {}
            }
        } catch (error) {
            return {}
        }
    }
}

module.exports = new GanadorController();