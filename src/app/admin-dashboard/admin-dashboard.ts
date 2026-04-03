import { ChangeDetectorRef, Component, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../services/user.service';
import { EventModel } from '../models/event.model';
import { EditEventModal } from '../edit-event-modal/edit-event-modal';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, EditEventModal, FormsModule, TranslateModule],
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

  // Detail panel
  selectedUser: any = null;
  selectedOrg: any = null;
  userEvents: any[] = [];
  orgEvents: any[] = [];
  showDetailPanel = false;

  // Add User form
  showAddUser = false;
  newUser = { prenom: '', nom: '', email: '', password: '', role: 'ROLE_USER' };
  addUserMessage = '';

  // Add Org form
  showAddOrg = false;
  newOrg = { prenom: '', nom: '', email: '', password: '', nomOrganisation: '' };
  addOrgMessage = '';

  // Edit User
  showEditUser = false;
  editingUser: any = null;

  // Edit Org
  showEditOrg = false;
  editingOrg: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
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

  // DELETE
  deleteUser(userId: number) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    this.http.delete(`http://localhost:8081/api/admin/users/${userId}`, { headers: this.getHeaders() })
      .subscribe({ next: () => this.loadUsers() });
  }

  deleteOrganisateur(id: number) {
    if (!confirm('Supprimer cet organisateur ?')) return;
    this.http.delete(`http://localhost:8081/api/admin/organisateurs/${id}`, { headers: this.getHeaders() })
      .subscribe({ next: () => this.loadOrganisateurs() });
  }

  deleteEvent(eventId: number) {
    if (!confirm('Supprimer cet événement ?')) return;
    this.http.delete(`http://localhost:8081/api/events/admin/${eventId}`, { headers: this.getHeaders() })
      .subscribe({ next: () => this.loadEvents() });
  }

  // EDIT EVENT
  openEditEvent(event: EventModel) {
    this.editEventModal.open(event);
  }

  onEventUpdated() {
    this.loadEvents();
  }

  // EDIT USER
  openEditUser(user: any) {
    this.editingUser = { ...user };
    this.showEditUser = true;
    this.cdr.detectChanges();
  }

  saveEditUser() {
    this.http.put(`http://localhost:8081/api/admin/users/${this.editingUser.id}`,
      this.editingUser, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.showEditUser = false;
          this.loadUsers();
        },
        error: (err) => console.error('Failed to update user', err)
      });
  }

  // EDIT ORG
  openEditOrg(org: any) {
    this.editingOrg = { ...org };
    this.showEditOrg = true;
    this.cdr.detectChanges();
  }

  saveEditOrg() {
    this.http.put(`http://localhost:8081/api/admin/organisateurs/${this.editingOrg.id}`,
      this.editingOrg, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.showEditOrg = false;
          this.loadOrganisateurs();
        },
        error: (err) => console.error('Failed to update org', err)
      });
  }

  // ADD USER
  submitAddUser() {
    this.http.post(`http://localhost:8081/api/admin/users`, this.newUser, { headers: this.getHeaders(), responseType: 'text' })
      .subscribe({
        next: () => {
          this.addUserMessage = 'Utilisateur ajouté avec succès.';
          this.loadUsers();
          setTimeout(() => { this.showAddUser = false; this.addUserMessage = ''; }, 1500);
        },
        error: () => this.addUserMessage = 'Erreur lors de l\'ajout.'
      });
  }

  // ADD ORG
  submitAddOrg() {
    this.http.post(`http://localhost:8081/api/admin/organisateurs`, this.newOrg, { headers: this.getHeaders(), responseType: 'text' })
      .subscribe({
        next: () => {
          this.addOrgMessage = 'Organisateur ajouté avec succès.';
          this.loadOrganisateurs();
          setTimeout(() => { this.showAddOrg = false; this.addOrgMessage = ''; }, 1500);
        },
        error: () => this.addOrgMessage = 'Erreur lors de l\'ajout.'
      });
  }

  // VIEW DETAILS
  viewUserDetails(user: any) {
    this.selectedUser = user;
    this.showDetailPanel = true;
    this.http.get<any[]>(`http://localhost:8081/api/admin/user/${user.id}/participations`, { headers: this.getHeaders() })
      .subscribe({ next: (data) => { this.userEvents = data; this.cdr.detectChanges(); } });
  }

  viewOrgDetails(org: any) {
    this.selectedOrg = org;
    this.selectedUser = null;
    this.showDetailPanel = true;
    this.http.get<any[]>(`http://localhost:8081/api/admin/organisateur/${org.id}/events`, { headers: this.getHeaders() })
      .subscribe({ next: (data) => { this.orgEvents = data; this.cdr.detectChanges(); } });
  }

  closeDetailPanel() {
    this.showDetailPanel = false;
    this.selectedUser = null;
    this.selectedOrg = null;
    this.userEvents = [];
    this.orgEvents = [];
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    this.userService.clearUser();
    this.router.navigate(['/home']);
  }

  getRoleBadge(role: string): string {
    if (role === 'ROLE_ADMIN') return 'Admin';
    if (role === 'ROLE_ORGANISATEUR') return 'Organisateur';
    return 'Participant';
  }


  toggleApprove(event: any) {
    this.http.put(`http://localhost:8081/api/admin/events/${event.id}/approve`, {}, { headers: this.getHeaders() })
      .subscribe({
        next: (res: any) => {
          event.approved = res.approved;
          this.loadStats();
          this.cdr.detectChanges();
        }
      });
  }

  toggleVerifyOrg(org: any) {
    this.http.put(`http://localhost:8081/api/admin/organisateurs/${org.id}/verify`, {}, { headers: this.getHeaders() })
      .subscribe({
        next: (res: any) => {
          org.verified = res.verified;
          this.cdr.detectChanges();
        }
      });
  }
}
