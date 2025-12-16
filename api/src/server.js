const express = require("express");
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const db = require("./config");
const mongoose = require("mongoose");
var cors = require('cors')


class App {
    constructor() {
        this.app = express();
        this.database();
        this.middlewares();
        this.routes();

        // rutas a los certificados dentro de `src`
        const keyPath = path.resolve(__dirname + `/certs`, 'localhost.key');
        const certPath = path.resolve(__dirname + `/certs`, 'localhost.crt');

        // si existen ambos archivos, iniciamos servidor HTTPS, si no, fallback a HTTP
        if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
            const sslOptions = {
                key: fs.readFileSync(keyPath, 'utf8'),
                cert: fs.readFileSync(certPath, 'utf8')
            };

            https.createServer(sslOptions, this.app).listen(3000, () =>
                console.log('API REST (HTTPS) ejecutando en el puerto 3000')
            );
        } else {
            console.warn('Certificados HTTPS no encontrados; arrancando servidor en HTTP en el puerto 3000');
            http.createServer(this.app).listen(3000, () =>
                console.log('API REST (HTTP) ejecutando en el puerto 3000')
            );
        }
    }

    async database() {
        await mongoose.connect(db.uri, { useNewUrlParser: true });
    }

    middlewares() {
        this.app.use(express.json());
    }

    routes() {
        this.app.use(cors());
        this.app.use(require("./routes/user"));
        this.app.use(require("./routes/colegio"));
        this.app.use(require("./routes/votacion"));
        this.app.use(require("./routes/txLog"));
        this.app.use(require("./routes/ganador"));
    }
}

module.exports = new App().express;