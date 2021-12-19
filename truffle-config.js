var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "judge angry member candy bean hollow pattern unfair simple trash cram month";

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
      // version: "^0.4.24",
      version: "^0.5.11",
    }
  }
};
