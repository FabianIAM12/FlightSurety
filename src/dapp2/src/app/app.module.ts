import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AdministrationComponent } from './administration/administration.component';
import { AirlineComponent } from './airline/airline.component';
import { PassengerComponent } from './passenger/passenger.component';
import { OraclesComponent } from './oracles/oracles.component';

@NgModule({
  declarations: [
    AppComponent,
    AdministrationComponent,
    AirlineComponent,
    PassengerComponent,
    OraclesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
