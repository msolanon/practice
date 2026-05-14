const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleVoting", function () {
    let SimpleVoting;
    let ballot;
    let alice;
    let bob
    let fechaHoraInicio_ = new Date();
    let fechaHoraFin_ = new Date().setDate(fechaHoraInicio_.getDate() + 5);

    before(async () => {
        [alice, bob, Andres] = await ethers.getSigners();
        SimpleVoting = await ethers.getContractFactory("SimpleVoting");
        ballot = await SimpleVoting.deploy();

    });

    it("El usuario puede votar", async function () {
        // Create a test ballot with 2 options
        const options = ["115750252", "116100781"];
        const solidityStartDate = Math.floor(fechaHoraInicio_.getTime() / 1000)
        const solidityEndDate = Math.floor(new Date(fechaHoraFin_).getTime() / 1000)

        await ballot.createBallot('Vicepresidente', options, solidityStartDate, solidityEndDate);

        const ballotId = 0; // First ballot
        // Alice votes once (should succeed)
        await ballot.connect(alice).cast(ballotId, 115750251);
    });

    it("El usuario no puede votar al cerrar la votacion", async function () {
        const options = ["115750253", "116100782"];
        const startDate = Math.floor(fechaHoraInicio_.getTime() / 1000)
        const ballotId = 1; // First ballot

        // la fecha d inicio y la fecha fin son las mismas 
        await ballot.createBallot('Presidente', options, startDate, startDate);

        // Alice tries to vote again (should revert)
        await expect(ballot.connect(bob).cast(ballotId, 115750253)).to.be.revertedWith("___Esta votacion ya termino___");
    });


    it("El usuario no puede ejercer doble voto", async function () {
        // Create a test ballot with 2 options
        const options = ["115750252", "116100781"];
        const solidityStartDate = Math.floor(fechaHoraInicio_.getTime() / 1000)
        const solidityEndDate = Math.floor(new Date(fechaHoraFin_).getTime() / 1000)

        await ballot.createBallot('Vicepresidente', options, solidityStartDate, solidityEndDate);

        const ballotId = 0; // First ballot
        // Primer voto de Andres (should succeed)
        await ballot.connect(Andres).cast(ballotId, 115750251);

        // Reintento de votacion (should revert)
        await expect(ballot.connect(Andres).cast(ballotId, 115750251)).to.be.revertedWith("___El usuario ya voto___");
    });

});