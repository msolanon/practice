const mongoose = require("mongoose");


const VotacionSchema = new mongoose.Schema(
    {
        colegio: { type: mongoose.Schema.Types.ObjectId, ref: 'Colegio', required: true },
        cargo: {
            type: String,
            required: true
        },
        tipoVotacion: { // Junta directiva
            type: String,
            required: true
        },
        fechaHoraInicio: {
            type: Date,
            required: true
        },
        fechaHoraFin: {
            type: Date,
            required: true
        },
        counter: {
            type: Number,
            required: true
        },
        candidatos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
        estado: {
            type: Boolean
        },
        totalElectores: {
            type: Number,
        },
    },

);

module.exports = mongoose.model("Votacion", VotacionSchema);
