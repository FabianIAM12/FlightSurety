import * as Config from '../../config.json';

const FlightSuretyApp = require('../../../../build/contracts/FlightSuretyApp.json');
import {AfterViewInit, Component} from '@angular/core';
import Web3 from "web3";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'dapp2';

  private readonly network = 'localhost';
  private web3: Web3;
  private flightSuretyApp: any;
  private owner: any;
  private airlines: any;
  private passengers: any;

  private operationalStatus = false;

  constructor() {
    let config = Config[this.network];
    this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
    this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

    this.owner = null;
    this.airlines = [];
    this.passengers = [];
  }

  public ngAfterViewInit() {
    this.setAccounts();
    this.isOperational();
  }

  private isOperational() {
    this.flightSuretyApp
      .methods
      .isOperational()
      .call({from: this.owner}, (error: any, result: any) => {
        this.operationalStatus = result;
      });
  }

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

  private fetchFlightStatus() {
  }
}
