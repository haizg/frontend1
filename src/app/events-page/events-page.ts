import {ChangeDetectorRef, Component, Inject, PLATFORM_ID,ViewChild} from '@angular/core';
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
import { EditEventModal } from '../edit-event-modal/edit-event-modal';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {LangService} from '../services/lang.service';

@Component({
  selector: 'app-events-page',
  imports: [
    Popup,
    Login,
    SignUpOrg,
    Footer,
    Navbar,
    RouterLink,
    CommonModule,
    EditEventModal
  ],
  templateUrl: './events-page.html',
  styleUrl: './events-page.css',
})
export class EventsPage {

    @ViewChild(EditEventModal) editEventModal!: EditEventModal;


  events: EventModel[]=[];
  isModalOpen = false;
  isSignupModalOpen=false;
  isJoinModalOpen=false;
  isLoggedIn=false;
  userRole:string|null=null;
  userEmail:string='';

  // Add these properties at the top of your class
  allEvents: EventModel[] = [];        // Keep all events
  filteredEvents: EventModel[] = [];   // Events displayed after filter

  categories: string[] = [];           // All categories for filter dropdown
  selectedCategory: string = 'all';    // Current category filter
  selectedDate: string = '';           // Current date filter


  constructor(
    private eventService: EventService,
    private modalService: ModalService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    public lang: LangService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}


  ngOnInit() {
    //this.lang.lang$.subscribe(() => {
      //this.cdr.detectChanges();
    //});

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

      this.modalService.loginModal$.subscribe((state: boolean) => {
        this.isModalOpen = state;
        this.cdr.detectChanges(); });

      this.modalService.signupModal$.subscribe((state: boolean) => {
        this.isSignupModalOpen = state;
        this.cdr.detectChanges(); });

      this.modalService.joinModal$.subscribe((state: boolean) => {
        this.isJoinModalOpen = state;
        this.cdr.detectChanges(); });

      this.loadEvents();


      setTimeout(() => {
        this.cdr.detectChanges();
      });
    }
  }



  loadEvents() {
    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.allEvents = data;
        this.categories = Array.from(new Set(data.map(e => e.category))); // unique categories
        this.applyFilters(); // initialize filteredEvents
        this.cdr.detectChanges(); // 👈 KEEP THIS HERE
      },
      error: (err) => console.error('Failed to load events', err)
    });
  }



  applyFilters() {
    this.filteredEvents = this.allEvents.filter(event => {
      const matchesCategory = this.selectedCategory === 'all' || event.category === this.selectedCategory;
      const matchesDate = !this.selectedDate || event.date === this.selectedDate;
      return matchesCategory && matchesDate;
    });
  }



  onCategoryChange(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onDateChange(date: string) {
    this.selectedDate = date;
    this.applyFilters();
  }






 get fullEventsCount(): number {
    return this.allEvents.filter(event => event.isFull).length;
  }


  openJoinModal(eventId: number) {
    this.modalService.openJoinModal(eventId);
  }

  get isOrganisateur(): boolean {
    return this.userRole === 'ROLE_ORGANISATEUR';
  }


  canModifyEvent(event: EventModel): boolean {
    if (!this.isOrganisateur) {
      return false;
    }

    return event.organisateurEmail === this.userEmail;
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

            this.loadEvents();
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
      this.loadEvents();
    }
}
