import { Injectable } from '@angular/core';
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
export class ContractConnectionService {
  private readonly network = 'localhost';
  private web3: Web3;
  private flightSuretyApp: any;
  private flightSuretyData: any;
  public owner: any;

  private readonly airlines: any;
  private passengers: any;
  private config: any;

  // todo: refactor for single file
  flights: Flight[] = [
    {"name": "Flight 1",
      "isRegistered": true,
      "statusCode": 0,
      "address": '0xFa518198f877Cec509105e4317332D8e2d860213',
      "timestamp": 1363211600,
      "from": "YAD", "to": "MUC"},
    {"name": "Flight 2",
      "isRegistered": true,
      "statusCode": 0,
      "address": '0x59cD61C7046Ab97382f8246b4728be9819670692',
      "timestamp": 1222711600,
      "from": "CDG", "to": "MU2"
    },
    {"name": "Flight 3",
      "isRegistered": true,
      "statusCode": 0,
      "address": '0xA81e8A03d583298510653EdCC378B1506cC483CD',
      "timestamp": 1222711600,
      "from": "LKI", "to": "TGV"
    },
    {"name": "Flight 4",
      "isRegistered": true,
      "statusCode": 0,
      "address": '0xB545961776b8A3b736F80c4767067ccD731825dF',
      "timestamp": 1222711600,
      "from": "MAL", "to": "IBZ"
    },
    {"name": "Flight 5",
      "isRegistered": true,
      "statusCode": 0,
      "address": '0x8Ed7D20E1Ce424246b12CD3b8637211100d332C2',
      "timestamp": 1222711600,
      "from": "BLA", "to": "IOP"
    },
    {"name": "Flight 6",
      "isRegistered": true,
      "statusCode": 0,
      "address": '0xf2ADd7E02ca1a12b203654BAc5FE12B8D9Df8B0D',
      "timestamp": 1222711600,
      "from": "TST", "to": "ABC"
    },
    {"name": "Flight 7",
      "isRegistered": true,
      "statusCode": 0,
      "address": '0x645572DEF45E740bE6618b7fb9255c81358b178D',
      "timestamp": 1222711600,
      "from": "PAR", "to": "MUC"
    },
    {"name": "Flight 8",
      "isRegistered": true,
      "statusCode": 0,
      "address": '0xef33F5E21652A75ef51eC33943D3Ed88E3a3fF48',
      "timestamp": 1222711600,
      "from": "TT4", "to": "MUC"
    },
    {"name": "Flight 9",
      "isRegistered": true,
      "statusCode": 0,
      "address": '0xCE6450EC106efb791841C70A228E82212AD93743',
      "timestamp": 1222711600,
      "from": "CAI", "to": "MOS"
    }
  ];

  constructor() {
    let config = Config[this.network];
    this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
    this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
    this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);

    this.owner = null;
    this.airlines = [];
    this.passengers = [];
    this.setAccounts();
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
    let payload = {
      airline: this.airlines[0],
      flight: flight,
      timestamp: Math.floor(Date.now() / 1000)
    }

    /*
    this.flightSuretyApp.methods
      .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
      .send({ from: this.owner}, (error: any, result: any) => {
        console.log(error, result);
      });
    */
  }

  public buyInsurance(airlineAddress: string, flightName: string, flightTimestamp: number, insuranceAmount: number) {
    this.flightSuretyApp.methods.buyFlightInsurance(airlineAddress, flightName, flightTimestamp)
      .send({from: this.owner, value: this.web3.utils.toWei(insuranceAmount.toString(), 'ether')})
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

  public fundAirline(amount: number) {
    this.flightSuretyApp.methods.fundAirline()
      .send({from: this.owner, value: this.web3.utils.toWei(amount.toString(), 'ether')})
      .then((res: any) => {
        console.log(res);
      }).catch((err: any) => {
        console.error(err);
    });
  }

  public registerNewFlight(flightNumber: string, timestamp: string) {
    this.flightSuretyApp.methods.registerFlight(flightNumber, timestamp)
      .send({from: this.owner})
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
