const TradeStore = artifacts.require('TradeStore')
const Web3 = require('web3')
function toEth(n) {
  return Web3.utils.toWei(`${n}`, 'Ether')
}
contract('TradeStore Contract :', ([owner, vendor, customer, customer2]) => {
  xcontext('test6', () => {
    let xInstance, result
    before(async () => {
      //   get TradeStore contract instance
      xInstance = await TradeStore.new()
    })

    it('_owner should equal owner', async () => {
      let _owner = await xInstance.owner()
      assert.equal(_owner, owner)
    })

    it('vendor creates a sale contract & return some events from both Trade Contract and Sale Contract', async () => {
      // xRes value is a result object
      let xRes = await xInstance.makeOffer(toEth(5), toEth(15), {
        from: vendor,
        value: toEth(5),
      })
      result = await xRes
      assert.equal(xRes.receipt.status, true)
    })
    // customer signs agreement
    // contract use result.logs[1].args["0"] to access
    // sale contract address, customer will be binded by.
    it('Customer pays for product advertised by vendor', async () => {
      let xRes = await xInstance.acceptOffer(result.logs[1].args['0'], toEth(15), {
        from: customer,
        value: toEth(15),
      })
      console.table(xRes.logs[0])
      assert.equal(xRes.receipt.status, true)
    })
    it('Binding sale contract created should point to customer', async () => {
      // result.logs[1].args["0"] contains salesContract address
      // return sale contract address instead of contract
      let contractAddr = await xInstance.contractToCustomer(
        result.logs[1].args['0'],
        customer,
      )
      assert.equal(contractAddr, result.logs[1].args['0'])
    })

    it('Customer contract count should be equal to 1', async () => {
      let result = await xInstance.customerContractCount(customer)
      assert.equal(result.words[0], 1)
    })
    it('TotalSalesPending shouble be equal to 0', async () => {
      let result = await xInstance.totalSalesPending()
      assert.equal(result.words[0], 0)
    })
    it('TotalSalesBinding shouble be equal to 1', async () => {
      let result = await xInstance.totalSalesBinding()
      assert.equal(result.words[0], 1)
    })
    it('Terminated should return false', async () => {
      let res = await xInstance.terminated(result.logs[1].args['0'])
      assert.equal(res, false)
    })

    it('Customer should conclude a binding agreement', async () => {
      let xAddr = result.logs[1].args['0']
      let res = await xInstance.agreementConclude(xAddr, { from: customer })
      console.table(res.logs[0].args["_message"])
      assert.equal(res.receipt.status, true)
    })

    it('Vendor withdraw ether from concluded agreement', async () => {
      let xAddr = result.logs[1].args['0']
      let res = await xInstance.getPaid(xAddr, { from: vendor })
      console.log('===================================================')
      console.table(res.logs[0])
      console.table(res.logs[1])
      assert.equal(res.receipt.status, true)
    })

    it('TotalBinding sales should be equal to 0', async () => {
      let res = await xInstance.totalSalesBinding()
      assert.equal(res.words[0], 0)
    })

    it('Total sales  succeded should be equal to 1', async () => {
      let res = await xInstance.totalSalesSucceeded()
      assert.equal(res.words[0], 1)
    })

    it('Customer pays for product advertised by vendor which is already bought by someone else', async () => {
      try {
        let xRes = await xInstance.acceptOffer(
          result.logs[1].args['0'],
          toEth(5),
          {
            from: customer2,
            value: toEth(5),
          },
        )
        console.table(xRes.logs[0])
        assert.equal(xRes.receipt.status, true)
      } catch (err) {
        console.error(err.message)
        assert(err.message.includes('revert'))
        
      }
    })
    it('Get sales contract sale price of terminated contract', async () => {
        try {
            let address = result.logs[1].args['0']
            let res = await xInstance.getSalePrice(address)
            console.log(`sale price : ${res}`)
            assert.equal(res, toEth(5))
        } catch (err) {
           console.error(err.message)
           assert(err.message.includes('revert'))
        }
    })
  })
})
