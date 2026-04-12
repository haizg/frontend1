import { ChangeDetectorRef, Component, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../services/user.service';
import { EventModel } from '../models/event.model';
import { EditEventModal } from '../edit-event-modal/edit-event-modal';
import { ConfirmLogout } from '../confirm-logout/confirm-logout';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule,
    EditEventModal, FormsModule,
    TranslateModule, ConfirmLogout],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  @ViewChild(EditEventModal) editEventModal!: EditEventModal;

  stats: any = null;
  users: any[] = [];
  events: EventModel[] = [];
  organisateurs: any[] = [];
  activeTab = 'overview';
  adminName = '';
  isLoadingDetails = false;
  eventSearch: string = '';

  // Detail panel
  selectedUser: any = null;
  selectedOrg: any = null;
  userEvents: any[] = [];
  orgEvents: any[] = [];
  showDetailPanel = false;

  // Edit User
  showEditUser = false;
  editingUser: any = null;

  // Edit Org
  showEditOrg = false;
  editingOrg: any = null;

  //Delete modal
  showDeleteConfirm = false;
  deleteConfirmTitle = '';
  deleteConfirmMessage = '';
  private pendingDeleteFn: (() => void) | null = null;


  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    public modalService: ModalService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role !== 'ROLE_ADMIN') {
          this.router.navigate(['/home']);
          return;
        }
        this.adminName = user.prenom + ' ' + user.nom;
        this.userService.setUser(user);
      } else {
        this.router.navigate(['/home']);
        return;
      }
      this.loadStats();
      this.loadUsers();
      this.loadEvents();
      this.loadOrganisateurs();
    }
  }


  get pendingEvents(): EventModel[] {
    return this.events.filter(e => !(e as any).approved);
  }

  get approvedEvents(): EventModel[] {
    return this.events.filter(e => (e as any).approved);
  }


  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }


  loadStats() {
    this.http.get(`http://localhost:8081/api/admin/stats`, { headers: this.getHeaders() })
      .subscribe({ next: (data) => { this.stats = data; this.cdr.detectChanges(); } });
  }

  loadUsers() {
    this.http.get<any[]>(`http://localhost:8081/api/admin/users`, { headers: this.getHeaders() })
      .subscribe({ next: (data) => { this.users = data; this.cdr.detectChanges(); } });
  }

  loadEvents() {
    this.http.get<EventModel[]>(`http://localhost:8081/api/admin/events/all`, { headers: this.getHeaders() })
      .subscribe({ next: (data) => { this.events = data; this.cdr.detectChanges(); } });
  }

  loadOrganisateurs() {
    this.http.get<any[]>(`http://localhost:8081/api/admin/organisateurs`, { headers: this.getHeaders() })
      .subscribe({ next: (data) => { this.organisateurs = data; this.cdr.detectChanges(); } });
  }

  // SHARED DELETE TRIGGER
    private requestDelete(title: string, message: string, fn: () => void) {
      this.deleteConfirmTitle = title;
      this.deleteConfirmMessage = message;
      this.pendingDeleteFn = fn;
      this.showDeleteConfirm = true;
    }

    confirmDelete() {
      this.showDeleteConfirm = false;
      this.pendingDeleteFn?.();
      this.pendingDeleteFn = null;
    }



  deleteUser(userId: number) {
    this.requestDelete(
      'Supprimer l\'utilisateur',
      'Cet utilisateur sera définitivement supprimé.',
      () => this.http.delete(`http://localhost:8081/api/admin/users/${userId}`, { headers: this.getHeaders() })
        .subscribe({ next: () => this.loadUsers() })
    );
  }

  deleteOrganisateur(id: number) {
    this.requestDelete(
      'Supprimer l\'organisateur',
      'Cet organisateur sera définitivement supprimé.',
      () => this.http.delete(`http://localhost:8081/api/admin/organisateurs/${id}`, { headers: this.getHeaders() })
        .subscribe({ next: () => this.loadOrganisateurs() })
    );
  }

