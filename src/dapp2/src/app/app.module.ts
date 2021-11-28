import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AdministrationComponent } from './administration/administration.component';
import { AirlineComponent } from './airline/airline.component';
import { PassengerComponent } from './passenger/passenger.component';
import { OraclesComponent } from './oracles/oracles.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

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
    BrowserAnimationsModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [NgbModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
