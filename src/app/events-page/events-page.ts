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
import { TranslateModule } from '@ngx-translate/core';
import { TranslateLangService } from '../services/translate-lang.service';

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
    EditEventModal,
    TranslateModule
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
  participatedEventIds: Set<number> = new Set();

  // Loading states
  isLoadingEvents = false;
  isDeleting = false;
  isJoining = false;

  allEvents: EventModel[] = [];
  filteredEvents: EventModel[] = [];
  categories: string[] = [];
  selectedCategory: string = 'all';
  selectedDate: string = '';

  constructor(
    private eventService: EventService,
    private modalService: ModalService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private translateLang: TranslateLangService,
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
          this.loadMyParticipations();
        } else {
          this.isLoggedIn = false;
          this.userRole = null;
          this.participatedEventIds = new Set();
        }
        this.cdr.detectChanges();
      });

      this.modalService.loginModal$.subscribe((state: boolean) => {
        this.isModalOpen = state;
        this.cdr.detectChanges();
      });

      this.modalService.signupModal$.subscribe((state: boolean) => {
        this.isSignupModalOpen = state;
        this.cdr.detectChanges();
      });

      this.modalService.joinModal$.subscribe((state: boolean) => {
        this.isJoinModalOpen = state;
        this.cdr.detectChanges();
      });

      this.loadEvents();

      setTimeout(() => {
        this.cdr.detectChanges();
      });
    }
  }

  loadEvents() {
    this.isLoadingEvents = true;
    this.allEvents = [];
    this.filteredEvents = [];

    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.allEvents = data;
        this.categories = Array.from(new Set(data.map(e => e.category)));
        this.applyFilters();
        this.isLoadingEvents = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load events', err);
        this.isLoadingEvents = false;
        this.cdr.detectChanges();
      }
    });
  }

  get isAdmin(): boolean {
    return this.userRole === 'ROLE_ADMIN';
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
    this.editEventModal.open(eventModel);
  }

  deleteEvent(eventModel: EventModel, $event: MouseEvent) {
    $event.stopPropagation();
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${eventModel.title}" ?`)) return;

    this.isDeleting = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const url = this.isAdmin
      ? `http://localhost:8081/api/events/admin/${eventModel.id}`
      : `http://localhost:8081/api/events/${eventModel.id}`;

    this.http.delete(url, { headers }).subscribe({
      next: () => {
        this.isDeleting = false;
        this.loadEvents();
      },
      error: (error) => {
        this.isDeleting = false;
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

  loadMyParticipations() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.get<number[]>('http://localhost:8081/api/user/my-participations', { headers })
      .subscribe({
        next: (ids) => {
          this.participatedEventIds = new Set(ids);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Failed to load participations', err)
      });
  }

  hasParticipated(eventId: number): boolean {
    return this.participatedEventIds.has(eventId);
  }
}
