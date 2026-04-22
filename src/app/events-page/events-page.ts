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
import { ConfirmDelete } from '../confirm-delete/confirm-delete';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-events-page',
  imports: [Popup, Login, SignUpOrg, Footer, Navbar, RouterLink,
    CommonModule, EditEventModal, TranslateModule, ConfirmDelete ],
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
    private apiService : ApiService,
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

  private sortEventsByClosestToToday(events: EventModel[]): EventModel[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return [...events].sort((a, b) => {
      const dateA = new Date(a.date);
      dateA.setHours(0, 0, 0, 0);
      const dateB = new Date(b.date);
      dateB.setHours(0, 0, 0, 0);

      const diffA = Math.abs(dateA.getTime() - today.getTime());
      const diffB = Math.abs(dateB.getTime() - today.getTime());

      return diffA - diffB;
    });
  }


  applyFilters() {
    this.filteredEvents = this.allEvents.filter(event => {
      const matchesCategory = this.selectedCategory === 'all' || event.category === this.selectedCategory;
      const matchesDate = !this.selectedDate || event.date === this.selectedDate;
      return matchesCategory && matchesDate;
    });
  }

  loadEvents() {
    this.isLoadingEvents = true;
    this.allEvents = [];
    this.filteredEvents = [];

    this.apiService.getEvents().subscribe({
      next: (data) => {
        const sortedData = this.sortEventsByClosestToToday(data);
        this.allEvents = sortedData;
        this.categories = Array.from(new Set(sortedData.map(e => e.category)));
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

  deleteEvent(eventModel: EventModel, $event: MouseEvent) {
    $event.stopPropagation();
    this.modalService.openDeleteModal(
      'Supprimer l\'événement',
      `Êtes-vous sûr de vouloir supprimer "${eventModel.title}" ?`,
      () => {
        this.isDeleting = true;
        this.apiService.deleteEvent(eventModel.id).subscribe({
          next: () => {
            this.isDeleting = false;
            this.loadEvents();
          },
          error: () => {
            this.isDeleting = false;
          }
        });
      }
    );
  }

  loadMyParticipations() {
    this.apiService.getMyParticipationsIds().subscribe({
        next: (ids) => {
          this.participatedEventIds = new Set(ids);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Failed to load participations', err)
      });
  }

  openEditEventModal(eventModel: EventModel, $event: MouseEvent) {
    $event.stopPropagation();
    this.editEventModal.open(eventModel, false, 0, this.isAdmin);
  }

  openJoinModal(eventId: number) {
    this.modalService.openJoinModal(eventId);
  }

  canModifyEvent(event: EventModel): boolean {
    if (!this.isOrganisateur) {
      return false;
    }
    return event.organisateurEmail === this.userEmail;
  }

  get fullEventsCount(): number {
    return this.allEvents.filter(event => event.isFull).length;
  }

  get isAdmin(): boolean {
    return this.userRole === 'ROLE_ADMIN';
  }

  get isOrganisateur(): boolean {
    return this.userRole === 'ROLE_ORGANISATEUR';
  }

  hasParticipated(eventId: number): boolean {
    return this.participatedEventIds.has(eventId);
  }

  onEventUpdated() {
    this.loadEvents();
  }

  onCategoryChange(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onDateChange(date: string) {
    this.selectedDate = date;
    this.applyFilters();
  }
}
