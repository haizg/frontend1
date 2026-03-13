import { ChangeDetectorRef, Component, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Navbar } from '../navbar/navbar';
import { EventService } from '../services/event.service';
import { Event } from '../models/event.model';
import { JoinCta } from '../shared/join-cta/join-cta';
import { Footer } from '../shared/footer/footer';
import { ModalService } from '../services/modal.service';
import { SignUpOrg } from '../sign-up/sign-up-org';
import { Login } from '../login/login';
import { UserService } from '../services/user.service';
import { Popup } from '../joinevents/popup/popup';
import { CreateEventModal } from '../create-event-modal/create-event-modal';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Navbar, RouterModule, JoinCta, Footer, SignUpOrg, Login, Popup, CreateEventModal],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home {
  @ViewChild(CreateEventModal) createEventModal!: CreateEventModal;

  events: Event[] = [];
  userRole: string | null = null;
  userName: string = '';
  userPrenom: string = '';
  isLoggedIn = false;
  isModalOpen = false;
  isSignupModalOpen = false;
  isJoinModalOpen = false;

  currentSlide=0;
  slides=[
    { image : 'assets/slide1.jpg'},
    { image : 'assets/slide2.jpg'},
    { image : 'assets/slide3.jpg'},
    { image : 'assets/slide4.jpg'},
    { image : 'assets/slide5.jpg'},

  ]



  constructor(
    private eventService: EventService,
    private modalService: ModalService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.modalService.loginModal$.subscribe(state => {
        this.isModalOpen = state;
        this.cdr.detectChanges();
      });
      this.modalService.signupModal$.subscribe(state => {
        this.isSignupModalOpen = state;
        this.cdr.detectChanges();
      });

      this.modalService.joinModal$.subscribe(state => {
        this.isJoinModalOpen = state;
        this.cdr.detectChanges();
      });

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

      this.eventService.getEvents().subscribe({
        next:(data)=> {
          this.events = data;
          this.cdr.detectChanges();
        },
        error:(err) => console.error('Failed to load events',err)
      });

      setInterval(()=>{
        this.currentSlide=(this.currentSlide+1) % this.slides.length;
        this.cdr.detectChanges();
      },3000)

    }
  }



  goToSlide(index:number){
    this.currentSlide=index;
  }


  openCreateEventModal() {
    this.createEventModal.open();
  }

  onEventCreated() {
    this.eventService.getEvents().subscribe({
      next:(data)=> {
        this.events=data;
        this.cdr.detectChanges();
      },
    error:(err) => console.error('Failed to load events',err)
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

  openJoinModal() {
    this.modalService.openJoinModal();
  }
}
