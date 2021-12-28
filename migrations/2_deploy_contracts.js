const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs');

module.exports = async (deployer) => {
    // this is account #1 (#0 is deployer)
    let firstAirline = '0xD5668ff8F82Db63481ECaA0cfCB6F400Cdc27859';
    let firstAirlineName = 'Lufthansa';

    await deployer.deploy(FlightSuretyData, firstAirline, firstAirlineName);
    let data = await FlightSuretyData.deployed();

    await deployer.deploy(FlightSuretyApp, data.address);
    let app = await FlightSuretyApp.deployed();

    await data.authorizeCallerContract(app.address);

    // get the gas limit
    let block = await web3.eth.getBlock("latest");

    let config = {
        localhost: {
            url: 'http://localhost:7545',
            dataAddress: data.address,
            appAddress: app.address,
            gas: block.gasLimit
        }
    };

    fs.writeFileSync(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '  '), 'utf-8');
    fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '  '), 'utf-8');
};