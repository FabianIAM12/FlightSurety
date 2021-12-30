import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';
import cors from "cors";
import "babel-polyfill";

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);

const STATUS_CODES = {
    STATUS_CODE_UNKNOWN: 0,
    STATUS_CODE_ON_TIME: 10,
    STATUS_CODE_LATE_AIRLINE: 20,
    STATUS_CODE_LATE_WEATHER: 30,
    STATUS_CODE_LATE_TECHNICAL: 40,
    STATUS_CODE_LATE_OTHER: 50
};

const Flights = [
    {"name": "Flight 1",
        "isRegistered": true,
        "statusCode": 0,
        "address": '0xD5668ff8F82Db63481ECaA0cfCB6F400Cdc27859',
        "timestamp": 1363211600,
        "from": "YAD", "to": "MUC"},
    {"name": "Flight 2",
        "isRegistered": true,
        "statusCode": 0,
        "address": '0xD5668ff8F82Db63481ECaA0cfCB6F400Cdc27859',
        "timestamp": 1222711600,
        "from": "CDG", "to": "MU2"
    },
    {"name": "Flight 3",
        "isRegistered": true,
        "statusCode": 0,
        "address": '0xD5668ff8F82Db63481ECaA0cfCB6F400Cdc27859',
        "timestamp": 1222711600,
        "from": "LKI", "to": "TGV"
    },
    {"name": "Flight 4",
        "isRegistered": true,
        "statusCode": 0,
        "address": '0xFa518198f877Cec509105e4317332D8e2d860213',
        "timestamp": 1222711600,
        "from": "MAL", "to": "IBZ"
    },
    {"name": "Flight 5",
        "isRegistered": true,
        "statusCode": 0,
        "address": '0xFa518198f877Cec509105e4317332D8e2d860213',
        "timestamp": 1222711600,
        "from": "BLA", "to": "IOP"
    },
    {"name": "Flight 6",
        "isRegistered": true,
        "statusCode": 0,
        "address": '0xFa518198f877Cec509105e4317332D8e2d860213',
        "timestamp": 1222711600,
        "from": "TST", "to": "ABC"
    },
    {"name": "Flight 7",
        "isRegistered": true,
        "statusCode": 0,
        "address": '0x59cD61C7046Ab97382f8246b4728be9819670692',
        "timestamp": 1222711600,
        "from": "PAR", "to": "MUC"
    },
    {"name": "Flight 8",
        "isRegistered": true,
        "statusCode": 0,
        "address": '0x59cD61C7046Ab97382f8246b4728be9819670692',
        "timestamp": 1222711600,
        "from": "TT4", "to": "MUC"
    },
    {"name": "Flight 9",
        "isRegistered": true,
        "statusCode": 0,
        "address": '0x59cD61C7046Ab97382f8246b4728be9819670692',
        "timestamp": 1222711600,
        "from": "CAI", "to": "MOS"
    }
];

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function getRandomCode() {
    const randomEntry = Object.keys(STATUS_CODES)[getRandomInt(Object.keys(STATUS_CODES).length - 1)];
    return STATUS_CODES[randomEntry];
}

async function setupTestData() {
    const accounts = await web3.eth.getAccounts();
    /*
    setup and found test airlines -> 5 for testing
     */
    const firstAirlineIsRegistered = await flightSuretyApp.methods.isFunded(accounts[1]).call({from: accounts[0]});
    if (!firstAirlineIsRegistered[0]) {
        await flightSuretyApp.methods.fundAirline().call({from: accounts[1], value: web3.utils.toWei("10", "ether")});
    }

    let iterator = 1;
    while (iterator < 5) {
        let resultRegister = await flightSuretyApp.methods.isRegistered(accounts[iterator]).call({from: accounts[0]});
        if (!resultRegister[0]) {
            let name = `Airline Number ${iterator}`;
            let res = await flightSuretyApp.methods.registerAirline(accounts[iterator], name).send({from: accounts[1], gas: config.gas});
            // console.log(res);
        }

        let resultFound = await flightSuretyApp.methods.isFunded(accounts[iterator]).call({from: accounts[1]});
        if (!resultFound[0]) {
            let res = await flightSuretyApp.methods.fundAirline().send({from: accounts[iterator], value: web3.utils.toWei("10", "ether"), gas: config.gas});
            // console.log(res);
        }
        iterator++;
    }

    /*
    setup test flights
     */
    for (let flight of Flights) {
        let res = await flightSuretyApp.methods.registerFlight(flight.name, flight.timestamp).call({from: flight.address});
    }
}

async function setupBase() {
    const accounts = await web3.eth.getAccounts();
    let omap = {};

    /*
    setup oracles
     */
    // setup oracles from account from 10 onwards
    const oraclesAccounts = accounts.slice(10, 30);
    for (let y = 0; y < oraclesAccounts.length; y++) {
        let result = await flightSuretyApp.methods.registerOracle().send({from: oraclesAccounts[y], value: web3.utils.toWei("1", "ether"), gas: config.gas});
        let indexes = await flightSuretyApp.methods.getMyIndexes().call({from: oraclesAccounts[y]});

        omap[oraclesAccounts[y]] = [...indexes];
        flightSuretyApp.events.OracleRequest({fromBlock: 0, filter: {index: [...indexes]}}, (err, event) => {
            if (err) { console.log(err); }
            let result = event.returnValues;
            console.log(`${y} Handling: airline ${result.airline}, flight: ${result.flight}, time: ${result.timestamp}, index: ${result.index}`);
            let randomCode = getRandomCode();
            flightSuretyApp.methods.submitOracleResponse(result.index, result.airline, result.flight, result.timestamp, randomCode).send({from: oraclesAccounts[y], gas: config.gas});
        });
    }
}

async function oracleEventListener()
{
    flightSuretyApp.events.OracleReport({fromBlock: 0}, (err, event) => {
        if (err) { console.log(err); }
        let result = event.returnValues;
        console.log(`OracleReport: ${result.airline} ${result.flight} ${result.timestamp} ${result.status}`);
    });

    flightSuretyApp.events.FlightStatusInfo({fromBlock: 0}, (err, event) => {
        if (err) { console.log(err); }
        let result = event.returnValues;
        console.log(`FlightStatusInfo ${result.airline} ${result.flight} ${result.timestamp} ${result.status}`);
    });

    flightSuretyData.events.InsuranceBought({fromBlock: 0}, (err, event) => {
        if (err) { console.log(err); }
        let result = event.returnValues;
        console.log(`InsuranceBought ${result.passenger} ${result.name} ${result.key} ${result.amount}`);
    });

    flightSuretyData.events.AirlineFunded({fromBlock: 0}, (err, event) => {
        if (err) { console.log(err); }
        let result = event.returnValues;
        console.log(`AirlineFounded ${result}`);
    });

    flightSuretyData.events.PayableInsurance({fromBlock: 0}, (err, event) => {
        if (err) { console.log(err); }
        let result = event.returnValues;
        console.log(`PayableInsurance ${result.passenger} ${result.name} ${result.amount}`);
    });
}

async function apiTest() {
    console.log('Test from Server!');
}

const app = express();
app.use(cors());
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

app.post("/api/reset", setupBase);
app.post("/api/setup-test-data", setupTestData);
app.post("/api/api-test", apiTest);

oracleEventListener().then();
// setupTestData().then();
setupBase().then();

export default app;