deleteEvent(eventId: number) {
  this.requestDelete(
    'Supprimer l\'événement',
    'Cet événement et toutes ses inscriptions seront définitivement supprimés.',
    () => this.http.delete(`http://localhost:8081/api/events/admin/${eventId}`, { headers: this.getHeaders() })
      .subscribe({ next: () => this.loadEvents() })
  );
}


  approveEvent(event: any) {
    if (event.approved) return; // guard: never un-approve
    this.http.put(
      `http://localhost:8081/api/admin/events/${event.id}/approve`,
      {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res: any) => {
        event.approved = true; // always set to true, never toggle
        this.loadStats();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to approve event', err)
    });
  }


  get filteredPendingEvents(): any[] {
    return this.pendingEvents.filter(e => this.matchesSearch(e));
  }

  get filteredApprovedEvents(): any[] {
    return this.approvedEvents.filter(e => this.matchesSearch(e));
  }

  private matchesSearch(event: any): boolean {
    if (!this.eventSearch.trim()) return true;
    const q = this.eventSearch.toLowerCase();
    return (
      event.title?.toLowerCase().includes(q) ||
      event.category?.toLowerCase().includes(q) ||
      event.location?.toLowerCase().includes(q) ||
      event.organisateurEmail?.toLowerCase().includes(q)
    );
  }



  openEditEvent(event: EventModel) {
    this.editEventModal.open(event, false, 0);
  }

  onEventUpdated() {
    this.loadEvents();
  }


  openEditUser(user: any) {
    this.editingUser = { ...user };
    this.showEditUser = true;
    this.cdr.detectChanges();
  }

  saveEditUser() {
    this.http.put(
      `http://localhost:8081/api/admin/users/${this.editingUser.id}`,
      this.editingUser,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => { this.showEditUser = false; this.loadUsers(); },
      error: (err) => console.error('Failed to update user', err)
    });
  }


  openEditOrg(org: any) {
    this.editingOrg = { ...org };
    this.showEditOrg = true;
    this.cdr.detectChanges();
  }

  saveEditOrg() {
    this.http.put(
      `http://localhost:8081/api/admin/organisateurs/${this.editingOrg.id}`,
      this.editingOrg,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => { this.showEditOrg = false; this.loadOrganisateurs(); },
      error: (err) => console.error('Failed to update org', err)
    });
  }


  viewUserDetails(user: any) {
    this.showDetailPanel = false;
    this.selectedUser = null;
    this.selectedOrg = null;
    this.userEvents = [];
    this.orgEvents = [];
    this.isLoadingDetails = true;
    this.cdr.detectChanges();

    this.http.get<any[]>(
      `http://localhost:8081/api/admin/user/${user.id}/participations`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.selectedUser = user;
        this.userEvents = data;
        this.showDetailPanel = true;
        this.isLoadingDetails = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load user participations', err);
        this.isLoadingDetails = false;
        this.cdr.detectChanges();
      }
    });
  }

  viewOrgDetails(org: any) {
    this.showDetailPanel = false;
    this.selectedUser = null;
    this.selectedOrg = null;
    this.userEvents = [];
    this.orgEvents = [];
    this.isLoadingDetails = true;
    this.cdr.detectChanges();

    this.http.get<any[]>(
      `http://localhost:8081/api/admin/organisateur/${org.id}/events`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.selectedOrg = org;
        this.orgEvents = data;
        this.showDetailPanel = true;
        this.isLoadingDetails = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load org events', err);
        this.isLoadingDetails = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeDetailPanel() {
    this.showDetailPanel = false;
    this.selectedUser = null;
    this.selectedOrg = null;
    this.userEvents = [];
    this.orgEvents = [];
  }


  toggleVerifyOrg(org: any) {
    if (!org.id) { console.error('Organizer ID is undefined', org); return; }
    this.http.put(
      `http://localhost:8081/api/admin/organisateurs/${org.id}/verify`,
      {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res: any) => {
        org.adminVerified = res.adminVerified;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error toggling verification:', err)
    });
  }





  getRoleBadge(role: string): string {
    if (role === 'ROLE_ADMIN') return 'Admin';
    if (role === 'ROLE_ORGANISATEUR') return 'Organisateur';
    return 'Participant';
  }
}
