const { Router } = require('express');
const { Web3 } = require("web3");
const NODE_URL = "http://localhost:9545";
const web3 = new Web3(NODE_URL);
const router = Router();

//Raiz
router.get('/account/:accountAddress', async (req, res) => {
    const bigIntBalance = await web3.eth.getBalance(req.params['accountAddress']);
    ether = web3.utils.fromWei(bigIntBalance, 'ether')
    res.json({
        balance: ether
    });
})

module.exports = router;