const express = require("express");
const tokenController = require("../controllers/token.controller.js");
const txLogController = require("../controllers/txLog.controller.js");

const routes = express.Router();


routes.get('/trazabilidad/:votacionId', tokenController.verifyToken, txLogController.obtenerTxLog);


module.exports = routes;
