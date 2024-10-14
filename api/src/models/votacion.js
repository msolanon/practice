const mongoose = require("mongoose");


const VotacionSchema = new mongoose.Schema(
    {
        tipo: {
            type: String,
            required: true
        },
        fechaHoraInicio: {
            type: Date,
            required: true
        },
        cargo: {
            type: String,
            required: true
        },
        minutos: {
            type: Number,
            required: true
        },
        counter: {
            type: Number,
            required: true
        },
        candidatos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
        colegio: { type: mongoose.Schema.Types.ObjectId, ref: 'Colegio', required: true },
        estado: {
            type: Boolean
        },
    },

);

module.exports = mongoose.model("Votacion", VotacionSchema);
