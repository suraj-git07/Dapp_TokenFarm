const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require('TokenFarm')

module.exports = async function(deployer, network, accounts) {

    //Deploy the Mock Dai Token
    await deployer.deploy(DaiToken);
    const daiToken = await DaiToken.deployed();


    //Deploy the Dapp token
    await deployer.deploy(DappToken);
    const dappToken = await DappToken.deployed();

    //Deploy TokenFarm

    await deployer.deploy(TokenFarm, dappToken.address, daiToken.address);
    const tokenFarm = await TokenFarm.deployed();


    //Transfer all Dapp Token to Our Liquidity Pool TokenFarm
    await dappToken.transfer(tokenFarm.address, '1000000000000000000000000');

    // Transfer 100 Dai token to inverstor
    // accounts[0] acc to our ganache is deployer
    await daiToken.transfer(accounts[1], '100000000000000000000');
};