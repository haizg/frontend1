import { ChangeDetectorRef, Component, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Navbar } from '../navbar/navbar';
import { EventService } from '../services/event.service';
import { EventModel } from '../models/event.model';
import { JoinCta } from '../shared/join-cta/join-cta';
import { Footer } from '../shared/footer/footer';
import { ModalService } from '../services/modal.service';
import { SignUpOrg } from '../sign-up/sign-up-org';
import { Login } from '../login/login';
import { UserService } from '../services/user.service';
import { Popup } from '../joinevents/popup/popup';
import { CreateEventModal } from '../create-event-modal/create-event-modal';
import { EditEventModal } from '../edit-event-modal/edit-event-modal';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {LangService} from '../services/lang.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Navbar, RouterModule, JoinCta, Footer, SignUpOrg, Login, Popup, CreateEventModal,EditEventModal],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home {
  @ViewChild(CreateEventModal) createEventModal!: CreateEventModal;
  @ViewChild(EditEventModal) editEventModal!: EditEventModal;

  events: EventModel[] = [];
  userRole: string | null = null;
  userName: string = '';
  userPrenom: string = '';
  userEmail: string = '';
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
    private http: HttpClient,
    private router: Router,
    public lang: LangService,
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
          this.userEmail = user.email;
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
  get availableEvents(): EventModel[] {
      return this.events.filter(event => !event.isFull);
    }
  canModifyEvent(event: EventModel): boolean {
    if (!this.isOrganisateur) {
      return false;
    }

    return event.organisateurEmail === this.userEmail;
  }




  goToSlide(index:number){
    this.currentSlide=index;
  }


  openCreateEventModal() {
    this.createEventModal.open();
  }

  onEventCreated() {
    console.log('onEventCreated called');
    this.eventService.getEvents().subscribe({
      next:(data)=> {
        console.log('Events reloaded:', data);
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

  openJoinModal(eventId:number) {
    if (!this.userService.getUser()){
      localStorage.setItem('redirectAfterLogin', this.router.url);
      this.modalService.openLoginModal();
      return;
      }
    this.modalService.openJoinModal(eventId);
  }



  openEditEventModal(eventModel: EventModel, $event: MouseEvent) {
    $event.stopPropagation();
    this.editEventModal.open(eventModel);  }



  deleteEvent(eventModel: EventModel, $event: MouseEvent) {
    $event.stopPropagation();
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${eventModel.title}" ?`)) {
      return;
    }

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.delete(`http://localhost:8081/api/events/${eventModel.id}`, { headers })
      .subscribe({
        next: () => {
          console.log('Event deleted successfully');

          window.location.reload();
        },
        error: (error) => {
          console.error('Error deleting event:', error);

          if (error.status === 403) {
            alert('Vous ne pouvez supprimer que vos propres événements');
          } else {
            alert('Erreur lors de la suppression de l\'événement');
          }
        }
      });
  }

  onEventUpdated() {
    window.location.reload();
  }
}
