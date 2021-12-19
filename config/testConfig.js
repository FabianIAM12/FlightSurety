var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require('bignumber.js');

var Config = async function(accounts, name) {
    
    // These test addresses are useful when you need to add
    // multiple users in test scripts
    let testAddresses = [
        "0x2bBBdA0d585DbA957661899f8C6c6863398dFec6",
        "0xC34E3dC6Ad129e56539FC2428e612c654bCd5336",
        "0x43bD5B02ab329616862a93e7cCBbaE3a1b4C3784",
        "0xa8d7FBa9AB2F11CaeC09363e5FAACCFa00974242",
        "0xEab1acdE30ee99b77f960b340b718CCf7DAfcfe9",
        "0xf82d48ac4CC20A1694019E87eD163F9e7d085615",
        "0xD16C6aADC645119074BaAAc934f8346A21BAAaC8",
        "0x93C7f4FD5EED9048ED790C8d83c434fcc5B328ef",
        "0xB63dB617cdEa3CDF19770f5d79415C48bE1284A9",
        "0x343A5cE787C13EE24dD8895e6a0EB5Be4ce392eB",
    ];

    let owner = accounts[0];
    // should be acount[1], but there is no ether locally
    let firstAirline = accounts[1];
    let firstAirlineName = "Lufthansa";

    let flightSuretyData = await FlightSuretyData.new(firstAirline, firstAirlineName);
    let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address);

    return {
        owner: owner,
        firstAirline: firstAirline,
        weiMultiple: (new BigNumber(10)).pow(18),
        testAddresses: testAddresses,
        flightSuretyData: flightSuretyData,
        flightSuretyApp: flightSuretyApp
    }
}

module.exports = {
    Config: Config
};