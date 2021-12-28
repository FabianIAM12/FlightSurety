var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "reason step beach enemy awful stable manage whisper month soup you elder";

module.exports = {
  networks: {
    development: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:7545/", 0, 50);
      },
      network_id: '*',
      gasPrice: 10000000,
      gasLimit: 5000000000000
    }
  },
  compilers: {
    solc: {
      version: "^0.5.11",
    }
  }
};
