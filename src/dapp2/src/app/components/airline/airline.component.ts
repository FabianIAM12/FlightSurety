import {Component, OnInit} from '@angular/core';
import {ContractConnectionService} from "../../services/contract-connection.service";

@Component({
  selector: 'app-airline',
  templateUrl: './airline.component.html',
  styleUrls: ['./airline.component.scss']
})
export class AirlineComponent implements OnInit {
  airlineAddress: string = '';
  airlineName: string = '';
  found = 0;

  constructor(private contractConnectionService: ContractConnectionService) { }

  ngOnInit(): void {
  }

  registerAirline(): void {
    this.contractConnectionService.registerAirline(this.airlineAddress, this.airlineName);
  }

  foundAirline(): void {
    console.log(this.airlineAddress);
    console.log(this.airlineName);
  }
}
