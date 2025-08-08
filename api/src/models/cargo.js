const mongoose = require("mongoose");


const CargoSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true
        },
        tipo: {
            type: String,
            required: true
        },
    },

);

module.exports = mongoose.model("Cargo", CargoSchema);

