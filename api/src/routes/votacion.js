const express = require("express");
const votacionController = require("../controllers/votacion.controller.js");
const tokenController = require("../controllers/token.controller.js");

const routes = express.Router();

routes.post('/votacion/add', tokenController.verifyToken, votacionController.agregarVotacion);


module.exports = routes;
