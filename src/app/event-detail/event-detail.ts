import {ChangeDetectorRef, Component, Inject, PLATFORM_ID} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {EventService} from '../services/event.service';
import {ModalService} from '../services/modal.service';
import { Event } from '../models/event.model';
import {isPlatformBrowser, CommonModule} from '@angular/common';
import {Navbar} from '../navbar/navbar';
import {Footer} from '../shared/footer/footer';
import {Popup} from '../joinevents/popup/popup';
import { Login } from '../login/login';
import { SignUpOrg } from '../sign-up/sign-up-org';
import { RouterModule } from '@angular/router';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-event-detail',
  imports: [
    Navbar,
    Footer,
    Popup,
    CommonModule,
    Login,
    SignUpOrg,
    RouterModule
  ],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css',
})
export class EventDetail {
  event: Event | null=null;
  isJoinModalOpen=false;
  isModalOpen=false;
  isSignupModalOpen=false;

  constructor(
    private route:ActivatedRoute,
    private eventService:EventService,
    private modalService:ModalService,
    private  cdr:ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {

    if (isPlatformBrowser(this.platformId)){
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Event id from URL:', id);

      if (id) {
        this.eventService.getEventById(Number(id)).subscribe({
          next: (data) => {
              console.log('Event loaded:', data);
              this.event = data;
              this.cdr.detectChanges();
            },

          error: (err) => console.error('Failed to load event', err)
        });

    }

      this.modalService.joinModal$.subscribe(state => {
        this.isJoinModalOpen = state;
        this.cdr.detectChanges();
      });

      this.modalService.loginModal$.subscribe(state => {
        this.isModalOpen = state;
        this.cdr.detectChanges();
      });

      this.modalService.signupModal$.subscribe(state => {
        this.isSignupModalOpen = state;
        this.cdr.detectChanges();
      });

    }
  }


  openJoinModal(){
    this.modalService.openJoinModal();
  }


}
