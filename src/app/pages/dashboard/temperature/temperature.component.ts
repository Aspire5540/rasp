import { Component, OnDestroy} from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { Temperature, TemperatureHumidityData } from '../../../@core/data/temperature-humidity';
import { takeWhile } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import 'rxjs/add/operator/map'
import { environment } from '../../../../environments/environment.prod';
import { NbUser } from '@nebular/auth';

@Component({
  selector: 'ngx-temperature',
  styleUrls: ['./temperature.component.scss'],
  templateUrl: './temperature.component.html',
})
export class TemperatureComponent implements OnDestroy {

  private alive = true;

  temperatureData: Temperature;
  temperature: number;
  temperatureOff = false;
  temperatureMode = 'cool';

  humidityData: Temperature;
  humidity: number;
  humidityOff = false;
  humidityMode = 'heat';

  theme: any;
  themeSubscription: any;
 //Include xxxx
 wikiList: AngularFireList<any>;
 wikis: any[];
 lastTemp : number;
 loop : number;
 element:any;
  constructor(private db: AngularFireDatabase,private themeService: NbThemeService,
              private temperatureHumidityService: TemperatureHumidityData) {
     this.wikiList = db.list('PEA/substation/team_03');
     this.themeService.getJsTheme()
      .pipe(takeWhile(() => this.alive))
      .subscribe(config => {
      this.theme = config.variables.temperature;
    });
 
    forkJoin(
      this.temperatureHumidityService.getTemperatureData(),
      this.temperatureHumidityService.getHumidityData(),
    )
      .subscribe(([temperatureData, humidityData]: [Temperature, Temperature]) => {
        this.temperatureData = temperatureData;
        this.temperature = this.temperatureData.value;
        //this.temperature=10;
        this.humidityData = humidityData;
        this.humidity = this.humidityData.value;
      });
     
      this.temperatureHumidityService.currentMessage.subscribe(msg=>{
        this.temperature=msg[0];
        this.humidity=msg[1];
      
      });
      
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
