const mongoose = require("mongoose");
const mongo = require('mongodb');



const ColegioSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true
        },
        abreviatura: {
            type: String,
            required: true
        }
    }
);

module.exports = mongoose.model("Colegio", ColegioSchema);
