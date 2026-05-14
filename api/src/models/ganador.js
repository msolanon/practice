const mongoose = require("mongoose");


const GanadoresSchema = new mongoose.Schema(
    {
        colegioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Colegio' },
        userId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        cargoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cargo' }
    },

);

module.exports = mongoose.model("Ganador", GanadoresSchema);

