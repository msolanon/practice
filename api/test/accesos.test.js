const mongoose = require('mongoose');
const request = require('supertest');
const db = require("../src/config");
const User = require("../src/models/user");
const Colegio = require("../src/models/colegio");
const Cargo = require("../src/models/cargo");
const CryptoUtils = require("../src/utils/CryptoUtils");
const utilsController = require("../src/controllers/utils.controller");
const app = require('../src/server');
const { ethers } = require("hardhat");
const { expect } = require('chai');
const { privateKey } = require("../src/privateKey");

describe('Pruebas control de accesos', function () {
    let Andres;
    let userPassword;
    let marioPassword;
    let token;
    let marioToken;
    let decryptMarioToken;
    let decryptedToken
    let colegioId;
    let cargoId;
    let SimpleVoting;
    let ballot;

    before(async function () {
        [Andres, Mario] = await ethers.getSigners();
        userPassword = await utilsController.addPassword()
        marioPassword = await utilsController.addPassword()
        await mongoose.connect(db.test, { useNewUrlParser: true });

        const userAndres = {
            nombreCompleto: 'Andres Salazar',
            cargo: "",
            cedula: '11234',
            isAdmin: false,
            carne: ['11234'],
            correo: 'andres.salazar@example.com',
            estado: true,
            cuenta: Andres.address,
            contrasena: "sin asignar",
            contrasena: userPassword,
            empleado: this.padronTitle === "Padrón de Empleados",
            colegio: new mongoose.Types.ObjectId('6854d197f29d0d1092d8bb20') // Solo asigna si no es empleado
        };
        await User.create(userAndres);
        const userMario = {
            nombreCompleto: 'Mario Lopez',
            cargo: "",
            cedula: '112345',
            isAdmin: true,
            carne: ['112345'],
            correo: 'mario.lopez@example.com',
            estado: true,
            cuenta: Mario.address,
            contrasena: "sin asignar",
            contrasena: marioPassword,
            empleado: this.padronTitle === "Padrón de Empleados",
            colegio: new mongoose.Types.ObjectId('6854d197f29d0d1092d8bb20') // Solo asigna si no es empleado
        };
        await User.create(userMario);

        const data = { cedula: userAndres.cedula, password: userPassword };
        const marioData = { cedula: userMario.cedula, password: marioPassword };
        const encriptedMarioData = CryptoUtils.encrypt(privateKey, JSON.stringify({ data: marioData }));
        const encryptedData = CryptoUtils.encrypt(privateKey, JSON.stringify({ data }));

        const responseLogin = await request(app)
            .post('/login')
            .send({ data: encryptedData })

        const marioLogin = await request(app)
            .post('/login')
            .send({ data: encriptedMarioData })

        token = responseLogin.body.token;
        marioToken = marioLogin.body.token;
        // token usuario con permisos admin
        decryptMarioToken = CryptoUtils.decrypt(privateKey, marioToken);

        // token usuario sin permisos admin
        decryptedToken = CryptoUtils.decrypt(privateKey, token);


    });
    describe('Pruebas con usuario no autorizado', function () {
        it('agregar miembros', async () => {
            const usuarioParaAgregar = [
                {
                    nombreCompleto: 'Julio Salazar',
                    cargo: "",
                    cedula: '11233',
                    isAdmin: false,
                    carne: ['1234567'],
                    correo: 'julio.salazar@example.com',
                    estado: true,
                    cuenta: Andres.address,
                    contrasena: "sin asignar",
                    contrasena: userPassword,
                    empleado: this.padronTitle === "Padrón de Empleados",
                    colegio: new mongoose.Types.ObjectId('6854d197f29d0d1092d8bb21')
                }];
            const encryptedUser = CryptoUtils.encrypt(privateKey, JSON.stringify({ data: usuarioParaAgregar }));

            const responseAgregarPadron = await request(app)
                .post('/user/add')
                .set('Authorization', `Bearer ${decryptedToken}`)
                .send({ data: encryptedUser })

            expect(responseAgregarPadron.body.message).to.equal('El usuario no posee permisos para agregar miembros');
        });

        it('agregar votacion', async () => {
            const responseAgregarVotacion = await request(app)
                .post('/votacion/add')
                .set('Authorization', `Bearer ${decryptedToken}`)
                .send({ data: {} })

            expect(responseAgregarVotacion.body.message).to.equal('El usuario no posee permisos para crear una votacion');
        })

        it('cerrar votacion', async () => {
            const responseCerrarVotacion = await request(app)
                .put('/ganador')
                .set('Authorization', `Bearer ${decryptedToken}`)
                .send({ data: {} })
            expect(responseCerrarVotacion.body.message).to.equal('El usuario no posee permisos para cerrar una votacion');
        });
    });

    after(async function () {
        try {
            await mongoose.connection.db.dropDatabase();
        } catch (e) {
            // ignore if not connected or already dropped
        }
        await mongoose.connection.close();
    });
});