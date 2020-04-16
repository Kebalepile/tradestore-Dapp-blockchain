import React, { useEffect, useState } from 'react'
import './App.css'
import Web3 from 'web3'
import TradeStore from './abis/TradeStore.json'
/*
exercise borrow owner 
budget enlist useless 
element base roof uncover choose spice
*/
function App() {
  const [state, setState] = useState({
    account: '',
    balance: 0,
    tradeStore: undefined,
  })
  useEffect(() => {
    loadWeb3()
    loadblockchainData()
  }, [])
  const  {account, balance} = state
  const pendingSales = async (tradeStore, account) => {
    console.log(account)
    try{
        let vendorContractCount = await tradeStore.methods.vendorContractCount(account).call()
        let customerContractCount = await tradeStore.methods.customerContractCount(account).call()
        console.log(`vendor contract count ==> ${vendorContractCount}`)
        console.log(`customer contract count ===> ${customerContractCount}`)
    } catch (err) {
      console.error(err)
    }
  }
  const loadWeb3 = async () => {
    if (window.web3) {
      window.web3 = new Web3(Web3.givenProvider || "ws://localhost:9545")
    } else {
      window.alert(
        'Non-Ethereum browser detected. You should consider trying MetaMask!',
      )
    }
  }

  const loadblockchainData = async () => {
    try {
      // get web3 instance
      let web3 = await window.web3,
        accounts = await web3.eth.getAccounts(),
        balance = await web3.eth.getBalance(accounts[0])

      // load trade contract instance and get network proivder
        // load tradestore
      let networkId = await web3.eth.net.getId(),
        tradeStoreData = await TradeStore["networks"][networkId]
      if (tradeStoreData) {
        // connect to tradeStore contract
        const tradeStore = new web3.eth.Contract(
          TradeStore["abi"],
          tradeStoreData["address"]
        )
        setState({...state, account: accounts[0], balance: balance,tradeStore})
        pendingSales(tradeStore,accounts[0])
      } else {
        window.alert('Token contract not deployed to detected network.')
      }
    } catch (err) {
      console.error(err)
    }
  }
  return (
    <div className="App">
      <h1>
        {account.length > 0
          ? `account address is ${account} and balance is ${balance}`
          : `Hello World`}
      </h1>
    </div>
  )
}

export default App
