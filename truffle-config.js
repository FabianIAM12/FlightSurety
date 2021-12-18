var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "wonder harvest secret noise truck clock slice snake dilemma cotton task color";

module.exports = {
  networks: {
    development: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:1234/", 0, 50);
      },
      network_id: '*',
      gasPrice: 10000000,
      gasLimit: 5000000000000
    }
  },
  compilers: {
    solc: {
      // version: "^0.4.24",
      version: "^0.5.11",
    }
  }
};
