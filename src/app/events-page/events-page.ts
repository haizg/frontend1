import {ChangeDetectorRef, Component, Inject, PLATFORM_ID} from '@angular/core';
import {Popup} from '../joinevents/popup/popup';
import {Login} from '../login/login';
import {SignUpOrg} from '../sign-up/sign-up-org';
import {Footer} from '../shared/footer/footer';
import {Navbar} from '../navbar/navbar';
import {EventModel} from '../models/event.model';
import {EventService} from '../services/event.service';
import {ModalService} from '../services/modal.service';
import {UserService} from '../services/user.service';
import {isPlatformBrowser} from '@angular/common';
import {RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-events-page',
  imports: [
    Popup,
    Login,
    SignUpOrg,
    Footer,
    Navbar,
    RouterLink,
    CommonModule
  ],
  templateUrl: './events-page.html',
  styleUrl: './events-page.css',
})
export class EventsPage {
  events: EventModel[]=[];
  isModalOpen = false;
  isSignupModalOpen=false;
  isJoinModalOpen=false;
  isLoggedIn=false;
  userRole:string|null=null;
  userEmail:string='';

  constructor(
    private eventService: EventService,
    private modalService: ModalService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}


  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('user');
      if (userStr) this.userService.setUser(JSON.parse(userStr));

      this.userService.currentUser$.subscribe(user => {
        if (user) {
          this.isLoggedIn = true;
          this.userRole = user.role;
          this.userEmail = user.email;
        } else {
          this.isLoggedIn = false;
          this.userRole = null;
        }
        this.cdr.detectChanges();
      });

      this.modalService.loginModal$.subscribe(state => { this.isModalOpen = state; this.cdr.detectChanges(); });
      this.modalService.signupModal$.subscribe(state => { this.isSignupModalOpen = state; this.cdr.detectChanges(); });
      this.modalService.joinModal$.subscribe(state => { this.isJoinModalOpen = state; this.cdr.detectChanges(); });

      this.eventService.getEvents().subscribe({
        next: (data) => { this.events = data; this.cdr.detectChanges(); },
        error: (err) => console.error('Failed to load events', err)
      });
    }
  }
 get fullEventsCount(): number {
    return this.events.filter(event => event.isFull).length;
  }


  openJoinModal(eventId: number) {
    this.modalService.openJoinModal(eventId);
  }

  get isOrganisateur(): boolean {
    return this.userRole === 'ROLE_ORGANISATEUR';
  }
}
