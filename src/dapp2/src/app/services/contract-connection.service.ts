import { AfterViewInit, Injectable } from '@angular/core';
import Web3 from "web3";
const FlightSuretyApp = require('../../../../../build/contracts/FlightSuretyApp.json');
const FlightSuretyData = require('../../../../../build/contracts/FlightSuretyData.json');
import * as Config from "../../../config.json";

@Injectable({
  providedIn: 'root'
})
export class ContractConnectionService implements AfterViewInit {
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
    this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.appAddress);

    this.owner = null;
    this.airlines = [];
    this.passengers = [];
  }

  public ngAfterViewInit() {
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

  public async setOperationalData(state: boolean, from: any) {
    let result = await this.flightSuretyData.setOperatingStatus(state);
    console.log(result);
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
