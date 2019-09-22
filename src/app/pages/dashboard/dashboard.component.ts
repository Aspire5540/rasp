import {Component,OnInit,OnDestroy, ModuleWithComponentFactories} from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators' ;
import { SolarData } from '../../@core/data/solar';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import 'rxjs/add/operator/map'
import { TemperatureHumidityData} from '../../@core/data/temperature-humidity';
import {ElectricityData} from '../../@core/data/electricity';
import {UserData} from '../../@core/data/users';
import {SecurityCamerasData} from '../../@core/data/security-cameras';
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
 maxLoad:number;
 doorArry=[];
 motionArry=[];

  constructor(private electricityService: ElectricityData,private temperatureHumidityService: TemperatureHumidityData,private db: AngularFireDatabase,private themeService: NbThemeService,
              private solarService: SolarData,private userService: UserData,private securityCamerasService: SecurityCamerasData,
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
     
  }
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    var tempurature;
    var humidity;
    var DataDate;
    var currentDate;
    var meterArry;
    var meterMap;
    var dTime;
    var maxV=0;
    var meterReslt=[];
    
    var sumP:number;
    var temp;
    this.wikiList.snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, value: action.payload.val() }));
      }).subscribe(items => {  
      this.wikis = items.reverse();
      this.doorArry=[];
      this.motionArry=[];
      meterReslt=[];
      console.log("sync");
      for(this.loop=0;this.loop<this.wikis.length;this.loop++){
        this.element=this.wikis[this.loop];
        if (Object.keys(this.element.value)[0]=="env"){
          tempurature =this.element.value.env[this.element.value.env.length-1].value[0];
          humidity =this.element.value.env[this.element.value.env.length-1].value[1];
          this.temperatureHumidityService.changeMessage([tempurature,humidity]);
          DataDate=Date.parse(this.element.value.env[this.element.value.env.length-1].timestamp);
          currentDate=new Date().getTime();
          dTime=(currentDate-DataDate)/(1000*60); //in min.
          if (dTime>20){
            this.lightCard.on=false;
          }else{
            this.lightCard.on=true;
          }
          break
        }
      }
     
 
      for(this.loop=this.wikis.length-1;this.loop>-1;this.loop--){
        this.element=this.wikis[this.loop];
        
        if (Object.keys(this.element.value)[0]=="meter"){
          
          meterArry=this.element.value.meter;
          if (this.loop==0){
           
            DataDate=Date.parse(meterArry[meterArry.length-1].timestamp);
            currentDate=new Date().getTime();
            dTime=(currentDate-DataDate)/(1000*60); //in min.
            if (dTime>20){
              this.rollerShadesCard.on=false;
            }else{
              this.rollerShadesCard.on=true;
            }
           
          }
          meterArry.forEach(element => {
            sumP=Number(element.value[0]+element.value[1]+element.value[2]);
            if(maxV<sumP){
       
              maxV=sumP;
            
            }
            meterReslt.push(sumP.toFixed(2));
          });
                   
        }
      }
      for(this.loop=0;this.loop<this.wikis.length;this.loop++){
        this.element=this.wikis[this.loop];  
        if (Object.keys(this.element.value)[0]=="door"){
          temp=this.element.value.door;
          temp=temp.reverse();
          temp.forEach(element => {
            this.doorArry.push({ user:{ name: 'Room #1', picture: 'assets/images/door2.png'}, type: 'Door open', time: element.timestamp});
          });
    
        }else if (Object.keys(this.element.value)[0]=="motion"){
          temp=this.element.value.motion;
          temp=temp.reverse();
          temp.forEach(element => {
            this.motionArry.push({user:{ name: 'Camera #1', picture: 'assets/images/motion.png'}, type: 'motion', time: element.timestamp});    
          });
        }
        
      }
      meterMap=meterReslt.map((p, index) => ({
        label: index,
        value: p,
      }));
    
      //console.log(meterReslt);
      this.securityCamerasService.changeMessage("change"); 
      this.userService.changeMessage([this.doorArry,this.motionArry]);
      this.electricityService.changeMessage([meterMap,maxV.toFixed(2)]);
      
      });
      
  }
  ngOnDestroy() {
    this.alive = false;
  }
}
