const { Web3 } = require("web3");
const votacion = require("../models/votacion");
const tokenController = require("./token.controller");
const cargoController = require('./cargo.controller');
const config = require("../config");
const { default: mongoose } = require("mongoose");
const { parseDateTime } = require("../utils/parseDateTime");
const { extractErrorCode } = require("../utils/parseSolidityError");
const ganadorController = require("./ganador.controller");
const userController = require("./user.controller");
const txLogController = require('./txLog.controller');
votingContract = require('../build/contracts/SimpleVoting.json')
const web3 = new Web3(config.NODE_URL);
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
                    // pregunta si ya existe una votacion activa
                    const votacionData = await votacion.findOne({ colegio, cargo, "fechaHoraFin": { $gte: new Date } })
                        .exec();
                    if (!votacionData || votacionData.length === 0) {
                        // esta creando los id's para mongo ObjectId
                        let candidatosId = candidatos.map(element => (new mongoose.Types.ObjectId(element)));
                        // votos en blanco
                        candidatos.push('0');
                        candidatosId.push(new mongoose.Types.ObjectId("000000000000000000000000"));

                        let colegioId = new mongoose.Types.ObjectId(colegio['_id'])
                        let fechaHoraFin_ = new Date(fechaHoraFin);
                        let fechaHoraInicio_ = new Date(fechaHoraInicio);
                        if (req.body) {
                            // formato fechas solidity
                            const solidityStartDate = Math.floor(fechaHoraInicio_.getTime() / 1000)
                            const solidityEndDate = Math.floor(fechaHoraFin_.getTime() / 1000)
                            // trae el identificador de solidity 
                            let counter = await simpleVoting.methods.getCounter().call({
                                from: user.cuenta
                            });
                            counter = Number(counter);
                            const transaction = await simpleVoting
                                .methods.createBallot(
                                    cargo, candidatos, solidityStartDate, solidityEndDate
                                )
                                .send({
                                    from: user.cuenta, //dinamico despúes
                                    gas: 3000000
                                });
                            
                                
                                // cantidad de usuarios activos en este momento;
                                let userActivos = await userController.userByColegioEstado(colegio['_id']);
                                data = await votacion.create({
                                    cargo,
                                    tipoVotacion,
                                    fechaHoraInicio: fechaHoraInicio_,
                                    fechaHoraFin: fechaHoraFin_,
                                    counter,
                                    candidatos: candidatosId,
                                    colegio: colegioId,
                                    estado: true,
                                    totalElectores: userActivos 

                                }); //add counter

                                const date = await web3.eth.getBlock(transaction.blockNumber)
                                await txLogController.agregarTxLog(transaction.transactionHash, new Date(Number(date.timestamp) * 1000), transaction.blockNumber, data['_id'], 'Apertura Votación')
                                res.json({
                                message: 'Votacion creada',
                                response: {
                                    data,
                                    hash: transaction.transactionHash,
                                    numBloque: Number(transaction.blockNumber)
                                }
                            })
                        }
                    } else {
                        throw new TypeError('Este colegio ya tiene una votación activa para el cargo seleccionado');
                    }
                } catch (error) {
                    let message;
                    if (error && error?.innerError) {
                        message = error?.innerError;
                    } else {
                        message = error.message;
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
                    err.message || "Error autenticando usuario"
            });
        }
    };
    
    async getBallotByIndex(req, res, next) {
        let { counter } = req.params;
        const user = await tokenController.getUserIdByToken(req, res, next);
        try {
            const ballot = await simpleVoting.methods.getBallotByIndex(counter).call({
                from: user.cuenta//aún puede ser dinámico
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
            res.status(500).send({
                message:
                    error?.message || "Error"
            });
        }
    }

    async getBallotByIndex(req, res, next) {
        let { counter } = req.params;
        const user = await tokenController.getUserIdByToken(req, res, next);
        try {
            const ballot = await simpleVoting.methods.getBallotByIndex(counter).call({
                from: user.cuenta//aún puede ser dinámico
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
            res.status(500).send({
                message:
                    error?.message || "Error"
            });
        }
    }

    async getResults(req, res, next) {
        let { counter } = req.params;
        try {
            const user = await tokenController.getUserIdByToken(req, res, next);
            const result = await simpleVoting.methods.results(counter).call({
                from: user.cuenta//aún puede ser dinámico
            });

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
            res.status(500).send({
                message:
                    error?.message || "Error"
            });
        }
    }

    async getWinner(req, res, next) {
        let { counter } = req.params;
        try {
            const user = await tokenController.getUserIdByToken(req, res, next);
            const winner = await simpleVoting.methods.winners(counter).call({
                from: user.cuenta//daún puede ser dinámico
            });

            // objeto votacion
            const votacionData = await votacion.findOne({ counter: Number(counter) })
                .populate('candidatos')
                .exec();

            // arreglo con candidatos
            const ganadores = votacionData.candidatos
                .map((candidato, index) => { if (winner[index]) return candidato })
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
            res.status(500).send({
                message:
                    error?.message || "Error"
            });
        }
    }

    async votar(req, res, next) {
        try {

            const {
                id,
                counter,
                idVotacion
            } = req.body
            let data = {};
            try {
                const user = await tokenController.getUserIdByToken(req, res, next);
                if (req.body) {
                    const transaction = await simpleVoting
                        .methods.cast(counter, id)
                        .send({
                            from: user.cuenta,//dinamico despúes
                            gas: 3000000
                        });

                const date = await web3.eth.getBlock(transaction.blockNumber)      
                console.log('Soy el ID', id);                          
                await txLogController.agregarTxLog(transaction.transactionHash, new Date(Number(date.timestamp) * 1000), transaction.blockNumber, new mongoose.Types.ObjectId(idVotacion), 'Voto')
                res.json({
                    message: 'Voto almacenado',
                    response: {
                        hash: transaction.transactionHash,
                        numeroBloque: Number(transaction.blockNumber),
                    }
                })
                }
            } catch (error) {
                const solidityError = extractErrorCode(String(error.innerError));
                res.status(500).send({
                    message: solidityError
                });
            }
        } catch (err) {
            res.status(500).send({
                message:
                    err.message || "Error autenticando usuario"
            });
        }
    };

    // hacer q traiga solo votaciones activas 
    async getVotacionesByColegios(req, res, next) {
        let data;
        let { colegios } = req.params;
        let { estado } = req.query;

        
        colegios = JSON.parse(colegios);
        colegios = colegios.map(element => (new mongoose.Types.ObjectId(element)));
        try {
            let jsonQuery = {}
            if(colegios.length !== 0){
                jsonQuery = { colegio: { $in: colegios } }
            }
            if (estado) {
                jsonQuery['estado'] = estado;
            }
            data = await votacion.find(jsonQuery)
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

    async updateVotacionEstado(req, res, next) {
        try {
            const user = await tokenController.getUserIdByToken(req, res, next);
            if (user.isAdmin) {
                let updateVotacion = {};
                const { votacionId, colegioId, idGanador, tipoVotacion, cargo } = req.body
                try {
                    if (votacionId) {
                        // pone la votacion inactiva
                        updateVotacion = await votacion.updateOne(
                            { _id: new mongoose.Types.ObjectId(votacionId) },
                            { $set: { estado: false } }
                        );
                        // get Cargo
                        let dataCargo = await cargoController.getCargo(tipoVotacion, cargo)
                        //Update o Insert del Ganador según puesto y el colegio
                        let updateGanador = await ganadorController.upsertGanador(colegioId, dataCargo['_id'], idGanador);
                        
                        await txLogController.agregarTxLog('000000000000', new Date(), '0000000', votacionId, 'Cierre')

                         res.json({
                            message: 'Puesto asignado al ganador y votacion cerrada correctamente',
                            response: {votacion: votacionId, ganador: updateGanador}
                        })
                    }
                } catch (error) {
                    res.status(500).send({
                        message:
                            error.message
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
                    err.message || "Error autenticando usuario"
            });
        }
    }
}



module.exports = new VotacionController();