const TradeStore = artifacts.require("TradeStore");
// const Sale = artifacts.require("Sale");


module.exports =  async function(deployer) {
  // deply trade store
   await deployer.deploy(TradeStore);
  //  await deployer.deploy(Sale);
};
