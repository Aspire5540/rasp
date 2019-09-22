import { Injectable } from '@angular/core';
import { of as observableOf, Observable } from 'rxjs';
import { Camera, SecurityCamerasData } from '../data/security-cameras';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SecurityCamerasService extends SecurityCamerasData {
  private messageSource = new BehaviorSubject('');
  currentMessage = this.messageSource.asObservable();
  private cameras: Camera[] = [
    {
      title: 'Camera #1',
      source: 'http://127.0.0.1/rasp/camera1.jpg'
      //source: 'assets/images/camera1.jpg',
    },
    {
      title: 'Camera #2',
      source: 'assets/images/camera2.jpg',
    },
    {
      title: 'Camera #3',
      source: 'assets/images/camera3.jpg',
    },
    {
      title: 'Camera #4',
      source: 'assets/images/camera4.jpg',
    },
  ];

  getCamerasData(): Observable<Camera[]> {
    return observableOf(this.cameras);
  }
  changeMessage(msg) {
    this.messageSource.next(msg);
  }
}
