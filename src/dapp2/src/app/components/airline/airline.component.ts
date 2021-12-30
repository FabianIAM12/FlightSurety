import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ContractConnectionService} from "../../services/contract-connection.service";

export interface FlightElement {
  name: string;
  address: string;
  fund: number;
}

const ELEMENT_DATA: FlightElement[] = [
  { name: '1.0079', address: 'Hydrogen', fund: 4 },
];

@Component({
  selector: 'app-airline',
  templateUrl: './airline.component.html',
  styleUrls: ['./airline.component.scss']
})
export class AirlineComponent implements AfterViewInit {
  dataSource = ELEMENT_DATA;

  airlineAddress: string = '';
  airlineName: string = '';
  amount = 0;
  timestamp: string = '';
  flightNumber: string = '';
  airlineAccount: string = '';
  airlineFlightAccount: string = '';

  constructor(private contractConnectionService: ContractConnectionService) { }

  ngAfterViewInit(): void {
    setTimeout( () => {
      const test = this.contractConnectionService.getAirlines();
    }, 250);
  }

  registerAirline(): void {
    this.contractConnectionService.registerAirline(this.airlineAddress, this.airlineName);
  }

  fundAirline(): void {
    this.contractConnectionService.fundAirline(this.amount, this.airlineAccount);
  }

  registerNewFlight(): void {
    this.contractConnectionService.registerNewFlight(this.flightNumber, this.timestamp, this.airlineFlightAccount);
  }
}
