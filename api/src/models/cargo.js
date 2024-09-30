const mongoose = require("mongoose");


const CargoSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true
        },
        colegio: {
            type: mongoose.Schema.ObjectId,
            required: true
        },
        anoVencimiento: {
            type: Number
        }

    },

);

module.exports = mongoose.model("Cargo", CargoSchema);

