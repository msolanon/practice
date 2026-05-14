const express = require("express");
const authentication = require("../controllers/authentication.controller.js");
const userController = require("../controllers/user.controller.js");
const tokenController = require("../controllers/token.controller.js");

const routes = express.Router();

routes.post('/login', authentication.signin);
routes.get('/user/empleado', tokenController.verifyToken, userController.getEmpleados);
routes.get('/user/colegio/:idColegio', tokenController.verifyToken, userController.userByColegio);
routes.get('/user/ganador/:idColegio/:puestos/:tipoVotacion/:modalidad', tokenController.verifyToken, userController.userByGanadores);
routes.post('/user/Add', tokenController.verifyToken, userController.agregarMiembro);
routes.put('/user/updateStatus/:idUser', tokenController.verifyToken, userController.updateStatus);

module.exports = routes;
