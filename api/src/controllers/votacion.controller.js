const { Web3 } = require("web3");
const votacion = require("../models/votacion");
const tokenController = require("./token.controller");
const config = require("../config");
const { default: mongoose } = require("mongoose");
const web3 = new Web3(config.NODE_URL);
votingContract = require('../build/contracts/SimpleVoting.json')
const simpleVoting = new web3.eth.Contract(votingContract.abi, votingContract.networks['5777'].address);


class VotacionController {
    async agregarVotacion(req, res, next) {
        try {
            const user = await tokenController.getUserIdByToken(req, res, next);
            if (user.isAdmin) {
                const {
                    colegio,
                    cargo,
                    tipoVotacion,
                    fechaInicio,
                    horaInicio,
                    fechaFin,
                    horaFin,
                    candidatos,
                } = req.body
                let data = {};

                try {
                    let candidatosId = candidatos.map(element => (new mongoose.Types.ObjectId(element)));
                    let colegioId = new mongoose.Types.ObjectId(colegio['_id'])
                    let fechaHoraFin = new Date(fechaFin);
                    fechaHoraFin.setHours(horaFin.split(':')[0], horaFin.split(':')[1], '00', '00');
                    let fechaHoraInicio = new Date(fechaInicio);
                    fechaHoraInicio.setHours(horaInicio.split(':')[0], horaInicio.split(':')[1], '00', '00');
                    let minutos = Math.round((fechaHoraFin - fechaHoraInicio) / 60000);


                    if (req.body) {
                        let counter = await simpleVoting
                            .methods.counter
                            .call()
                            .call()
                        const solidityDate = Math.floor(fechaHoraInicio.getTime() / 1000)
                        console.log(solidityDate);
                        const transaction = await simpleVoting
                            .methods.createBallot(
                                cargo, candidatos, solidityDate, minutos
                            )
                            .send({
                                from: '0x83e53f3e3Eb7bD2ad2C6c311b350E2AFF8410415',//dinamico despúes
                                gas: 3000000
                            })

                        counter = Number(counter)
                        console.log(counter);
                        data = await votacion.create({
                            cargo,
                            tipoVotacion,
                            fechaHoraInicio,
                            fechaHoraFin,
                            counter,
                            candidatos: candidatosId,
                            colegio: colegioId,
                            minutos,
                            estado: true,
                        }); //add counter
                        console.log(data)

                        res.json({
                            message: 'Votacion creada',
                            response: {
                                data,
                                hash: transaction.transactionHash,
                                numberoBloque: Number(transaction.blockNumber),

                            }
                        })
                    }
                } catch (error) {
                    let message
                    if (error && error?.innerError && error.innerError?.message) {
                        message = innerError?.message
                    } else {
                        message = error.message
                    }
                    res.status(500).send({
                        message
                    });
                }
            } else {
                res.status(500).send({
                    message:
                        "El usuario no posee permisos para crear una votacion"
                });
            }
        } catch (err) {
            res.status(500).send({
                message:
                    err.message || "Error authenticating user"
            });
        }
    };

    async getVotaciones(req, res, next) {
        const user = await tokenController.getUserIdByToken(req, res, next);
        let data;
        try {

        } catch (error) {
            res.status(500).send({
                message:
                    err.message || "Error"
            });
        }

    }

}

module.exports = new VotacionController();