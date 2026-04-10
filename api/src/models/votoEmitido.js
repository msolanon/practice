const mongoose = require("mongoose");


const VotoEmitidoSchema = new mongoose.Schema(
    {
        usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        votacionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Votacion' }
    },

);

module.exports = mongoose.model("VotoEmitido", VotoEmitidoSchema);

