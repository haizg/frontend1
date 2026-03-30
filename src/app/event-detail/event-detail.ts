import {ChangeDetectorRef, Component, Inject, PLATFORM_ID, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {EventService} from '../services/event.service';
import {ModalService} from '../services/modal.service';
import {EventModel} from '../models/event.model';
import {isPlatformBrowser, CommonModule} from '@angular/common';
import {Navbar} from '../navbar/navbar';
import {Footer} from '../shared/footer/footer';
import {Popup} from '../joinevents/popup/popup';
import {Login} from '../login/login';
import {SignUpOrg} from '../sign-up/sign-up-org';
import {RouterModule, Router} from '@angular/router';
import {UserService} from '../services/user.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {EditEventModal} from '../edit-event-modal/edit-event-modal';
import { LangService } from '../services/lang.service';

@Component({
  selector: 'app-event-detail',
  imports: [Navbar, Footer, Popup, CommonModule, Login, SignUpOrg, RouterModule, EditEventModal],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css',
})
export class EventDetail {
  @ViewChild(EditEventModal) editEventModal!: EditEventModal;

  event: EventModel | null = null;
  isJoinModalOpen = false;
  isModalOpen = false;
  isSignupModalOpen = false;
  isLoggedIn = false;
  userRole: string | null = null;
  userEmail: string = '';
  participants: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private modalService: ModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private userService: UserService,
    private http: HttpClient,
    public lang: LangService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    //this.lang.lang$.subscribe(() => {
    //  this.cdr.detectChanges();
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
          this.userEmail = '';
        }
        this.cdr.detectChanges();
      });

      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.eventService.getEventById(Number(id)).subscribe({
          next: (data) => {
            this.event = data;
            this.cdr.detectChanges();
            if (this.isMyEvent || this.isAdmin) {
              this.loadParticipants(Number(id));
            }
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

  loadParticipants(eventId: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({'Authorization': `Bearer ${token}`});
    this.http.get<any[]>(`http://localhost:8081/api/events/${eventId}/participants`, {headers})
      .subscribe({
        next: (data) => {
          this.participants = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Failed to load participants', err)
      });
  }

  get isOrganisateur(): boolean {
    return this.userRole === 'ROLE_ORGANISATEUR';
  }

  get isMyEvent(): boolean {
    return this.event?.organisateurEmail === this.userEmail;
  }

  get verifiedParticipants(): any[] {
    return this.participants.filter(p => p.verified);
  }

  get totalPeople(): number {
    return this.verifiedParticipants.reduce((sum, p) => sum + (p.numberOfPeople || 1), 0);
  }

  get capacityPercentage(): number {
    if (!this.event?.maxParticipants) return 0;
    return Math.min(100, Math.round((this.totalPeople / this.event.maxParticipants) * 100));
  }

  get isAdmin(): boolean {
    return this.userRole === 'ROLE_ADMIN';
  }


  openJoinModal(eventId: number) {
    if (!this.userService.getUser()) {
      localStorage.setItem('redirectAfterLogin', this.router.url);
      this.modalService.openLoginModal();
      return;
    }
    this.modalService.openJoinModal(eventId);
  }

  openEditEventModal() {
    if (this.event) {
      this.editEventModal.open(this.event);
    }
  }

  onEventUpdated() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventService.getEventById(Number(id)).subscribe({
        next: (data) => {
          this.event = data;
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteEvent() {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${this.event?.title}" ?`)) return;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({'Authorization': `Bearer ${token}`});
    const url = this.isAdmin
        ? `http://localhost:8081/api/events/admin/${this.event?.id}`
        : `http://localhost:8081/api/events/${this.event?.id}`;

    this.http.delete(url, {headers})
      .subscribe({
        next: () => this.router.navigate(['/events']),
        error: (err) => console.error('Delete failed', err)
      });
  }
}
