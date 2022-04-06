const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");

require("chai")
  .use(require("chai-as-promised"))
  .should();

function tokens(n) {
  return web3.utils.toWei(n, "ether");
}

contract("TokenFarm", ([owner, investor]) => {
  let daiToken, dappToken, tokenFarm;
  before(async () => {
    //Load Contract
    daiToken = await DaiToken.new();
    dappToken = await DappToken.new();
    tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);

    //Transfer all Dapp Token to Farm
    await dappToken.transfer(tokenFarm.address, tokens("1000000"));

    //Transfer Dai token to investor
    await daiToken.transfer(investor, tokens("100"), { from: owner });
  });

  //Write your test here

  describe("Mock Dai deployment", async () => {
    it("has a name", async () => {
      const name = await daiToken.name();
      assert.equal(name, "Mock DAI Token");
    });
  });

  describe("Dapp Token deployment", async () => {
    it("has a name", async () => {
      const name = await dappToken.name();
      assert.equal(name, "DApp Token");
    });
  });

  describe("Token Farm deployment", async () => {
    it("has a name", async () => {
      const name = await tokenFarm.name();
      assert.equal(name, "Dapp Token Farm");
    });

    it("contract has tokens", async () => {
      let balance = await dappToken.balanceOf(tokenFarm.address);
      assert.equal(balance.toString(), tokens("1000000"));
    });
  });

  describe("Farming tokens", async () => {
    it("rewards investors for staking mDai Token", async () => {
      let result;
      //Check investor balance before staking
      result = await daiToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokens("100"),
        "investor Mock Dai wallet balance correct for staking"
      );

      // stake mock dai token
      await daiToken.approve(tokenFarm.address, tokens("100"), {
        from: investor,
      });
      await tokenFarm.stakeTokens(tokens("100"), { from: investor });

      // Check Staking result
      result = await daiToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokens("0"),
        "investor Mock Dai wallet balance correct for staking"
      );

      result = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(
        result.toString(),
        tokens("100"),
        "Token Farm Mock Dai balance correct after staking"
      );

      result = await tokenFarm.stakingBalance(investor);
      assert.equal(
        result.toString(),
        tokens("100"),
        "Investor staking balance correct after staking"
      );

      result = await tokenFarm.isStaking(investor);
      assert.equal(
        result.toString(),
        "true",
        "Investor staking status correct after staking"
      );

      // Isuue Tokens
      await tokenFarm.issueTokens({ from: owner });

      // Check balances after issuance
      result = await dappToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokens("100"),
        "investor Dapp token wallet balnce after issueance"
      );

      // Ensure that only owner can issue tokens
      await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

      // Unstake Tokens

      await tokenFarm.unstakeTokens({ from: investor });

      // check result after unstaking
      result = await daiToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokens("100"),
        "investor Mock Dai balance correct after unstaking"
      );

      result = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(
        result.toString(),
        tokens("0"),
        " Toekn Farm Mock Dai balance correct after unstaking"
      );

      result = await tokenFarm.stakingBalance(investor);
      assert.equal(
        result.toString(),
        tokens("0"),
        "investor staking balance correct after unstaking"
      );

      result = await tokenFarm.isStaking(investor);
      assert.equal(
        result.toString(),
        "false",
        "investor staking status correct after unstaking"
      );
    });
  });
});
