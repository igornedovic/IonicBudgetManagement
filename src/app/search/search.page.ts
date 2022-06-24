import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { SearchModalComponent } from './search-modal/search-modal.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  openModal() {
    this.modalCtrl
      .create({
        component: SearchModalComponent,
        componentProps: { title: 'Add filters' },
      })
      .then((modal) => {
        modal.present();
        return modal.onDidDismiss();
      })
      .then((modalData) => {
        if (modalData.role === 'confirm') {
          console.log(modalData);
        }
      });
  }
}
