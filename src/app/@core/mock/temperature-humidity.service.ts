import { Injectable } from '@angular/core';
import { of as observableOf,  Observable } from 'rxjs';
import { TemperatureHumidityData, Temperature } from '../data/temperature-humidity';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class TemperatureHumidityService extends TemperatureHumidityData {
  private messageSource = new BehaviorSubject('');
  currentMessage = this.messageSource.asObservable();

  private temperatureDate: Temperature = {
    value: 40,
    min: 10,
    max: 60,
  };

  private humidityDate: Temperature = {
    value: 87,
    min: 0,
    max: 100,
  };

  getTemperatureData(): Observable<Temperature> {
    return observableOf(this.temperatureDate);
  }

  getHumidityData(): Observable<Temperature> {
    return observableOf(this.humidityDate);
  }
  changeMessage(msg) {
    console.log(msg);
    this.messageSource.next(msg);
  }
}
