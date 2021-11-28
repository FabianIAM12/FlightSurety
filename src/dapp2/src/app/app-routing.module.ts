import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdministrationComponent } from "./components/administration/administration.component";
import {AirlineComponent} from "./components/airline/airline.component";
import {OraclesComponent} from "./components/oracles/oracles.component";
import {PassengerComponent} from "./components/passenger/passenger.component";

const routes: Routes = [
  { path: '', redirectTo: '/administration', pathMatch: 'full' },
  { path: 'administration', component: AdministrationComponent },
  { path: 'airline', component: AirlineComponent },
  { path: 'passenger', component: PassengerComponent },
  { path: 'oracles', component: OraclesComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
