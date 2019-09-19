import {Component,OnInit,OnDestroy} from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators' ;
import { SolarData } from '../../@core/data/solar';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import 'rxjs/add/operator/map'
import { TemperatureHumidityData} from '../../@core/data/temperature-humidity';

interface CardSettings {
  title: string;
  iconClass: string;
  type: string;
  on : boolean;
}

@Component({
  selector: 'ngx-dashboard',
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnDestroy,OnInit {

  private alive = true;
  on1=false;
  solarValue: number;
  lightCard: CardSettings = {
    title: 'Tempureture/Humunity',
    iconClass: 'nb-snowy-circled',
    type: 'primary',
    on:true,
  };
  rollerShadesCard: CardSettings = {
    title: 'Power Sensor',
    iconClass: 'nb-power-circled',
    type: 'success',
    on:true,
  };
  wirelessAudioCard: CardSettings = {
    title: 'Wireless Audio',
    iconClass: 'nb-audio',
    type: 'info',
    on:true,
  };
  coffeeMakerCard: CardSettings = {
    title: 'Coffee Maker',
    iconClass: 'nb-coffee-maker',
    type: 'warning',
    on:true,
  };

  statusCards: string;

  commonStatusCardsSet: CardSettings[] = [
    this.lightCard,
    this.rollerShadesCard,
    //this.wirelessAudioCard,
    //this.coffeeMakerCard,
  ];

  statusCardsByThemes: {
    default: CardSettings[];
    cosmic: CardSettings[];
    corporate: CardSettings[];
    dark: CardSettings[];
  } = {
    default: this.commonStatusCardsSet,
    cosmic: this.commonStatusCardsSet,
    corporate: [
      {
        ...this.lightCard,
        type: 'warning',
      },
      {
        ...this.rollerShadesCard,
        type: 'primary',
      },
      {
        ...this.wirelessAudioCard,
        type: 'danger',
      },
      {
        ...this.coffeeMakerCard,
        type: 'info',
      },
    ],
    dark: this.commonStatusCardsSet,
  };

 //Include xxxx
 wikiList: AngularFireList<any>;
 wikis: any[];
 lastTemp : number;
 loop : number;
 element:any;



  constructor(private temperatureHumidityService: TemperatureHumidityData,private db: AngularFireDatabase,private themeService: NbThemeService,
              private solarService: SolarData,
              ) {

    this.wikiList = db.list('PEA/substation/team_03');
    this.themeService.getJsTheme()
      .pipe(takeWhile(() => this.alive))
      .subscribe(theme => {
        this.statusCards = this.statusCardsByThemes[theme.name];
    });

    this.solarService.getSolarData()
      .pipe(takeWhile(() => this.alive))
      .subscribe((data) => {
        this.solarValue = data;
      });
      this.lightCard.on=false;
  }
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    var tempurature;
    var humidity;
    this.wikiList.snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, value: action.payload.val() }));
      }).subscribe(items => {
      this.wikis = items.reverse();
      for(this.loop=1;this.loop<this.wikis.length;this.loop++){
        this.element=this.wikis[this.loop];
        if (Object.keys(this.element.value)[0]=="env"){
          tempurature =this.element.value.env[this.element.value.env.length-1].value[0];
          humidity =this.element.value.env[this.element.value.env.length-1].value[1];
          this.temperatureHumidityService.changeMessage([tempurature,humidity]);
          break
        }
      }
      
      //this.temperature=this.wikis[this.wikis.length-1].value.ligth
      });
  }
  ngOnDestroy() {
    this.alive = false;
  }
}
