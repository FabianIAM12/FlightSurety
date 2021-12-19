var Test = require('../config/testConfig.js');
const truffleAssert = require('truffle-assertions');

contract('Flight Surety Tests', async (accounts) => {
    const zeroEther = web3.utils.toWei('0', 'ether');
    const oneEther = web3.utils.toWei('1', 'ether');
    const twoEther = web3.utils.toWei('2', 'ether');
    const fiveEther = web3.utils.toWei('5', 'ether');
    const tenEther = web3.utils.toWei('10', 'ether');
    const twelveEther = web3.utils.toWei('12', 'ether');

    const flightList = [{"name": "Flight 123",
        "isRegistered": true,
        "statusCode": 0,
        "timestamp": 1366381600,
        "address": accounts[2],
        "from": "YAD", "to": "MUC"},
        {"name": "Flight 678",
            "isRegistered": true,
            "statusCode": 0,
            "timestamp": 1266385200,
            "address": accounts[3],
            "from": "CAI", "to": "321"
        }];

    var contract;
    before('setup contract', async () => {
        contract = await Test.Config(accounts);
        await contract.flightSuretyData.authorizeCaller(contract.flightSuretyApp.address);
    });

    /****************************************************************************************/
    /* Operations and Settings                                                              */
    /****************************************************************************************/

    it(`(multiparty) has correct initial isOperational() value`, async function () {
        let status = await contract.flightSuretyData.isOperational.call();
        assert.equal(status, true, "Incorrect initial operating status value");
    });

    it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {
        // Ensure that access is denied for non-Contract Owner account
        let accessDenied = false;
        try {
            await contract.flightSuretyData.setOperatingStatus(false, {from: contract.testAddresses[2]});
        } catch (e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
    });

    it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {
        // Ensure that access is allowed for Contract Owner account
        let accessDenied = false;
        await contract.flightSuretyData.setOperatingStatus(false);
        try {
            await contract.flightSuretyData.setOperatingStatus(false);
        } catch (e) {
            console.log(e);
            accessDenied = true;
        }
        assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
    });

    it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {
        await contract.flightSuretyData.setOperatingStatus(false);
        let reverted = false;
        try {
            await contract.flightSuretyData.fundAirline(contract.firstAirline, fiveEther, {from: contract.flightSuretyApp.address});
        }
        catch (e) {
            reverted = true;
        }
        assert.equal(reverted, true, "Access not blocked for requireIsOperational");
        // Set it back for other tests to work
        await contract.flightSuretyData.setOperatingStatus(true);
    });

    it("(first airline) is registered but not funded", async () => {
        let result = await contract.flightSuretyData.isAirlineRegistered.call(contract.firstAirline,
            {from: contract.flightSuretyApp.address});

        // ASSERT
        assert.equal(result[0], true, "First airline is registered when the contract is deployed");
        assert.equal(result[1], 1, "First airline is the only registered airline");

        result = await contract.flightSuretyData.isAirlineFunded.call(contract.firstAirline,
            {from: contract.flightSuretyApp.address});

        // ASSERT
        assert.equal(result[0], false, "First airline is not automatically funded when the contract is deployed");
        assert.equal(result[1], 0, "There are no funded airlines");
    });

    it("(airline) is not funded if it sends less than 10 ether", async () => {
        await contract.flightSuretyApp.fundAirline({from: contract.firstAirline, value: fiveEther});
        let result = await contract.flightSuretyData.isAirlineFunded.call(contract.firstAirline, {from: contract.flightSuretyApp.address});

        assert.equal(result[0], false, "Airline has not sent enough ether to be funded");
    });

    it("(airline) cannot register an Airline using registerAirline() if it is not funded", async () => {
        const newAirline = accounts[3];
        let reverted = false;

        try {
            await contract.flightSuretyApp.registerAirline(newAirline, "Wizzi Airline", {from: contract.flightSuretyApp.address});
        } catch (e) {
            reverted = true;
        }
        assert.equal(reverted, true, "Should be reverted");

        let result = await contract.flightSuretyData.isAirline.call(newAirline, {from: contract.flightSuretyApp.address});
        assert.equal(result, false, "Airline should not be able to do this")
    });

    /* */
    /* founding airlines */
    /* */

    it("airline is funded if it sends 10 or more ether", async () => {
        await contract.flightSuretyApp.fundAirline({from: contract.firstAirline, value: tenEther});
        let result = await contract.flightSuretyData.isAirlineFunded.call(contract.firstAirline, {from: contract.flightSuretyApp.address});
        assert.equal(result[0], true, "Airline has sent enough ether to be funded");
    });

    it("(airline) can register other airlines using registerAirline()", async () => {
        const one = accounts[2];
        const two = accounts[3];

        await contract.flightSuretyApp.registerAirline(one, 'Airline One', {from: contract.firstAirline});
        await contract.flightSuretyApp.registerAirline(two, 'Airline Two', {from: contract.firstAirline});

        await contract.flightSuretyApp.fundAirline({from: one, value: tenEther});
        await contract.flightSuretyApp.fundAirline({from: two, value: tenEther});

        let result1 = await contract.flightSuretyData.isAirlineFunded.call(one, {from: contract.flightSuretyApp.address});
        let result2 = await contract.flightSuretyData.isAirlineFunded.call(two, {from: contract.flightSuretyApp.address});

        assert.equal(result1[0] && result2[0], true, "Airline had not enough ether to be funded");
    });

    it("should register multiple flights", async () => {
        const res = [];
        for (let flight of flightList) {
            const result = await contract.flightSuretyApp.registerFlight(flight.name, flight.address, {from: flight.address});
            res.push(result);
        }

        assert.equal(res.length, flightList.length, "Airline has the same much entries");
    });

    // buy insurence without money
    it("should not be possible to buy without paying", async () => {
        const passenger = accounts[8];
        const selectedFlight = flightList[0];
        let reverted = false;

        try {
            await contract.flightSuretyApp.buyFlightInsurance(selectedFlight.address, selectedFlight.name, selectedFlight.timestamp,
                {from: passenger, value: zeroEther});
        } catch (e) {
            reverted = true;
        }

        assert.equal(reverted, true, "Should be reverted");
    });

    // buy insurence with money
    it("should be possible to buy insurence with enough ether", async () => {
        const passenger = accounts[8];
        const selectedFlight = flightList[0];
        let reverted = false;

        try {
            await contract.flightSuretyApp.buyFlightInsurance(selectedFlight.address, selectedFlight.name, selectedFlight.timestamp,
                {from: passenger, value: oneEther});
        } catch (e) {
            console.log(e)
            reverted = true;
        }

        assert.equal(reverted, false, "Should be not reverted");
    });

});

const expectToRevert = (promise, errorMessage) => {
    return truffleAssert.reverts(promise, errorMessage);
};

const expectToFail = (promise, errorMessage) => {
    return truffleAssert.fails(promise, errorMessage);
};
