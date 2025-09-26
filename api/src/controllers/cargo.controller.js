const cargo = require('../models/cargo');

class CargoController {
    async getCargo(tipoVotacion, nombreCargo) {
        try {
            if (tipoVotacion && nombreCargo) {
                let data = await cargo.findOne({ "nombre": { $in: nombreCargo} , "tipo": tipoVotacion });
                return data ? data : {}
            }
        } catch (error) {
            return {}
        }
    }

    async getCargos(tipoVotacion, nombreCargo) {
        try {
            if (tipoVotacion && nombreCargo) {
                let data = await cargo.find({ "nombre": { $in: nombreCargo} , "tipo": tipoVotacion });
                return data ? data : {}
            }
        } catch (error) {
            return {}
        }
    }

    async getTipoVotacion(tipoVotacion) {
        try {
            if (tipoVotacion) {
                let data = await cargo.find({"tipo": tipoVotacion });
                return data ? data : {}
            }
        } catch (error) {
            return {}
        }
    }


}

module.exports = new CargoController();