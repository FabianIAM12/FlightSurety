import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ContractConnectionService} from "../../services/contract-connection.service";

@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss']
})
export class AdministrationComponent implements AfterViewInit {
  public operationalStatus = false;

  constructor(private contractConnectionService: ContractConnectionService) { }

  ngAfterViewInit(): void {
    this.contractConnectionService.isOperational().call({ from: this.contractConnectionService.owner}, (error: any, result: any) => {
      this.operationalStatus = result;
    });
  }
}
