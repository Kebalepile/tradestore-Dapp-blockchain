const TradeStore = artifacts.require('TradeStore')
const Web3 = require('web3')

function toEth(n) {
  return Web3.utils.toWei(`${n}`, 'Ether')
}

contract('TradeStore contract', ([owner, vendor, newOwner]) => {
  xcontext('test3', () => {
    let xInstance, result
    before(async () => {
      xInstance = await TradeStore.new()
    })
    it('Owner should equal owner', async () => {
      let _owner = await xInstance.owner()
      assert.equal(_owner, owner)
    })

    it('Vendor creates a new sale contract', async () => {
      // xRes value is a result object
      let xRes = await xInstance.makeOffer(toEth(2), toEth(5), {
        from: vendor,
        value: toEth(2),
      })
      result = await xRes
      assert.equal(xRes.receipt.status, true)
    })
    // contract use result.logs[1].args["0"] to access
    it('Vendor cancels sale agreement vendor created', async () => {
      let address = result.logs[1].args['0']
      let res = await xInstance.cancelAgreement(address, { from: vendor })
      console.table(res.logs[0].args)
      assert.equal(res.receipt.status, true)
    })
    it("Total Pending Sales must equal 0 ", async () => {
       let res = await xInstance.totalSalesPending()
       assert.equal(res.words[0],0)
    })
    it('Owner sets new owner of TradeContract', async () => {
      await xInstance.setOwner(newOwner, { from: owner })
      let res = await xInstance.owner()
      assert.equal(res, newOwner)
    })
  })
})
