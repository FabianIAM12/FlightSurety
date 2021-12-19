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
        "0xE44c4cf797505AF1527B11e4F4c6f95531b4Be24",
        "0x69e1CB5cFcA8A311586e3406ed0301C06fb839a2",
        "0xF014343BDFFbED8660A9d8721deC985126f189F3",
        "0x0E79EDbD6A727CfeE09A2b1d0A59F7752d5bf7C9",
        "0x9bC1169Ca09555bf2721A5C9eC6D69c8073bfeB4",
        "0xa23eAEf02F9E0338EEcDa8Fdd0A73aDD781b2A86",
        "0xc449a27B106BE1120Bd1Fd62F8166A2F61588eb9",
        "0xF24AE9CE9B62d83059BD849b9F36d3f4792F5081",
        "0xc44B027a94913FB515B19F04CAf515e74AE24FD6",
        "0xcb0236B37Ff19001633E38808bd124b60B1fE1ba",
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