import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, PLATFORM_ID, ViewChild, AfterViewInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
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
import { TranslateLangService } from '../services/translate-lang.service';
import { ConfirmDelete } from '../confirm-delete/confirm-delete';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, Navbar, RouterModule,
  JoinCta, Footer, SignUpOrg, Login,
   Popup, CreateEventModal, EditEventModal,
   TranslateModule, ConfirmDelete],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements AfterViewInit {
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
  isLoadingEvents = false;
  isDeleting = false;
  isJoining = false;

  availableEvents: EventModel[] = [];
  isAdminVerified = false;
  participatedEventIds: Set<number> = new Set();

  recommendations: { event: EventModel; reason: string }[] = [];
  isLoadingRecommendations = false;
  eventsLoaded = false;
  participationsLoaded = false;
  recommendationsRequested = false;

  currentSlide = 0;
  slides = [
    { image: 'assets/slide1.jpg' },
    { image: 'assets/slide2.jpg' },
    { image: 'assets/slide3.jpg' },
    { image: 'assets/slide4.jpg' },
    { image: 'assets/slide5.jpg' },
  ];

  constructor(
    private eventService: EventService,
    private modalService: ModalService,
    private userService: UserService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private translateLang: TranslateLangService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 100);
    }
  }

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
          this.isAdminVerified = user.adminVerified || false;
          this.loadMyParticipations();
        } else {
          this.isLoggedIn = false;
          this.userRole = null;
          this.userName = '';
          this.userPrenom = '';
          this.isAdminVerified = false;
          this.participatedEventIds = new Set();
        }
        this.cdr.detectChanges();
      });

      this.loadEvents();

      setInterval(() => {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.cdr.detectChanges();
      }, 3000);
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

  loadEvents() {
    this.isLoadingEvents = true;
    this.events = [];
    this.availableEvents = [];
    this.eventsLoaded = false;

    const slowConnectionTimeout = setTimeout(() => {
      if (this.isLoadingEvents) {
        console.log('Loading is taking longer than expected...');
        this.cdr.detectChanges();
      }
    }, 2000);

    this.apiService.getEvents().subscribe({
      next: (data) => {
        clearTimeout(slowConnectionTimeout);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sortedData = this.sortEventsByClosestToToday(data);
        this.events = sortedData;

        this.availableEvents = sortedData.filter(event => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          return !event.isFull && eventDate >= today;
        });

        this.isLoadingEvents = false;
        this.eventsLoaded = true;
        this.tryLoadRecommendations();
        this.cdr.detectChanges();
      },
      error: (err) => {
        clearTimeout(slowConnectionTimeout);
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
          error: (error: any) => {
            this.isDeleting = false;
          }
        });
      }
    );
  }

  loadMyParticipations() {
    this.participationsLoaded = false;
    this.apiService.getMyParticipationsIds().subscribe({
      next: (ids: number[]) => {
        this.participatedEventIds = new Set(ids);
        this.participationsLoaded = true;
        this.tryLoadRecommendations();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load participations', err);
        this.participationsLoaded = true;
        this.tryLoadRecommendations();
        this.cdr.detectChanges();
      }
    });
  }

  private tryLoadRecommendations() {
    if (!this.eventsLoaded || !this.participationsLoaded) return;
    if (!this.isLoggedIn || (!this.isParticipant && !this.isOrganisateur)) return;
    if (this.recommendationsRequested) return;
    this.recommendationsRequested = true;
    this.loadRecommendations();
  }

  loadRecommendations() {
    if (!this.isLoggedIn || (!this.isParticipant && !this.isOrganisateur)) return;
    if (this.events.length === 0) return;

    this.isLoadingRecommendations = true;

    const notJoined = this.events.filter(e => !this.participatedEventIds.has(e.id));
    if (notJoined.length === 0) { this.isLoadingRecommendations = false; return; }

    const history = this.events
      .filter(e => this.participatedEventIds.has(e.id))
      .map(e => ({ title: e.title, category: e.category }));

    this.apiService.getRecommendations(history, notJoined).subscribe({
      next: (res) => {
        this.recommendations = res.recommendations
          .map(r => ({
            event: this.events.find(e => e.id === r.id)!,
            reason: r.reason
          }))
          .filter(r => r.event != null);
        this.isLoadingRecommendations = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Recommendations failed', err);
        this.isLoadingRecommendations = false;
        this.cdr.detectChanges();
      }
    });
  }

  canModifyEvent(event: EventModel): boolean {
    if (!this.isOrganisateur) return false;
    return event.organisateurEmail === this.userEmail;
  }

  openJoinModal(eventId: number) {
    if (!this.userService.getUser()) {
      localStorage.setItem('redirectAfterLogin', this.router.url);
      this.modalService.openLoginModal();
      return;
    }
    this.modalService.openJoinModal(eventId);
  }

  openEditEventModal(eventModel: EventModel, $event: MouseEvent) {
    $event.stopPropagation();
    this.editEventModal.open(eventModel, false, 0, this.isAdmin);
  }

  hasParticipated(eventId: number): boolean {
    return this.participatedEventIds.has(eventId);
  }

  get isOrganisateur(): boolean { return this.userRole === 'ROLE_ORGANISATEUR'; }
  get isParticipant(): boolean { return this.userRole === 'ROLE_USER'; }
  get isAdmin(): boolean { return this.userRole === 'ROLE_ADMIN'; }
  get fullName(): string { return `${this.userPrenom} ${this.userName}`; }

  goToSlide(index: number) { this.currentSlide = index; }
  openCreateEventModal() { this.createEventModal.open(); }
  onEventCreated() { this.loadEvents(); }
  onEventUpdated() { this.loadEvents(); }
}
