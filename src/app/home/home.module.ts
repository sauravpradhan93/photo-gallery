import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollableDirective } from '../directive/scrollable.directive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ArrangePipe } from './pipe/arrange.pipe';

@NgModule({
  declarations: [HomeComponent, ScrollableDirective, ArrangePipe],
  imports: [
    CommonModule,
    HomeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule
  ]
})
export class HomeModule { }
