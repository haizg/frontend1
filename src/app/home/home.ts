import {ChangeDetectorRef, Component, Inject, PLATFORM_ID} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {Navbar} from '../navbar/navbar';
import {EventService} from '../services/event.service';
import { Event } from '../models/event.model';
import {JoinCta} from '../shared/join-cta/join-cta';
import {Footer} from '../shared/footer/footer';
import {ModalService} from '../services/modal.service';
import {SignUpOrg} from '../sign-up/sign-up-org';
import {Login} from '../login/login';
import {UserService} from '../services/user.service';
import {Popup} from '../joinevents/popup/popup';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Navbar, RouterModule, JoinCta, Footer, SignUpOrg, Login, Popup],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  events: Event[] = [];
  userRole: string | null = null;
  userName: string = '';
  userPrenom: string = '';
  isLoggedIn: boolean = false;
  isModalOpen = false;
  isSignupModalOpen = false;
  isJoinModalOpen=false;


  constructor(private eventService: EventService,
              private modalService: ModalService,
              private userService: UserService,
              private  cdr:ChangeDetectorRef,
              @Inject(PLATFORM_ID) private platformId: Object) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.modalService.loginModal$.subscribe(state => {
        console.log('HOME received loginModal state:',state);
        this.isModalOpen = state;
        this.cdr.detectChanges();
      });

      this.modalService.signupModal$.subscribe(state => {
        this.isSignupModalOpen = state;
      });

      this.modalService.joinModal$.subscribe(state => {
        console.log('joinModal state', state);
        this.isJoinModalOpen = state;
      })


      this.userService.currentUser$.subscribe(user => {
        if (user) {
          this.isLoggedIn = true;
          this.userRole = user.role;
          this.userName = user.nom;
          this.userPrenom = user.prenom;
        } else {
          this.isLoggedIn = false;
          this.userRole = null;
          this.userName = '';
          this.userPrenom = '';
        }
      this.cdr.detectChanges();
      });
    }
      this.eventService.getEvents().subscribe({
        next: (data) => {
          console.log('Events received',data);
          this.events = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Failed to load events', err)
      });

  }

  get isOrganisateur(): boolean {
    return this.userRole === 'ROLE_ORGANISATEUR';
  }

  get isParticipant(): boolean {
    return this.userRole === 'ROLE_USER';
  }

  get fullName(): string {
    return `${this.userPrenom} ${this.userName}`;
  }

  openJoinModal(){
    console.log('openJoinModal called')
    this.modalService.openJoinModal();
  }
}




