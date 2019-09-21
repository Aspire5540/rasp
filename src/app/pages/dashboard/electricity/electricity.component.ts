import { Component, OnDestroy } from '@angular/core';
import { NbThemeService } from '@nebular/theme';

import { Electricity, ElectricityChart, ElectricityData } from '../../../@core/data/electricity';
import { takeWhile } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'ngx-electricity',
  styleUrls: ['./electricity.component.scss'],
  templateUrl: './electricity.component.html',
})
export class ElectricityComponent implements OnDestroy {

  private alive = true;

  listData: Electricity[];
  chartData: ElectricityChart[];
  peakLoad:number;
  type = 'week';
  types = ['week', 'month', 'year'];
  gdata:ElectricityChart[];
  currentTheme: string;
  themeSubscription: any;
  valArry=[];
  constructor(private electricityService: ElectricityData,
              private themeService: NbThemeService) {
    this.themeService.getJsTheme()
      .pipe(takeWhile(() => this.alive))
      .subscribe(theme => {
        this.currentTheme = theme.name;
    });

    forkJoin(
      this.electricityService.getListData(),
      this.electricityService.getChartData(),
    )
      .pipe(takeWhile(() => this.alive))
      .subscribe(([listData, chartData]: [Electricity[], ElectricityChart[]] ) => {
        this.listData = listData;
        this.chartData = chartData;
      });
      this.electricityService.currentMessage.subscribe(msg=>{
        //msg.map(p=>this.valArry.push(p));
        this.peakLoad=msg[1];
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
