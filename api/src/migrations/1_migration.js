var MyContract = artifacts.require("SimpleVoting");

module.exports = async function (deployer) {
    // deploy a contract
    await deployer.deploy(MyContract);
    //access information about your deployed contract instance
    const instance = await MyContract.deployed();
};