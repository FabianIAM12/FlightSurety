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

  constructor(private contractConnectionService: ContractConnectionService) { }

  ngAfterViewInit(): void {
    this.contractConnectionService.isOperationalApp().call({ from: this.contractConnectionService.owner}, (error: any, result: any) => {
      this.operationalStatusData = result;
    });

    this.contractConnectionService.isOperationalData().call({ from: this.contractConnectionService.owner}, (error: any, result: any) => {
      this.operationalStatusApp = result;
    });
  }

  onValChangeData(value: boolean): void {
    this.contractConnectionService.setOperationalData(value, this.contractConnectionService.owner);
    /*
    this.contractConnectionService.setOperationalData(value).call(true, { from: this.contractConnectionService.owner}, (error: any, result: any) => {
      console.log('result');
      console.log(result);
      console.log('error');
      console.log(error);
    }); */
  }

  onValChangeApp(value: boolean): void {
    console.log(value);
  }
}
