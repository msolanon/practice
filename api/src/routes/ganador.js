const express = require("express");
const ganadorController = require("../controllers/ganador.controller.js");
const tokenController = require("../controllers/token.controller.js");
const votacionController = require("../controllers/votacion.controller.js");
const routes = express.Router();

routes.get('/ganador/:idColegio', tokenController.verifyToken, ganadorController.ganadores);
routes.post('/ganador/asamblea', tokenController.verifyToken, ganadorController.asignarGanadorAsamblea);
routes.post('/ganador/delete', tokenController.verifyToken, ganadorController.deleteGanador);
routes.put('/ganador', tokenController.verifyToken, votacionController.updateVotacionEstado);
module.exports = routes;
