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
        // Avoid side effects during tests: do not connect to DB or start server when running under Jest
        const isTest = process.env.NODE_ENV === 'test';

        if (!isTest) {
            this.database();
        }

        this.middlewares();
        this.routes();

        // add a lightweight health endpoint for tests and liveness checks
        this.app.get('/health', (req, res) => res.status(200).send('OK'));

        // rutas a los certificados dentro de `src`
        const keyPath = path.resolve(__dirname + `/certs`, 'localhost.key');
        const certPath = path.resolve(__dirname + `/certs`, 'localhost.crt');

        // si existen ambos archivos, iniciamos servidor HTTPS, si no, fallback a HTTP
        // solo arrancamos el listener cuando no estamos en modo test
        if (!isTest) {
            if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
                const sslOptions = {
                    key: fs.readFileSync(keyPath, 'utf8'),
                    cert: fs.readFileSync(certPath, 'utf8')
                };

                https.createServer(sslOptions, this.app).listen(3000, '0.0.0.0', () =>
                    console.log('API REST (HTTPS) ejecutando en el puerto 3000')
                );
            } else {
                console.warn('Certificados HTTPS no encontrados; arrancando servidor en HTTP en el puerto 3000');
                http.createServer(this.app).listen(3000, '0.0.0.0', () =>
                    console.log('API REST (HTTP) ejecutando en el puerto 3000')
                );
            }
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

// Export the Express application instance for Supertest and other uses
module.exports = new App().app;