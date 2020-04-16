const TradeStore = artifacts.require('TradeStore')
// const Web3 = require('web3')
// function toEth(n) {
//   return Web3.utils.toWei(`${n}`, 'Ether')
// }
contract('TradeStore Contract :', ([owner, vendor]) => {
  xcontext('test 1', () => {
    let xInstance, res
    before(async () => {
      xInstance = await TradeStore.new()
    })
    it("_owner should equal owner", async () => {
        let _owner = await xInstance.owner();
        assert.equal(_owner,owner)
    })

    it('vendor creates a sale contract & return some events from both Trade Contract and Sale Contract', async () => {
      let result = await xInstance.makeOffer(2, 5, {
        from: vendor,
        value: 2,
      })

      res = await result
      res.logs.forEach((args, idx) => {
        switch (idx) {
          case 0:
            console.log(`event emitted from Sale contract: ${args.event}`)
            console.log('======================================')
            console.table(args.args)
            break
          case 1:
            console.log(
              `event emitted from TradeStore.makeOffer contract function: ${args.event}`,
            )
            console.log('======================================')
            console.table(args.args)
            break
          default:
            console.log(args)
            break
        }
      })
      assert.equal(res.receipt.status, true)
    })
    it('Sale contract created should point to vendor', async () => {
      // res.logs[1].args["0"] contains salesContract address
       // return sale contract address instead of contract
      let contractAddr = await xInstance.contractToVendor(
        res.logs[1].args['0'],
        vendor,
      )
      assert.equal(contractAddr, res.logs[1].args['0'])
    })
    it('contract should be availabe in availableTradeAgreement', async () => {
      // return sale contract address instead of contract
      let result = await xInstance.availableTradeAgreement(
        res.logs[1].args['0'],
      )
      assert.equal(result, res.logs[1].args['0'])
    })

    it('vendor contract count should be equal to 1', async () => {
      let result = await xInstance.vendorContractCount(vendor)
      assert.equal(result.words[0], 1)
    })
    it('totalSalesPending shouble be equal to 1', async () => {
      let result = await xInstance.totalSalesPending()
      assert.equal(result.words[0], 1)
    })
    it('terminated should return false', async () => {
      let result = await xInstance.terminated(res.logs[1].args['0'])
      assert.equal(result, false)
    })
  })
})
