/*
const Test = require("../config/testConfig.js");

contract('Insurance Tests', async (accounts) => {
    const halfEther = web3.utils.toWei("0.5", "ether");
    const oneEther = web3.utils.toWei("1", "ether");
    const oneHalfEther = web3.utils.toWei("1.5", "ether");
    const twoEther = web3.utils.toWei("2", "ether");
    const tenEther = web3.utils.toWei("10", "ether");
    const diffAmount = web3.utils.toWei("100", "milli");
    const testFlight = "Flight 101";
    const testTimestamp = 1566359629;

    let contract;
    before("setup contract", async () => {
        contract = await Test.Config(accounts);
        // await contract.flightSuretyData.authorizeCaller(contract.flightSuretyApp.address);
    });

    it("(airline) can register three airlines using registerAirline()", async () => {
        const airlineOne = accounts[1];
        await contract.flightSuretyApp.fundAirline(airlineOne, tenEther);

        let result = await contract.flightSuretyData.isAirlineFunded.call(airlineOne, { from: contract.flightSuretyApp.address });
    });

    it("register flights", async () => {
        let registered = 0;
        for (let flight of Flights) {
            await config.flightSuretyApp.registerFlight(flight.name, flight.timestamp, {from: flight.address});
            registered += 1;
        }

        assert.equal(registered, Flights.length, "unable to register some flights");
    });

    it("buy insurance for a flight: send no money", async () => {
        let flight = Flights[0];
        let passenger = accounts[10];

        let cannotbuy = false;

        try {
            await config.flightSuretyApp.buyInsurance(flight.address, flight.name, flight.timestamp,
                {from: passenger, value: 0});
        }
        catch (e) {
            cannotbuy = true;
        }

        assert.equal(cannotbuy, true, "Should not be able to buy with too no money");
    });

    it("buy insurance for a flight: send 0.5 ether", async () => {
        let flight = Flights[0];
        let passenger = accounts[10];

        await config.flightSuretyApp.buyInsurance(flight.address, flight.name, flight.timestamp,
            {from: passenger, value: halfEther});

        let amount = await config.flightSuretyApp.insuredAmount.call(flight.address, flight.name, flight.timestamp,
            {from: passenger});

        assert.equal(amount, halfEther, "Was not insured for under 1 ether");
    });

    it("buy insurance for a flight: send 2 ether but only 1 ether is insured", async () => {
        let flight = Flights[1];
        let passenger = accounts[10];

        let before = await web3.eth.getBalance(passenger);

        await config.flightSuretyApp.buyInsurance(flight.address, flight.name, flight.timestamp,
            {from: passenger, value: twoEther});

        let after = await web3.eth.getBalance(passenger);

        let amount = await config.flightSuretyApp.insuredAmount.call(flight.address, flight.name, flight.timestamp,
            {from: passenger});

        // console.log(before, (after + oneEther) - before);

        assert.equal(amount, oneEther, "Was not insured for over 1 ether properly");
    });

    it("cannot buy insurance for the same flight twice", async () => {
        let flight = Flights[1];
        let passenger = accounts[10];

        let failed = false;

        try {
            await config.flightSuretyApp.buyInsurance(flight.address, flight.name, flight.timestamp,
                {from: passenger, value: twoEther});
        }
        catch(e) {
            failed = true;
        }

        assert.equal(failed, true, "Should not have been able to buy insurance for the same flight twice.");
    });

    it("register twenty oracles", async () => {
        let base = 29;
        let oracles = 20;
        let fee = await config.flightSuretyApp.REGISTRATION_FEE.call();

        let registered = true;

        try {
            for (let i = 0; i < oracles; i++) {
                await config.flightSuretyApp.registerOracle({from: accounts[base+i], value: fee});
                // let indexes = await config.flightSuretyApp.getMyIndexes.call({from: accounts[base+i]});
                // console.log(`oracle ${i} indexes ${indexes}`);
            }
        }
        catch (e) {
            registered = false;
        }

        assert.equal(registered, true, "Unable to register all oracles");
    });

    // this part is from test/oracle.js
    it("request flight status and reply with 20", async () => {
        let flight = Flights[1];
        let base = 29;
        let oracles = 20;

        await config.flightSuretyApp.fetchFlightStatus(flight.address, flight.name, flight.timestamp);

        // ideally we should listen for the OracleRequest event, find the index, and use the
        // appropriate oracle to respond.
        for (let i = 0; i < oracles; i++) {
            let oracleIndexes = await config.flightSuretyApp.getMyIndexes.call({from: accounts[base+i]});
            for (let idx = 0; idx < 3; idx++) {
                try {
                    await config.flightSuretyApp.submitOracleResponse(oracleIndexes[idx], flight.address,
                        flight.name, flight.timestamp,
                        20, {from: accounts[base+i]});
                }
                catch(e) {
                    // console.log(`Error ${idx} ${oracleIndexes[idx].toNumber()}, ${flight.name}, ${flight.timestamp}`);
                }
            }
        }
    });

    it("passenger gets a refund of 1.5x what they put in and has no amount insured for the flight", async () => {
        let flight = Flights[1];
        let passenger = accounts[10];

        // nothing is insured now, money moved to payout.
        let amount = await config.flightSuretyApp.insuredAmount.call(flight.address, flight.name, flight.timestamp,
            {from: passenger});
        assert.equal(amount.toNumber(), 0, `Nothing should be left to pay out for flight ${flight.name}`);


        let before = await web3.eth.getBalance(passenger);
        let tx = await config.flightSuretyApp.payPassenger({from: passenger});
        let after = await web3.eth.getBalance(passenger);

        // console.log(after-before, oneHalfEther);
        // console.log(tx);

    });

    it("confirm that the other flight is still insured for", async () => {
        let passenger = accounts[10];
        let flight = Flights[0];

        let amount = await config.flightSuretyApp.insuredAmount.call(flight.address, flight.name, flight.timestamp,
            {from: passenger});

        assert.equal(amount, halfEther, "Should be 0.5 ether");
    });
});
*/