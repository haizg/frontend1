import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../services/user.service';
import { EventModel } from '../models/event.model';
import { EditEventModal } from '../edit-event-modal/edit-event-modal';
import { ConfirmLogout } from '../confirm-logout/confirm-logout';
import { ModalService } from '../services/modal.service';
import { ConfirmDelete } from '../confirm-delete/confirm-delete';
import { TranslateLangService } from '../services/translate-lang.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule,
    EditEventModal, FormsModule,
    TranslateModule, ConfirmLogout,
    ConfirmDelete],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit{
  @ViewChild(EditEventModal) editEventModal!: EditEventModal;

  stats: any = null;
  users: any[] = [];
  events: EventModel[] = [];
  organisateurs: any[] = [];
  activeTab = 'overview';
  adminName = '';
  isLoadingDetails = false;
  eventSearch: string = '';
  deactivationRequests: any[] = [];
  expandedAiRow: number | null = null;

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

  constructor(
    private apiService : ApiService,
    private router: Router,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    public modalService: ModalService,
    private translateLang: TranslateLangService,
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
      this.loadDeactivationRequests();
    }
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

  get pendingEvents(): EventModel[] {
    return this.events.filter(e => !(e as any).approved);
  }

  get approvedEvents(): EventModel[] {
    return this.events.filter(e => (e as any).approved);
  }

  get filteredPendingEvents(): any[] {
    return this.pendingEvents.filter(e => this.matchesSearch(e));
  }

  get filteredApprovedEvents(): any[] {
    return this.approvedEvents.filter(e => this.matchesSearch(e));
  }

  getRoleBadge(role: string): string {
    if (role === 'ROLE_ADMIN') return 'Admin';
    if (role === 'ROLE_ORGANISATEUR') return 'Organisateur';
    return 'Participant';
  }

  openEditEvent(event: EventModel) {
    this.editEventModal.open(event, false, 0, true);
  }

  openEditUser(user: any) {
    this.editingUser = { ...user };
    this.showEditUser = true;
    this.cdr.detectChanges();
  }

  openEditOrg(org: any) {
    this.editingOrg = { ...org };
    this.showEditOrg = true;
    this.cdr.detectChanges();
  }

  closeDetailPanel() {
    this.showDetailPanel = false;
    this.selectedUser = null;
    this.selectedOrg = null;
    this.userEvents = [];
    this.orgEvents = [];
  }

  onEventUpdated() {
    this.loadEvents();
    this.cdr.detectChanges();
  }

  toggleAiPanel(eventId: number) {
    this.expandedAiRow = this.expandedAiRow === eventId ? null : eventId;
  }

  loadStats() {
    this.apiService.getAdminStats().subscribe({
      next: (data) => { this.stats = data; this.cdr.detectChanges(); }
    });
  }

  loadUsers() {
    this.apiService.getAdminUsers().subscribe({
      next: (data) => { this.users = data; this.cdr.detectChanges(); }
    });
  }

  loadEvents() {
    this.apiService.getAdminEvents().subscribe({
      next: (data) => { this.events = data; this.cdr.detectChanges(); }
    });
  }

  loadOrganisateurs() {
    this.apiService.getAdminOrganisateurs().subscribe({
      next: (data) => { this.organisateurs = data; this.cdr.detectChanges(); }
    });
  }

  loadDeactivationRequests() {
    this.apiService.getDeactivationRequests().subscribe({
      next: (data) => { this.deactivationRequests = data; this.cdr.detectChanges(); }
    });
  }

  deleteUser(userId: number) {
    this.modalService.openDeleteModal(
      'Supprimer l\'utilisateur',
      'Cet utilisateur sera définitivement supprimé.',
      () => this.apiService.deleteAdminUser(userId).subscribe({
        next: () => this.loadUsers()
      })
    );
  }

  deleteOrganisateur(id: number) {
    this.modalService.openDeleteModal(
      'Supprimer l\'organisateur',
      'Cet organisateur sera définitivement supprimé.',
      () => this.apiService.deleteAdminOrganisateur(id).subscribe({
        next: () => this.loadOrganisateurs()
      })
    );
  }

  deleteEvent(eventId: number) {
    this.modalService.openDeleteModal(
      'Supprimer l\'événement',
      'Cet événement et toutes ses inscriptions seront définitivement supprimés.',
      () => this.apiService.deleteEvent(eventId).subscribe({
        next: () => this.loadEvents()
      })
    );
}

  approveEvent(event: any) {
    if (event.approved) return;
    this.apiService.approveEvent(event.id).subscribe({
      next: (res: any) => {
        event.approved = true;
        this.loadStats();
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Failed to approve event', err)
    });
  }

  saveEditUser() {
    this.apiService.updateAdminUser(this.editingUser.id, this.editingUser).subscribe({
      next: () => { this.showEditUser = false; this.loadUsers(); },
      error: (err: any) => console.error('Failed to update user', err)
    });
  }

  saveEditOrg() {
    this.apiService.updateAdminOrganisateur(this.editingOrg.id, this.editingOrg).subscribe({
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

    this.apiService.getUserParticipations(user.id).subscribe({
      next: (data) => {
        this.selectedUser = user;
        this.userEvents = data;
        this.showDetailPanel = true;
        this.isLoadingDetails = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
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

    this.apiService.getOrganisateurEvents(org.id).subscribe({
      next: (data) => {
        this.selectedOrg = org;
        this.orgEvents = data;
        this.showDetailPanel = true;
        this.isLoadingDetails = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load org events', err);
        this.isLoadingDetails = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleVerifyOrg(org: any) {
    if (!org.id) { console.error('Organizer ID is undefined', org); return; }
    this.apiService.toggleVerifyOrganisateur(org.id).subscribe({
      next: (res: any) => {
        org.adminVerified = res.adminVerified;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error toggling verification:', err)
    });
  }

  approveDeactivation(org: any) {
    this.modalService.openDeleteModal(
      'Approuver la désactivation',
      `Confirmer la désactivation du compte de ${org.prenom} ${org.nom} ?`,
      () => this.apiService.approveDeactivation(org.id).subscribe({
      next: () => {
        this.loadDeactivationRequests();
        this.loadOrganisateurs();
      }})
    );
  }

  rejectDeactivation(org: any) {
    this.apiService.rejectDeactivation(org.id).subscribe({
      next: () => this.loadDeactivationRequests() });
  }
}
