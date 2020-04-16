const TradeStore = artifacts.require('TradeStore')
const Web3 = require('web3')
function toEth(n) {
  return Web3.utils.toWei(`${n}`, 'Ether')
}
contract('TradeStore Contract :', ([owner, vendor]) => {
  xcontext('test 2', () => {
     let xInstance, result
    before(async () => {
      xInstance = await TradeStore.new()
    })
    it('_owner should equal owner', async () => {
      let _owner = await xInstance.owner()
      assert.equal(_owner, owner)
    })

    it('Vendor creates 2 a sale contract & return some events from both Trade Contract and Sale Contract', async () => {
      // let result;
      let saleContracts = []
      let count = 0
      while (count < 2) {
        // do somthing
        saleContracts.push(
          await xInstance.makeOffer(toEth(2), toEth(5), {
            from: vendor,
            value: toEth(2),
          }),
        )
        count++
      }

      result = await saleContracts
      saleContracts.forEach(_contract => {
        _contract.logs.forEach((args, idx) => {
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
        assert.equal(_contract.receipt.status, true)
      })
    })

    it('Both Sale contract created should point to vendor', async () => {
      // res is an array of results
      await result.forEach(async result => {
        // result.logs[1].args["0"] contains salesContract address
        //return value will be sale contract address instead of contract object
        let contractAddr = await xInstance.contractToVendor(
          result.logs[1].args['0'],
          vendor,
        )
        assert.equal(contractAddr, result.logs[1].args['0'])
      })
    })

    it('Both sale contract should be availabe in availableTradeAgreement', async () => {
      await result.forEach(async result => {
        let resultAddress = result.logs[1].args['0']
        // return sale contract address instead of contract
        let xAddress = await xInstance.availableTradeAgreement(
          resultAddress,
        )
        assert.equal(resultAddress, xAddress)
      })
    })

    it('Vendor contract count should be equal to 2', async () => {
      let result = await xInstance.vendorContractCount(vendor)
      assert.equal(result.words[0], 2)
      // console.dir(result)
    })

    it('TotalSalesPending should be equal to 2', async () => {
      let res = await xInstance.totalSalesPending()
      assert.equal(res.words[0], 2)
    })

    it('Terminated should return false for both contracts', async () => {
      await result.forEach(async result => {
        let x = await xInstance.terminated(result.logs[1].args['0'])
        assert.equal(x, false)
      })
    })
  })
})
