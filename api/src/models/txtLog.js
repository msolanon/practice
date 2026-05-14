const mongoose = require("mongoose");


const TxtLogSchema = new mongoose.Schema(
    {
        txHash: {
            type: String,
            required: true
        },
        fecha:{  
            type: Date,
            required: true
        },
        numBloque:{  
            type: String,
            required: true
        },
        tipo: {
            type: String,
            required: true
        },
        votacionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Votacion' }
    },

);

module.exports = mongoose.model("TxtLog", TxtLogSchema);

