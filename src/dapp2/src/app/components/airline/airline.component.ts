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
  displayedColumns: string[] = ['name', 'address', 'fund'];
  dataSource = ELEMENT_DATA;

  airlineAddress: string = '';
  airlineName: string = '';
  amount = 0;
  timestamp: string = '';
  flightNumber: string = '';

  constructor(private contractConnectionService: ContractConnectionService) { }

  ngAfterViewInit(): void {
    setTimeout( () => {
      const test = this.contractConnectionService.getAirlines();
    }, 250);
  }

  registerAirline(): void {
    this.contractConnectionService.registerAirline(this.airlineAddress, this.airlineName);
  }

  foundAirline(): void {
    this.contractConnectionService.fundAirline(this.amount);
  }

  registerNewFlight(): void {
    this.contractConnectionService.registerNewFlight(this.flightNumber, this.timestamp);
  }
}
