const env = require('dotenv').config()["parsed"]
const Web3 = require("web3")
const HDWalletProvider = require('truffle-hdwallet-provider')
const ganache = require('ganache-cli')

const ropstenNetwork = "https://ropsten.infura.io/Ufdlod6ilFQfJwtGTz92"
// const seed_words = env["SEED_CODE"]
const seed_words = "butter ball wall chapter ski monster impact avoid domain left carry viable"

const ropstenProvider = new HDWalletProvider(seed_words, ropstenNetwork)
const web3 = new Web3()

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: ropstenProvider,
      gas: 4600000,
      network_id: "3",
    },
    coverage: {
      host: "localhost",
      network_id: "*",
      port: 8555,
      gas: 0xfffffffffff,
      gasPrice: 0x01
  }
  }
};