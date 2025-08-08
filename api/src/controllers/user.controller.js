const { Web3, ETH_DATA_FORMAT } = require("web3");
const User = require("../models/user");
const mongoose = require("mongoose");
const tokenController = require("./token.controller");
const config = require("../config");
const web3 = new Web3(config.NODE_URL);
const nodemailer = require('nodemailer');
const { google } = require('googleapis');


const errorCodes = {
    11000: 'Usuarios duplicados'
}
// Configurar cliente OAuth2
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

class UserController {
    async userByColegio(req, res) {
        try {
            const { idColegio } = req.params;
            let data = [];
            if (idColegio) {
                data = await User.find(
                    { "colegio": new mongoose.Types.ObjectId(idColegio) },
                    { cedula: 1, isAdmin: 1, nombreCompleto: 1, carne: 1, carrera: 1, correo: 1, colegio: 1, estado: 1 }
                ).then(doc => {
                    return doc.map(member => {
                        const colegioArray = member.colegio;
                        const index = colegioArray.findIndex(c => c.equals(idColegio));

                        return {
                            _id: member['_id'],
                            cedula: member.cedula,
                            isAdmin: member.isAdmin,
                            nombreCompleto: member.nombreCompleto,
                            carne: index !== -1 && member.carne[index] ? member.carne[index] : null,
                            carrera: member.carrera,
                            correo: member.correo,
                            colegioIndex: index,
                            estado: member.estado
                        };
                    });
                });
            }


            if (data.length > 0) {
                res.json({
                    message: 'respuesta satisfactoria',
                    response: data
                })
            } else {
                throw Error('No existen usuarios asociados a ese colegio');
            }
        } catch (err) {
            res.status(500).send({
                message:
                    err.message || "Error autenticando usuario"
            });
        }
    };

    async agregarMiembro(req, res, next) {
        try {
            let data = {};
            // await UtilsController.enviarCorreo();
            try {
                if (req.body) {
                    for (let i = 0; i < req.body.length; i++) {
                        console.log(i, "NUEVO I")
                        // const newAccount = web3.eth.accounts.create();
                        // const limit = await web3.eth.estimateGas(
                        //     {
                        //         from: '0x8aFd7E07316087548756280fAb35311aDeC7F6aB',
                        //         to: newAccount.address,
                        //         value: web3.utils.toWei("10", "ether"),
                        //     },
                        //     "latest",
                        //     ETH_DATA_FORMAT,
                        // );
                        console.log('limit')

                        // const tx = {
                        //     from: "0x8aFd7E07316087548756280fAb35311aDeC7F6aB",
                        //     to: newAccount.address,
                        //     value: web3.utils.toWei("10", "ether"),
                        //     gas: limit,
                        //     nonce: await web3.eth.getTransactionCount("0x8aFd7E07316087548756280fAb35311aDeC7F6aB"),
                        //     maxPriorityFeePerGas: web3.utils.toWei("3", "gwei"),
                        //     maxFeePerGas: web3.utils.toWei("300", "gwei"),
                        //     chainId: 1337,
                        //     type: 0x2,
                        // };
                        console.log('tx')

                        // const signedTx = await web3.eth.accounts.signTransaction(tx, '0x02d6a0abd556267652e57fb1d1a5ddee74066cdff2d8729395e6e495fdb0a062');
                        console.log('signedTX')
                        // const receipt = await web3.eth
                        //     .sendSignedTransaction(signedTx.rawTransaction)
                        console.log('receipt')
                        // req.body[i] = { ...req.body[i], cuenta: newAccount.address }
                        // console.log(newAccount, 'soy la nueva cuenta', receipt.blockNumber);
                    }
                    data = await User.insertMany(req.body);
                }
                res.json({
                    message: 'Usuario creado',
                    response: data
                })
            } catch (error) {
                let message = '';
                JSON.stringify(error.code);
                if (error && error?.code) {
                    message = errorCodes[error.code];
                } else {
                    message = error.message;
                }
                res.status(500).send({
                    message
                });
            }

        } catch (err) {
            res.status(500).send({
                message:
                    err.message || "Error autenticando usuario"
            });
        }
    };

    async updateStatus(req, res, next) {
        try {
            const user = await tokenController.getUserIdByToken(req, res, next);
            if (user.isAdmin) {
                let data = {};
                const { estado } = req.body
                const { idUser } = req.params
                try {
                    if (estado !== undefined && idUser) {
                        data = await User.updateOne({
                            _id: new mongoose.Types.ObjectId(idUser)
                        }, {
                            estado
                        });
                    }
                    res.json({
                        message: 'Usuario actualizado',
                        response: data
                    })
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

    async updateCargo(req, res, next) {
        try {
            const user = await tokenController.getUserIdByToken(req, res, next);
            if (user.isAdmin) {
                let data = {};
                const { cargo } = req.body
                const { idUser } = req.params
                try {
                    if (cargo !== undefined && idUser) {
                        data = await User.updateOne({
                            _id: new mongoose.Types.ObjectId(idUser)
                        }, {
                            cargo
                        });
                    }
                    res.json({
                        message: 'Usuario actualizado',
                        response: data
                    })
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
class UtilsController {
    async enviarCorreo() {
        try {
            const accessToken = await oAuth2Client.getAccessToken();

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: 'cfiavotaciones@gmail.com',
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    refreshToken: REFRESH_TOKEN,
                    accessToken: accessToken.token
                }
            });

            const info = {
                from: '"Votaciones CFIA" <cfiavotaciones@gmail.com>',
                to: "valeriabmonge24@gmail.com",
                subject: "Hello ",
                text: "Hello world?", // plain‑text body
                html: "<b>Hello world?</b>", // HTML body
            }

            const result = await transporter.sendMail(info);

        } catch (err) {
            console.error(` Error al enviar correo:`, err.message);
        }
    };
}


module.exports = new UtilsController();
module.exports = new UserController();