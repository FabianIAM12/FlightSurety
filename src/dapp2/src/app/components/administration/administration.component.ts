import {AfterViewInit, Component} from '@angular/core';
import {ContractConnectionService} from "../../services/contract-connection.service";

@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss']
})
export class AdministrationComponent implements AfterViewInit {
  public operationalStatusData = false;
  public operationalStatusApp = false;
  public authorizeAddress = '';

  constructor(private contractConnectionService: ContractConnectionService) { }

  getDataAddress(): string {
    return this.contractConnectionService.getDataAddress();
  }

  getAppAddress(): string {
    return this.contractConnectionService.getAppAddress();
  }

  sendAuthorize(): any {
    return this.contractConnectionService.authorizeCallerContract(this.authorizeAddress);
  }

  ngAfterViewInit(): void {
    /*
    this.contractConnectionService.isOperationalApp().call({ from: this.contractConnectionService.owner}, (error: any, result: any) => {
      this.operationalStatusData = result;
    }); */

    this.contractConnectionService.isOperationalData().call({ from: this.contractConnectionService.owner}, (error: any, result: any) => {
      this.operationalStatusData = result;
    });
  }

  onValChangeData(): void {
    this.operationalStatusData = !this.operationalStatusData;
    this.contractConnectionService.setOperationalData(this.operationalStatusData);
  }

  onValChangeApp(): void {
    this.operationalStatusApp = !this.operationalStatusApp;
    this.contractConnectionService.setOperationalApp(this.operationalStatusApp);
  }
}
