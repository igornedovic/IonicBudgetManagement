import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';

import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') private canvas: ElementRef;
  @Input() depositNumber: number;
  @Input() withdrawalNumber: number;

  donutChart: any;

  constructor() {
    Chart.register(...registerables);
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.donutChartInitializer();
  }

  donutChartInitializer() {
    this.donutChart = new Chart(this.canvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Deposits', 'Withdrawals'],
        datasets: [
          {
            data: [this.depositNumber, this.withdrawalNumber],
            backgroundColor: [
              'rgba(75, 192, 192, 0.2)',
              'rgba(255, 99, 132, 0.2)',
            ],
            hoverBackgroundColor: ['#3D8C0B', '#D11D1D'],
          },
        ],
      },
    });
  }
}
