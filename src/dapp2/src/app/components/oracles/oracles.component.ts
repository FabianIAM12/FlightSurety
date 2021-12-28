import { Component, OnInit } from '@angular/core';
import { ContractConnectionService, Flight } from "../../services/contract-connection.service";

@Component({
  selector: 'app-oracles',
  templateUrl: './oracles.component.html',
  styleUrls: ['./oracles.component.scss']
})
export class OraclesComponent implements OnInit {
  insuranceAmount: number = 0;
  selectedFlight: Flight | undefined;
  flights: Flight[] = [];

  constructor(private contractConnectionService: ContractConnectionService) { }

  ngOnInit(): void {
    this.selectedFlight = this.contractConnectionService.flights[0];
    this.flights = this.contractConnectionService.flights;
  }

  selectChange(event: any) {
    for (let i = 0; i < this.flights.length; i++) {
      if (this.flights[i].address === event.value) {
        this.selectedFlight = this.flights[i];
      }
    }
  }

  withdrawInsurance() {
  }
}
