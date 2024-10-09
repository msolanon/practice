const express = require("express");
const authentication = require("../controllers/authentication.controller.js");
const userController = require("../controllers/user.controller.js");
const tokenController = require("../controllers/token.controller.js");

const routes = express.Router();

routes.post('/login', authentication.signin);
routes.get('/user/colegio/:idColegio', tokenController.verifyToken, userController.userByColegio);
routes.post('/user/Add', tokenController.verifyToken, userController.agregarMiembro);


module.exports = routes;
