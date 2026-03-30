import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from '../services/user.service';
import { EventModel } from '../models/event.model';
import { LangService } from '../services/lang.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  stats: any = null;
  users: any[] = [];
  events: EventModel[] = [];
  activeTab = 'overview';
  adminName = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    public lang: LangService,
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
    }
  }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  loadStats() {
    this.http.get(`http://localhost:8081/api/admin/stats`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => { this.stats = data; this.cdr.detectChanges(); },
        error: (err) => console.error('Failed to load stats', err)
      });
  }

  loadUsers() {
    this.http.get<any[]>(`http://localhost:8081/api/admin/users`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => { this.users = data; this.cdr.detectChanges(); },
        error: (err) => console.error('Failed to load users', err)
      });
  }

  loadEvents() {
    this.http.get<EventModel[]>(`http://localhost:8081/api/events`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => { this.events = data; this.cdr.detectChanges(); },
        error: (err) => console.error('Failed to load events', err)
      });
  }

  deleteUser(userId: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    this.http.delete(`http://localhost:8081/api/admin/users/${userId}`, { headers: this.getHeaders() })
      .subscribe({
        next: () => { this.loadUsers(); },
        error: (err) => console.error('Failed to delete user', err)
      });
  }

  deleteEvent(eventId: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;
    this.http.delete(`http://localhost:8081/api/events/admin/${eventId}`, { headers: this.getHeaders() })
      .subscribe({
        next: () => { this.loadEvents(); },
        error: (err) => console.error('Failed to delete event', err)
      });
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
}
