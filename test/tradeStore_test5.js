const TradeStore = artifacts.require('TradeStore')
const Web3 = require('web3')

function toEth(n) {
  return Web3.utils.toWei(`${n}`, 'Ether')
}

contract('TradeStore contract', ([owner, vendor, customer]) => {
  xcontext('test5', () => {
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
    it('Customer pays for product advertised by vendor', async () => {
      let xRes = await xInstance.acceptOffer(result.logs[1].args['0'], toEth(5), {
        from: customer,
        value: toEth(5),
      })
      console.table(xRes.logs[0])
      assert.equal(xRes.receipt.status, true)
    })
    // contract use result.logs[1].args["0"] to access sale contract
    it('Owner terminates sale contract and refunds customer ', async () => {
      let address = await result.logs[1].args['0']
      let res = await xInstance.terminateAndRefund(address, { from: owner })
      console.table(res.logs[0].args)
      assert.equal(res.receipt.status, true)
    })

    it('Sale contract must be terminated', async () => {
      let address = await result.logs[1].args['0'],
        res = await xInstance.terminated(address)
      assert.equal(res, true)
    })
    it('Total Binding Sales must equal 0 ', async () => {
      let res = await xInstance.totalSalesBinding()
      assert.equal(res.words[0], 0)
    })
    it('Total Declined Sales must equal 1 ', async () => {
      let res = await xInstance.totalSalesDeclined()
      assert.equal(res.words[0], 1)
    })
  })
})
