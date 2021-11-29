import { AfterViewInit, Injectable } from '@angular/core';
import Web3 from "web3";
const FlightSuretyApp = require('../../../../../build/contracts/FlightSuretyApp.json');
const FlightSuretyData = require('../../../../../build/contracts/FlightSuretyData.json');
import * as Config from "../../../config.json";

@Injectable({
  providedIn: 'root'
})
export class ContractConnectionService {
  private readonly network = 'localhost';
  private web3: Web3;
  private flightSuretyApp: any;
  private flightSuretyData: any;
  public owner: any;
  private airlines: any;
  private passengers: any;

  private config: any;

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
    return this.flightSuretyData._address;
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

  public setOperationalData(state: boolean, from: any) {
    console.log(this.owner);

    this.flightSuretyData.methods.setOperatingStatus(false)
      .send({from: this.owner})
      .then((receipt: any) => {
        console.log(receipt);
      }).catch((err: any) => {
        console.error(err);
    });
  }

  public setOperationalApp() { }

  private setAccounts() {
    this.web3.eth.getAccounts((error, accounts: string[]) => {
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
