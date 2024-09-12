const express = require("express");
const db = require("./config");
const mongoose = require("mongoose");
const morgan = require('morgan');
var cors = require('cors')


class App {
    constructor() {
        this.express = express();
        this.database();
        this.middlewares();
        this.routes();
        this.express.listen(3000, () =>
            console.log(`API REST con mongo DB ejecutando en el puerto 3000 `)
        );
    }

    async database() {
        await mongoose.connect(db.uri, { useNewUrlParser: true });
    }

    middlewares() {
        this.express.use(express.json());
    }

    routes() {
        this.express.use(cors());
        this.express.use(require("./routes/authentication"));
    }
}

module.exports = new App().express;