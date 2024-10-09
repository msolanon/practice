const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema(
    {
        nombreCompleto: {
            type: String,
            required: true
        },
        cedula: {
            type: String,
            required: true
        },
        carne: {
            type: Array,
            required: true
        },
        carrera: {
            type: Array
        },
        estado: {
            type: Boolean,
            required: true
        },
        password: {
            type: String
        },
        correo: {
            type: String,
            required: true
        },
        colegio: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Colegio' }], 
        cargo: {
            type: Array
        },
        empleado: {
            type: Boolean,
            required: true
        },
        contrasena: {
            type: Boolean,
            required: true
        },
        cuenta: {
            type: String,
            required: true
        },
        isAdmin: {
            type: Boolean,
            required: true
        }

    },

);

module.exports = mongoose.model("User", UserSchema);
