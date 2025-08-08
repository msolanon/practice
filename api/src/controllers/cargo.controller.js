const cargo = require('../models/cargo');

class CargoController {
        async getCargo(tipoVotacion, nombreCargo){
         try {
            if (tipoVotacion && nombreCargo) {
                let data = await cargo.findOne({ "nombre": nombreCargo, "tipo": tipoVotacion });
                return data? data : {} 
            }
        } catch (error) {
            return {}
        }
    }
}

module.exports = new CargoController();