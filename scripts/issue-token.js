const TokenFarm = artifacts.require('TokenFarm')

module.exports = async function(callback) {

    // Coad goes here...
    let tokenFarm = await TokenFarm.deployed();
    await tokenFarm.issueTokens();

    console.log("tokens issued");

    callback()
};