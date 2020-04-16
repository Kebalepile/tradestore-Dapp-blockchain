const TradeStore = artifacts.require('TradeStore')
const Web3 = require('web3')

function toEth(n) {
  return Web3.utils.toWei(`${n}`, 'Ether')
}

contract('TradeStore contract', ([owner, vendor, customer]) => {
  xcontext('test4', () => {
    let xInstance, result
    before(async () => {
      xInstance = await TradeStore.new()
    })
    it('Owner should equal owner', async () => {
      let _owner = await xInstance.owner()
      assert.equal(_owner, owner)
    })
    //   it("Get owner account balance", async () => {
    //   let xRes = await xInstance.balance( {from: owner})
    //   console.log("Owner balance")
    //   console.log(xRes)
    //   console.table(xRes.words)
    //  })

    it('Vendor creates a new sale contract', async () => {
      // xRes value is a result object
      let xRes = await xInstance.makeOffer(toEth(2), toEth(5), {
        from: vendor,
        value: toEth(2),
      })
      result = await xRes
      assert.equal(xRes.receipt.status, true)
    })
    it('Get sales contract sale price', async () => {
      let address = result.logs[1].args['0']
      let res = await xInstance.getSalePrice(address)
      console.log(`sale price : ${res}`)
      assert.equal(res, toEth(5))
    })
    it('Get sales Contract balance', async () => {
      let address = result.logs[1].args['0']
      let xRes = await xInstance.contractBalance(address)
      console.log(`balance on a non-binding contract ${xRes}`)
      assert.equal(xRes, toEth(2))
    })
    it('Customer pays for product advertised by vendor', async () => {
      let xRes = await xInstance.acceptOffer(result.logs[1].args['0'], toEth(5), {
        from: customer,
        value: toEth(5),
      })
      console.table(xRes.logs[0])
      assert.equal(xRes.receipt.status, true)
    })
     it('Get sales Contract balance', async () => {
      let address = result.logs[1].args['0']
      let xRes = await xInstance.contractBalance(address)
      console.log(` balance of binding contract  ==> ${xRes}`)
      assert.equal(xRes, toEth(7))
    })
     
    it('Get contract owner', async () => {
      let address = result.logs[1].args['0']
      let xRes = await xInstance.getOwner(address)
      let yRes = await xInstance.getOwner(address)
      console.log(` sale contract owner ==> ${xRes}`)
      xRes === owner && yRes === owner
        ? assert.equal(true, true)
        : assert.equal(true, false)
    })
   
  })
})
