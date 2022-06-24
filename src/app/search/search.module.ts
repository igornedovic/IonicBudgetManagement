import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchPageRoutingModule } from './search-routing.module';

import { SearchPage } from './search.page';
import { SearchModalComponent } from './search-modal/search-modal.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SearchPageRoutingModule],
  declarations: [SearchPage, SearchModalComponent],
})
export class SearchPageModule {}
