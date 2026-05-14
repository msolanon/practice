const express = require("express");
const colegio = require("../controllers/colegio.controller.js");
const tokenController = require("../controllers/token.controller.js");
const routes = express.Router();

routes.post('/colegio', tokenController.verifyToken, colegio.agregarColegio);
routes.get('/colegio', tokenController.verifyToken, colegio.getColegios);


module.exports = routes;
