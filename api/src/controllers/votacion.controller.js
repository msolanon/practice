const { Web3 } = require("web3");
const votacion = require("../models/votacion");
const tokenController = require("./token.controller");
const config = require("../config");
const { default: mongoose } = require("mongoose");
const { parseDateTime } = require("../utils/parseDateTime");
const { extractErrorCode } = require("../utils/parseSolidityError");

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
                    fechaHoraInicio,
                    fechaHoraFin,
                    candidatos,
                } = req.body
                let data = {};
                try {
                    let candidatosId = candidatos.map(element => (new mongoose.Types.ObjectId(element)));
                    let colegioId = new mongoose.Types.ObjectId(colegio['_id'])
                    let fechaHoraFin_ = new Date(fechaHoraFin);
                    let fechaHoraInicio_ = new Date(fechaHoraInicio);
                    if (req.body) {
                        console.log(Math.floor(fechaHoraInicio_.getTime() / 1000));
                        const solidityStartDate = Math.floor(fechaHoraInicio_.getTime() / 1000)
                        console.log(Math.floor(fechaHoraFin_.getTime() / 1000), 'hora fin');
                        const solidityEndDate = Math.floor(fechaHoraFin_.getTime() / 1000)
                        let counter = await simpleVoting.methods.getCounter().call({
                            from: '0x83e53f3e3Eb7bD2ad2C6c311b350E2AFF8410415' // aún puede ser dinámico
                        });
                        counter = Number(counter);
                        console.log(counter);
                        const transaction = await simpleVoting
                            .methods.createBallot(
                                cargo, candidatos, solidityStartDate, solidityEndDate
                            )
                            .send({
                                from: '0x83e53f3e3Eb7bD2ad2C6c311b350E2AFF8410415',//dinamico despúes
                                gas: 3000000
                            })


                        data = await votacion.create({
                            cargo,
                            tipoVotacion,
                            fechaHoraInicio: fechaHoraInicio_,
                            fechaHoraFin: fechaHoraFin_,
                            counter,
                            candidatos: candidatosId,
                            colegio: colegioId,
                            estado: true,
                        }); //add counter
                        res.json({
                            message: 'Votacion creada',
                            response: {
                                data,
                                hash: transaction.transactionHash,
                                numberoBloque: Number(transaction.blockNumber)
                            }
                        })
                    }
                } catch (error) {
                    let message
                    if (error && error?.innerError) {
                        message = error?.innerError;
                    } else {
                        message = error.message
                    }
                    res.status(500).send({
                        ...message
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

    async getBallotByIndex(req, res, next) {
        let { counter } = req.params;
        try {
            const ballot = await simpleVoting.methods.getBallotByIndex(counter).call({
                from: '0x83e53f3e3Eb7bD2ad2C6c311b350E2AFF8410415' // aún puede ser dinámico
            });
            const numberDate = (Number(ballot.startTime) * 1000)
            res.json({
                message: 'Votacion Obtenida',
                response: {
                    data: {
                        candidatos: ballot.options,
                        cargo: ballot.question,
                        minutos: Number(ballot.duration),
                        startTime: new Date(numberDate)
                    }
                }
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message:
                    error?.message || "Error"
            });
        }
    }

    async getResults(req, res, next) {
        let { counter } = req.params;
        try {
            const result = await simpleVoting.methods.results(counter).call({
                from: '0x83e53f3e3Eb7bD2ad2C6c311b350E2AFF8410415' // aún puede ser dinámico
            });
            console.log(result, counter, 'Prueba')

            const votacionData = await votacion.findOne({ counter: Number(counter) })
                .populate('candidatos')
                .exec();

            let votosCandidato = []
            let candidatos = [];
            let votos = [];
            let totalVotos = 0;
            let tableData = [];
            for (let i = 0; i < result.length; i++) {

                const resultado = Number(result[i]);
                const usuario = `${votacionData['candidatos'][i]['nombreCompleto']}: ${resultado}`;
                totalVotos += resultado;
                candidatos.push(usuario);
                votos.push(resultado);
                tableData.push({ candidato: votacionData['candidatos'][i]['nombreCompleto'], votos: resultado })
            }
            votosCandidato.push({ 'candidato': candidatos, 'votos': votos, totalVotos, tableData })

            res.json({
                message: 'Resultados Obtenidos',
                data: votosCandidato

            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message:
                    error?.message || "Error"
            });
        }
    }

    async getWinner(req, res, next) {
        let { counter } = req.params;
        try {
            const winner = await simpleVoting.methods.winners(counter).call({
                from: '0x83e53f3e3Eb7bD2ad2C6c311b350E2AFF8410415' // aún puede ser dinámico
            });
            const votacionData = await votacion.findOne({ counter: Number(counter) })
                .populate('candidatos')
                .exec();

            const ganadores = votacionData.candidatos
                .map((candidato, index) => { if (winner[index]) return candidato.nombreCompleto })
                .filter(result => { return result != undefined })

            res.json({
                message: 'Ganador Obtenido',
                response: {
                    data: {
                        ganador: ganadores,
                    }
                }
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message:
                    error?.message || "Error"
            });
        }
    }

    async votar(req, res, next) {
        try {
            const user = await tokenController.getUserIdByToken(req, res, next);
            if (user.isAdmin) {
                const {
                    id,
                    counter,
                } = req.body
                let data = {};
                try {
                    if (req.body) {
                        const transaction = await simpleVoting
                            .methods.cast(counter, id)
                            .send({
                                from: '0x83e53f3e3Eb7bD2ad2C6c311b350E2AFF8410415',//dinamico despúes
                                gas: 3000000
                            });

                        res.json({
                            message: 'Votacion creada',
                            response: {
                                hash: transaction.transactionHash,
                                numberoBloque: Number(transaction.blockNumber),
                            }
                        })
                    }
                } catch (error) {
                    const solidityError = extractErrorCode(String(error.innerError));
                    res.status(500).send({
                        message: solidityError
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

    // hacer q traiga solo votaciones activas 
    async getVotacionesByColegios(req, res, next) {
        let data;
        let { colegios } = req.params;
        colegios = JSON.parse(colegios);
        colegios = colegios.map(element => (new mongoose.Types.ObjectId(element)));
        try {
            data = await votacion.find({ colegio: { $in: colegios }, estado: true })
                .populate('colegio')
                .populate('candidatos')
                .exec();

            res.json({
                message: 'respuesta satisfactoria',
                response: data
            });
        } catch (error) {
            res.status(500).send({
                message:
                    err.message || "Error"
            });
        }

    }

}

module.exports = new VotacionController();