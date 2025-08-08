const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema(
    {
        nombreCompleto: {
            type: String,
            required: true
        },
        cedula: {
            type: String,
            required: true,
            index: { unique: true }
        },
        carne: {
            type: Array,
            required: true,
            index: { unique: true }
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
            required: true,
            index: { unique: true }
        },
        colegio: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Colegio' }],
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
            index: { unique: true }
        },
        isAdmin: {
            type: Boolean,
            required: true
        }

    },

);

module.exports = mongoose.model("User", UserSchema);
