const express = require("express");
const colegio = require("../controllers/colegio.controller.js");
const routes = express.Router();

routes.post('/create', colegio.agregarColegio);

module.exports = routes;
