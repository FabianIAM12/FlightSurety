var Test = require('../config/testConfig.js');
const truffleAssert = require('truffle-assertions');

contract('Flight Surety Tests', async (accounts) => {
    const zeroEther = web3.utils.toWei('0', 'ether');
    const oneEther = web3.utils.toWei('1', 'ether');
    const twoEther = web3.utils.toWei('2', 'ether');
    const fiveEther = web3.utils.toWei('5', 'ether');
    const tenEther = web3.utils.toWei('10', 'ether');
    const twelveEther = web3.utils.toWei('12', 'ether');

    const TEST_COUNT = 5;

    const STATUS_CODE_UNKNOWN = 0;
    const STATUS_CODE_ON_TIME = 10;
    const STATUS_CODE_LATE_AIRLINE = 20;
    const STATUS_CODE_LATE_WEATHER = 30;
    const STATUS_CODE_LATE_TECHNICAL = 40;
    const STATUS_CODE_LATE_OTHER = 50;

    const flightList = [
        {"name": "Flight 123",
        "isRegistered": true,
        "statusCode": 0,
        "timestamp": 1363211600,
        "address": accounts[2],
        "from": "YAD", "to": "MUC"},
        {"name": "Flight 678",
         "isRegistered": true,
         "statusCode": 0,
         "timestamp": 1116385200,
         "address": accounts[3],
         "from": "CAI", "to": "MUC"
        }];

    var contract;
    before('setup contract', async () => {
        contract = await Test.Config(accounts);
        await contract.flightSuretyData.authorizeCallerContract(contract.flightSuretyApp.address);
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

        assert.equal(res.length, flightList.length, "Was not able to create");
    });

    /* */
    /* buy insurance */
    /* */

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
    it("buy insurance with too much ether", async () => {
        const flight = flightList[0];
        const passenger = accounts[8];
        let reverted = false;

        try {
            await contract.flightSuretyApp.buyFlightInsurance(flight.address, flight.name, flight.timestamp,
                {from: passenger, value: twoEther });
        } catch (e) {
            reverted = true;
        }

        assert.equal(reverted, false, "Should be not reverted");
    });

    it("buy insurance for a flight", async () => {
        let flight = flightList[0];
        let passenger = accounts[6];

        await contract.flightSuretyApp.buyFlightInsurance(flight.address, flight.name, flight.timestamp,
            {from: passenger, value: oneEther});

        let amount = await contract.flightSuretyApp.insuredAmount.call(flight.address, flight.name, flight.timestamp,
            {from: passenger});

        assert.equal(amount, oneEther, "Was insured for 1 ether");
    });

    /* */
    /* oracles */
    /* */
    it("should register multiple oracles", async () => {
        let fee = await contract.flightSuretyApp.REGISTRATION_FEE.call();
        let registered = true;

        try {
            for (let i = 1; i < TEST_COUNT; i++) {
                await contract.flightSuretyApp.registerOracle({from: accounts[i], value: fee});
                let indexes = await contract.flightSuretyApp.getMyIndexes.call({from: accounts[i]});
                console.log(`oracle ${i} indexes ${indexes}`);
            }
        }
        catch (e) {
            registered = false;
        }
        assert.equal(registered, true, "Unable to register all oracles");
    });

    it('can request flight status', async () => {
        let flight = 'ND1322';
        let timestamp = Math.floor(Date.now() / 1000);

        // Submit a request for oracles to get status information for a flight
        await contract.flightSuretyApp.fetchFlightStatus(contract.firstAirline, flight, timestamp);

        // Since the Index assigned to each test account is opaque by design
        // loop through all the accounts and for each account, all its Indexes
        // and submit a response. The contract will reject a submission if it was
        // not requested so while sub-optimal, it's a good test of that feature
        for(let i = 1; i < TEST_COUNT; i++) {
            // Get oracle information
            let oracleIndexes = await contract.flightSuretyApp.getMyIndexes.call({ from: accounts[i]});
            for (let i = 0; i < 3; i++) {
                try {
                    // Submit a response...it will only be accepted if there is an Index match
                    await contract.flightSuretyApp.submitOracleResponse(oracleIndexes[i],
                        contract.firstAirline,
                        flight,
                        timestamp,
                        STATUS_CODE_ON_TIME,
                        { from: accounts[i] });
                }
                catch(e) {
                    // Enable this when debugging
                    console.log('\nError', i, oracleIndexes[i].toNumber(), flight, timestamp);
                }
            }
        }
    });
});
