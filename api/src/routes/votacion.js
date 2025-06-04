const express = require("express");
const votacionController = require("../controllers/votacion.controller.js");
const tokenController = require("../controllers/token.controller.js");

const routes = express.Router();

routes.post('/votacion/add', tokenController.verifyToken, votacionController.agregarVotacion);
routes.get('/votacion/colegio/:colegios', tokenController.verifyToken, votacionController.getVotacionesByColegios);
routes.get('/votacion/:counter', tokenController.verifyToken, votacionController.getBallotByIndex);
routes.get('/resultados/:counter', tokenController.verifyToken, votacionController.getResults);
routes.get('/votacion/ganador/:counter', tokenController.verifyToken, votacionController.getWinner);
routes.post('/votacion/votar', tokenController.verifyToken, votacionController.votar);


module.exports = routes;
