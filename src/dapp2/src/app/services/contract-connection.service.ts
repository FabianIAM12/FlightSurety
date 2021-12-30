import { Injectable, OnInit } from '@angular/core';
import Web3 from "web3";
const FlightSuretyApp = require('../../../../../build/contracts/FlightSuretyApp.json');
const FlightSuretyData = require('../../../../../build/contracts/FlightSuretyData.json');
import * as Config from "../../../config.json";

export interface Flight {
  name: string,
  isRegistered: boolean,
  statusCode: number,
  timestamp: number,
  address: string,
  from: string,
  to: string,
}

@Injectable({
  providedIn: 'root'
})
export class ContractConnectionService implements OnInit {
  private readonly network = 'localhost';
  private web3: Web3;
  private flightSuretyApp: any;
  private flightSuretyData: any;
  public owner: any;

  private readonly airlines: any;
  private passengers: any;
  public config: any;

  // todo: refactor for single file
  flights: Flight[] = [
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

  constructor() {
    this.config = Config[this.network];
    this.web3 = new Web3(new Web3.providers.HttpProvider(this.config.url));
    this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, this.config.appAddress);
    this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, this.config.dataAddress);

    this.owner = null;
    this.airlines = [];
    this.passengers = [];
    this.setAccounts();
  }

  public getConfig() {
    return this.config;
  }

  public ngOnInit() {
    this.flightSuretyData.events.AirlineFunded({fromBlock: 0}, (err: any, event: { returnValues: any; }) => {
      if (err) { console.log(err); }
      let result = event.returnValues;
      console.log(`AirlineFounded ${result}`);
    });

    this.flightSuretyData.events.InsuranceBought({fromBlock: 0}, (err: any, event: { returnValues: any; }) => {
      if (err) { console.log(err); }
      let result = event.returnValues;
      console.log(`InsuranceBought ${result.passenger} ${result.name} ${result.key} ${result.amount}`);
    });
  }

  public async getAirlines(): Promise<any> {
    /*
    return this.flightSuretyData.methods.getAirlines()
      .send({from: this.owner})
      .then((res: any) => {
        console.log(res);
      }).catch((err: any) => {
        console.error(err);
      }); */
  }

  public getDeployedAddress(): any {
    return this.config.localhost
  }

  public isOperationalApp() {
    return this.flightSuretyApp.methods.isOperational()
  }

  public isOperationalData() {
    return this.flightSuretyData.methods.isOperational()
  }

  public getDataAddress() {
    return this.flightSuretyData._address;
  }

  public getAppAddress() {
    return this.flightSuretyApp._address;
  }

  public authorizeCallerContract(caller: string) {
    return this.flightSuretyData.methods.authorizeCallerContract(caller)
      .send({from: this.owner})
      .then((res: any) => {
        console.log(res);
      }).catch((err: any) => {
        console.error(err);
    });
  }

  public fetchFlightStatus(flight: any) {
    console.log(flight.name);
    return this.flightSuretyApp.methods.fetchFlightStatus(flight.address, flight.name, flight.timestamp)
      .send({from: this.owner})
      .then((res: any) => {

        if (res.events) {
          const { OracleRequest } = res.events;
          console.log(OracleRequest.returnValues);
        }
      }).catch((err: any) => {
        console.error(err);
      });
  }

  public buyInsurance(airlineAddress: string,
                      flightName: string,
                      flightTimestamp: number,
                      insuranceAmount: number,
                      passengerAccount: string) {

    this.flightSuretyApp.methods.buyFlightInsurance(airlineAddress, flightName, flightTimestamp)
      .send({from: passengerAccount, gas: this.config.gas, value: this.web3.utils.toWei(insuranceAmount.toString(), 'ether')})
      .then((res: any) => {
        console.log(res);
      }).catch((err: any) => {
        console.error(err);
      });
  }

  public setOperationalData(value: boolean) {
    this.flightSuretyData.methods.setOperatingStatus(value)
      .send({from: this.owner})
      .then((res: any) => {
        console.log(res);
      }).catch((err: any) => {
        console.error(err);
      });
  }

  public setOperationalApp(value: boolean) {
    this.flightSuretyApp.methods.setOperatingStatus(value)
      .send({from: this.owner})
      .then((res: any) => {
        console.log(res);
      }).catch((err: any) => {
        console.error(err);
    });
  }

  public registerAirline(address: string, name: string) {
    this.flightSuretyApp.methods.registerAirline(address, name)
      .send({from: this.owner})
      .then((res: any) => {
        console.log(res);
      }).catch((err: any) => {
        console.error(err);
    });
  }

  public fundAirline(amount: number, airlineAccount: string) {
    this.flightSuretyApp.methods.fundAirline()
      .send({from: airlineAccount, value: this.web3.utils.toWei(amount.toString(), 'ether')})
      .then((res: any) => {
        console.log(res);
      }).catch((err: any) => {
        console.error(err);
    });
  }

  public registerNewFlight(flightNumber: string, timestamp: string, airlineFlightAccount: string) {
    this.flightSuretyApp.methods.registerFlight(flightNumber, timestamp)
      .send({from: airlineFlightAccount, gas: this.config.gas})
      .then((res: any) => {
        console.log(res);
      }).catch((err: any) => {
        console.error(err);
    });
  }

  public creditInsurees(flight: any) {
    this.flightSuretyApp.methods.creditInsurees(flight.address, flight.name, flight.timestamp, 20)
      .send({from: this.owner, gas: this.config.gas})
      .then((res: any) => {
        console.log(res);
      }).catch((err: any) => {
        console.error(err);
    });
  }

  // todo: has to be implemented
  public getFlights() {
  }

  private setAccounts() {
    this.web3.eth.getAccounts((error: Error, accounts: string[]) => {
      // change accordingly :D
      this.owner = accounts[0];
      let counter = 1;

      while (this.airlines.length < 5) {
        this.airlines.push(accounts[counter++]);
      }

      while (this.passengers.length < 5) {
        this.passengers.push(accounts[counter++]);
      }
    });
  }
}
