
const mongoose = require("mongoose");

const ganador = require('../models/ganador');

class GanadorController {
        async upsertGanador(colegioId, cargoId, userId){
         try {
            if (colegioId && cargoId) {
                console.log('soy el colegio', colegioId, 'soy el cargoId', cargoId, userId);
                let data = await ganador.updateOne(
                     // Query filter to find the document
                    { colegioId: new mongoose.Types.ObjectId(colegioId),cargoId: new mongoose.Types.ObjectId(cargoId)},
                    { $set: { userId: new mongoose.Types.ObjectId(userId)}}, // Update operations
                    { upsert: true } // Enable upsert

                );
                return data? data : {} 
            }
        } catch (error) {
            return {}
        }
    }
}

module.exports = new GanadorController();