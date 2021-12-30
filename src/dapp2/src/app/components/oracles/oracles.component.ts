import { Component, OnInit } from '@angular/core';
import { ContractConnectionService, Flight } from "../../services/contract-connection.service";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'app-oracles',
  templateUrl: './oracles.component.html',
  styleUrls: ['./oracles.component.scss']
})
export class OraclesComponent implements OnInit {
  insuranceAmount: number = 0;
  selectedFlight: Flight | undefined;
  flights: Flight[] = [];

  constructor(private contractConnectionService: ContractConnectionService,
              private http: HttpClient) { }

  ngOnInit(): void {
    this.selectedFlight = this.contractConnectionService.flights[0];
    this.flights = this.contractConnectionService.flights;
  }

  selectChange(event: any) {
    for (let i = 0; i < this.flights.length; i++) {
      if (this.flights[i].name === event.value) {
        this.selectedFlight = this.flights[i];
      }
    }
  }

  fetchFlightStatus() {
    this.contractConnectionService.fetchFlightStatus(this.selectedFlight);
  }

  withdraw() {
    this.contractConnectionService.creditInsurees(this.selectedFlight);
  }

  testAPI() {
    this.http.post(this.contractConnectionService.getConfig().url + '/api-test', {});
  }
}
