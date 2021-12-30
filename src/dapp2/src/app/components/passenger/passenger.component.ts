import { Component, OnInit } from '@angular/core';
import { ContractConnectionService, Flight } from "../../services/contract-connection.service";

@Component({
  selector: 'app-passenger',
  templateUrl: './passenger.component.html',
  styleUrls: ['./passenger.component.scss']
})
export class PassengerComponent implements OnInit {
  insuranceAmount: number = 0;
  selectedFlight: Flight | undefined;
  flights: Flight[] = [];
  passengerAccount: string = '';

  constructor(private contractConnectionService: ContractConnectionService) { }

  buyInsurance() {
    if (this.selectedFlight) {
      this.contractConnectionService.buyInsurance(
        this.selectedFlight.address,
        this.selectedFlight.name,
        this.selectedFlight.timestamp,
        this.insuranceAmount,
        this.passengerAccount);
    }
  }

  selectChange(event: any) {
    for (let i = 0; i < this.flights.length; i++) {
      if (this.flights[i].name === event.value) {
        this.selectedFlight = this.flights[i];
      }
    }
  }

  ngOnInit(): void {
    this.selectedFlight = this.contractConnectionService.flights[0];
    this.flights = this.contractConnectionService.flights;
  }
}
