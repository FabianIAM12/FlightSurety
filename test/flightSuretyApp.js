var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');
const expect = require('chai').expect;
const truffleAssert = require('truffle-assertions');

contract('Flight Surety Tests', async (accounts) => {
    const firstAirline = 'Lufthansa';
    const secondAirline = 'WizzAir';
    const thirdAirline = 'PacificAir';
    const fourthAirline = 'Pan Am';
    const fifthAirline = 'Sinai Air';

    const flightNumberOne = web3.utils.utf8ToHex('LT3214');
    const flightNumberTwo = web3.utils.utf8ToHex('LT3224');
    const flightNumberThree = web3.utils.utf8ToHex('LT3234');

    const owner = accounts[0];
    const tenEther = web3.utils.toWei('0.00000001', 'ether');
    const oneEther = web3.utils.toWei('0.0000000001', 'ether');
    const zeroAddress = '0x0000000000000000000000000000000000000000';

    var contract;
    before('setup contract', async () => {
        contract = await Test.Config(accounts, web3.utils.utf8ToHex(firstAirline), {from:owner});
        await contract.flightSuretyData.authorizeCaller(contract.flightSuretyApp.address);

        await contract.flightSuretyData.authorizeContract(contract.flightSuretyApp.address, {from: owner});
        await contract.flightSuretyData.authorizeContract(owner, {from: owner});
    });

    /****************************************************************************************/
    /* Operations and Settings                                                              */
    /****************************************************************************************/

    /*
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
        try {
            await contract.flightSuretyData.setOperatingStatus(false);
        } catch (e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
    });

    it('should NOT allow unauthorized users to setOperatingStatus', async () => {
        await expectToRevert(contract.flightSuretyApp.setOperatingStatus(false, {from: accounts[1]}), 'Caller is not contract owner');
    });

    it('should NOT allow to setOperatingStatus the SAME operating status', async () => {
        await expectToRevert(contract.flightSuretyApp.setOperatingStatus(true, {from: owner}), 'Contract is already in this state');
    });

    it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {
        await contract.flightSuretyData.setOperatingStatus(false);

        let reverted = false;
        try {
            await contract.flightSurety.setTestingMode(true);
        } catch (e) {
            reverted = true;
        }
        assert.equal(reverted, true, "Access not blocked for requireIsOperational");

        // Set it back for other tests to work
        await contract.flightSuretyData.setOperatingStatus(true);
    });

    it('airline cannot register an Airline using registerAirline() if it is not funded', async () => {
        let newAirline = accounts[2];

        try {
            await contract.flightSuretyApp.registerAirline(newAirline,
                web3.utils.utf8ToHex(secondAirline),
                {from: contract.firstAirline});
        } catch (e) {
        }

        let result = await contract.flightSuretyData.isAirline(newAirline);
        assert.equal(result[1], false, "Airline should not be able to register another airline if it hasn't provided funding");
    });

    it('should allow only a validated (funded) airline to registerAirline another airline', async () => {
        let tx = await contract.flightSuretyApp.registerAirline(accounts[1], web3.utils.utf8ToHex(secondAirline), {from: owner});

        truffleAssert.eventEmitted(tx, 'AirlineRegistered', (ev) => {
            return expect(ev.airline).to.deep.equal(accounts[1]) && expect(Number(ev.votes)).to.equal(Number(1));
        });

        tx = await contract.flightSuretyApp.fundAirline({from: accounts[1], value: tenEther});
        truffleAssert.eventEmitted(tx, 'AirlineFunded', (ev) => {
            return expect(ev.airline).to.deep.equal(accounts[1]) && expect(Number(ev.value)).to.deep.equal(Number(tenEther));
        });
    });

    it('should NOT allow validated airlines to register an already validated airline', async() => {
        await expectToRevert(contract.flightSuretyApp.registerAirline(accounts[1], web3.utils.utf8ToHex(secondAirline),{from: owner}), 'Airline is already validated');
    });

    it('(multi-party consensus) should ask for consensus before accepting validation/funding', async() => {
        // register total of 4 airlines and check consensus for 5th one

        // Register 3rd airline
        let tx = await contract.flightSuretyApp.registerAirline(accounts[2], web3.utils.utf8ToHex(thirdAirline),{from: accounts[1]});
        truffleAssert.eventEmitted(tx, 'AirlineRegistered', (ev) => {
            return expect(ev.airline).to.deep.equal(accounts[2]) && expect(Number(ev.votes)).to.equal(Number(1));
        });

        tx = await contract.flightSuretyApp.fundAirline({from: accounts[2], value: tenEther});
        truffleAssert.eventEmitted(tx, 'AirlineFunded', (ev) => {
            return expect(ev.airline).to.deep.equal(accounts[2]) && expect(Number(ev.value)).to.deep.equal(Number(tenEther));
        });

        // Register 4th airline
        tx = await contract.flightSuretyApp.registerAirline(accounts[3], web3.utils.utf8ToHex(fourthAirline),{from: accounts[2]});
        truffleAssert.eventEmitted(tx, 'AirlineRegistered', (ev) => {
            return expect(ev.airline).to.deep.equal(accounts[3]) && expect(Number(ev.votes)).to.equal(Number(1));
        });

        tx = await contract.flightSuretyApp.fundAirline({from: accounts[3], value: tenEther});
        truffleAssert.eventEmitted(tx, 'AirlineFunded', (ev) => {
            return expect(ev.airline).to.deep.equal(accounts[3]) && expect(Number(ev.value)).to.deep.equal(Number(tenEther));
        });

        // 5th airline would need a consensus of min 2 airlines
        tx = await contract.flightSuretyApp.registerAirline(accounts[4], web3.utils.utf8ToHex(fifthAirline),{from: owner});
        truffleAssert.eventNotEmitted(tx, 'AirlineRegistered');
        await expectToRevert(contract.flightSuretyApp.fundAirline({from: accounts[4], value: tenEther}), 'Caller is not a registered airline');

        tx = await contract.flightSuretyApp.registerAirline(accounts[4], web3.utils.utf8ToHex(fifthAirline),{from: accounts[3]});
        truffleAssert.eventEmitted(tx, 'AirlineRegistered', (ev) => {
            return expect(ev.airline).to.deep.equal(accounts[4]) && expect(Number(ev.votes)).to.equal(Number(2));
        });

        tx = await contract.flightSuretyApp.fundAirline({from: accounts[4], value: tenEther});
        truffleAssert.eventEmitted(tx, 'AirlineFunded', (ev) => {
            return expect(ev.airline).to.deep.equal(accounts[4]) && expect(Number(ev.value)).to.deep.equal(Number(tenEther));
        });
    });

    it('(multi-party consensus) should allow new voted airlines to participate in contract and increase min voters', async() => {
        // 5 validated airlines so a consensus of 3 is required
        // Register 6th airline by making accounts[2,3,4] to vouch for accounts[5] as new airline.
        let tx = await contract.flightSuretyApp.registerAirline(accounts[5], web3.utils.utf8ToHex('SixthAirline'),{from: accounts[2]});
        truffleAssert.eventNotEmitted(tx, 'AirlineRegistered');
        // as airline is not registered - accepted, it cannot fund itself
        await expectToRevert(contract.flightSuretyApp.fundAirline({from: accounts[5], value: tenEther}), 'Caller is not a registered airline');

        tx = await contract.flightSuretyApp.registerAirline(accounts[5], web3.utils.utf8ToHex('SixthAirline'),{from: accounts[3]});
        truffleAssert.eventNotEmitted(tx, 'AirlineRegistered');
        await expectToRevert(contract.flightSuretyApp.fundAirline({from: accounts[5], value: tenEther}), 'Caller is not a registered airline');

        //Attempt to simulate that multi-party doesn't count the same caller twice
        tx = await contract.flightSuretyApp.registerAirline(accounts[5], web3.utils.utf8ToHex('SixthAirline'), {from: accounts[3]});
        truffleAssert.eventNotEmitted(tx, 'AirlineRegistered');
        await expectToRevert(contract.flightSuretyApp.fundAirline({from: accounts[5], value: tenEther}), 'Caller is not a registered airline');

        //finally the 3rd valid caller will cause the 6th airline to be registered
        tx = await contract.flightSuretyApp.registerAirline(accounts[5], web3.utils.utf8ToHex('SixthAirline'), {from: accounts[4]});
        truffleAssert.eventEmitted(tx, 'AirlineRegistered', (ev) => {
            return expect(ev.airline).to.deep.equal(accounts[5]) && expect(Number(ev.votes)).to.equal(Number(3));
        });

        tx = await contract.flightSuretyApp.fundAirline({from: accounts[5], value: tenEther});
        truffleAssert.eventEmitted(tx, 'AirlineFunded', (ev) => {
            return expect(ev.airline).to.deep.equal(accounts[5]) && expect(Number(ev.value)).to.deep.equal(Number(tenEther));
        });
    });

    it('should NOT allow unauthorized users/airlines to registerFlight', async() => {
        await expectToRevert(contract.flightSuretyApp.registerFlight(flightNumberOne, 1122334455, {from: accounts[1]}), 'Caller is not a validated airline');
    });

    it('should allow validated airlines to registerFlight and verify this', async() => {
        await contract.flightSuretyApp.fundAirline({from: owner, value: tenEther});
        const f2 = await contract.flightSuretyApp.registerFlight(flightNumberOne, 1122334455, {from: owner});

        let flight = await contract.flightSuretyApp.getFlightDetails.call(flightNumberOne, {from: accounts[1]});
        expectFlightToHaveProperties(flight, owner, 'LT3214', 1122334455, 0);
    });

    it('should return the list of existing registered flights and verify this', async() => {
        // register 3 airlines (one should be enought but I can also test multiple registrations)
        await contract.flightSuretyApp.fundAirline({from: owner, value:tenEther});
        await contract.flightSuretyApp.registerAirline(accounts[1], web3.utils.utf8ToHex(secondAirline),{from: owner});
        await contract.flightSuretyApp.fundAirline({from: accounts[1], value: tenEther});
        await contract.flightSuretyApp.registerAirline(accounts[2], web3.utils.utf8ToHex(thirdAirline),{from: accounts[1]});
        await contract.flightSuretyApp.fundAirline({from: accounts[2], value: tenEther});

        // register 3 flights from 3 different companies
        await contract.flightSuretyApp.registerFlight(flightNumberOne, 1122334455, {from: owner});
        await contract.flightSuretyApp.registerFlight(flightNumberTwo, 1122334466, {from: accounts[1]});
        await contract.flightSuretyApp.registerFlight(flightNumberThree, 1122334477, {from: accounts[2]});

        // get the list of flights //they should be in the same order as registration
        const flights = await await contract.flightSuretyApp.getAllFlights.call({from: accounts[3]});
        expect(flights).to.have.lengthOf(3);

        // verify each flight from the list
        const flightOne = await contract.flightSuretyApp.getFlightDetails.call(flights[0], {from: accounts[1]});
        expectFlightToHaveProperties(flightOne, owner, 'LT3214', 1122334455, 0);

        const flightTwo = await contract.flightSuretyApp.getFlightDetails.call(flights[1], {from: accounts[1]});
        expectFlightToHaveProperties(flightTwo, accounts[1], 'LT3224', 1122334466, 0);

        const flightThree = await contract.flightSuretyApp.getFlightDetails.call(flights[2], {from: accounts[7]});
        expectFlightToHaveProperties(flightThree, accounts[2], 'LT3234', 1122334477, 0);
    }); */

    it('should allow to buyInsurance for a registered flight, transfer the eth to dataContract, credit balance of airline and emit event', async() => {
        // record passenger, dataContract and airline (credited balance) before the purchase of insurance
        const passengerWalletBalanceBefore = await web3.eth.getBalance(accounts[2]);
        const dataContractWalletBalanceBefore = await web3.eth.getBalance(contract.flightSuretyApp.address);
        const airlineBalanceBefore = await contract.flightSuretyData.getBalanceOfAirline(owner, {from: owner});

        //purchase the insurance and assert events and insurance has the correct properties
        let tx = await contract.flightSuretyApp.buyInsurance(flightNumberOne, {from: accounts[2], value: oneEther});
        truffleAssert.eventEmitted(tx, 'InsurancePurchased', (ev) => {
            return expect(ev.passenger).to.deep.equal(accounts[2])
                && expect(web3.utils.hexToUtf8(ev.flightNumber)).to.equal('LT3214')
                && expect(Number(ev.amount)).to.equal(Number(oneEther));
        });

        flightKey = (await contract.flightSuretyData.getFlightDetails.call(flightNumberOne, {from: owner}))[4];
        const insuranceKey = web3.utils.soliditySha3(accounts[2], flightKey, 0);
        const insuranceDetails = await contract.flightSuretyData.getInsuranceDetails(insuranceKey, {from: owner});

        expect(insuranceDetails[0]).to.equal(accounts[2]);
        expect(Number(insuranceDetails[1])).to.equal(Number(oneEther));
        expect(insuranceDetails[2]).to.be.false;

        // get the After balances and check if there is a 1 eth difference between them.
        /*
        const passengerWalletBalanceAfter = await web3.eth.getBalance(accounts[2]);
        const dataContractWalletBalanceAfter = await web3.eth.getBalance(dataContract.address);
        const airlineBalanceAfter = await dataContract.getBalanceOfAirline(owner, {from: owner});
        expect(Number(passengerWalletBalanceBefore) - Number(passengerWalletBalanceAfter)).to.be.above(Number(oneEther));
        expect(Number(dataContractWalletBalanceAfter) - Number(dataContractWalletBalanceBefore)).to.equal(Number(oneEther));
        expect(Number(airlineBalanceAfter) - Number(airlineBalanceBefore)).to.equal(Number(oneEther)); */
    });
});

const expectToRevert = (promise, errorMessage) => {
    return truffleAssert.reverts(promise, errorMessage);
};

const expectToFail = (promise, errorMessage) => {
    return truffleAssert.fails(promise, errorMessage);
};

const expectFlightToHaveProperties = (flight, airlineAddress, flightNumber, timeStamp, statusCode) => {
    expect(flight[0]).to.equal(airlineAddress);
    expect(web3.utils.hexToUtf8(flight[1])).to.equal(flightNumber);
    expect(Number(flight[2])).to.equal(timeStamp);
    expect(Number(flight[3])).to.equal(statusCode);
};