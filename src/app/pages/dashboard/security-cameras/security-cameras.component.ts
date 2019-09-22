import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NbComponentSize, NbMediaBreakpointsService, NbThemeService } from '@nebular/theme';

import { Camera, SecurityCamerasData } from '../../../@core/data/security-cameras';

@Component({
  selector: 'ngx-security-cameras',
  styleUrls: ['./security-cameras.component.scss'],
  templateUrl: './security-cameras.component.html',
})
export class SecurityCamerasComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  urlImage='http://127.0.0.1/rasp/camera1.jpg';
  cameras: Camera[];
  selectedCamera: Camera;
  isSingleView = true;
  actionSize: NbComponentSize = 'medium';
  imToggle=true;
  constructor(
    private themeService: NbThemeService,
    private breakpointService: NbMediaBreakpointsService,
    private securityCamerasService: SecurityCamerasData,
  ) {}

  ngOnInit() {
    this.securityCamerasService.getCamerasData()
      .pipe(takeUntil(this.destroy$))
      .subscribe((cameras: Camera[]) => {
        this.cameras = cameras;
        this.selectedCamera = this.cameras[0];
        
      });

    const breakpoints = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(map(([, breakpoint]) => breakpoint.width))
      .subscribe((width: number) => {
        this.actionSize = width > breakpoints.md ? 'medium' : 'small';
      });
    this.securityCamerasService.currentMessage.subscribe(msg=>{
        this.changeImage();
      })
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectCamera(camera: any) {
    this.selectedCamera = camera;
    this.isSingleView = true;
    
  }
  changeImage(){
    if (this.imToggle){
    this.cameras[0].source='http://127.0.0.1/rasp/camera2.jpg'
  }else{
    this.cameras[0].source='http://127.0.0.1/rasp/camera1.jpg'
  }
    this.imToggle=!this.imToggle;
  }
}
