const express = require("express");
const authentication = require("../controllers/authentication.controller.js");
const routes = express.Router();

routes.post('/login', authentication.signin);
routes.get('/token', authentication.verify, () => { });

module.exports = routes;
