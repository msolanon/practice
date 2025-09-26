const txLog = require('../models/txtLog');
const { default: mongoose } = require("mongoose");

class TxLogController {
    async agregarTxLog(txHash, fecha, numBloque, votacionId, tipo){
        try {
            console.log(txHash, fecha, numBloque, votacionId, tipo);
            if (txHash && fecha && numBloque && votacionId !== undefined ){         
                let data = await txLog.create({ txHash, fecha, numBloque: Number(numBloque), votacionId, tipo });
                return data? data : {} 
            }
        } catch (error) {
            console.log(error, 'soy el error');
            return {}
        }
    }

    async obtenerTxLog(req, res, next){
        try {
           const { votacionId } = req.params;
           const mongoId = new mongoose.Types.ObjectId(votacionId)
            let data = [];
            data = await txLog.find(
                { votacionId: mongoId},
                { txHash: 1, fecha: 1, numBloque: 1, tipo: 1})
            res.json({
                message: 'Transacciones Obtenidas',
                response: data
            });
        } catch (error) {
            return {}
        }
    }
}

module.exports = new TxLogController();