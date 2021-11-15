var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "sick author dose call ostrich twist dismiss favorite fox link flip present";

module.exports = {
  networks: {
    development: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:1234/", 0, 50);
      },
      network_id: '*',
      gas: 2000000
    }
  },
  compilers: {
    solc: {
      version: "^0.4.24"
    }
  }
};
