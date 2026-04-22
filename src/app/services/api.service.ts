import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EventModel } from '../models/event.model';

@Injectable({providedIn: 'root'})
export class ApiService {
  private readonly base = 'http://localhost:8081';

  constructor (private http:HttpClient){}

  private getHeaders() : HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders ({'Authorization': `Bearer ${token}`});
  }

  /* AUTHENTIFICATION */

  login(email: string, password: string): Observable<string> {
      return this.http.post(
          `${this.base}/api/auth/login`,
          { email, password },
          { responseType: 'text' }
        );
  }

  signup(user: { nom: string; prenom: string; email: string;
    password: string; role: string; nomOrganisation: string; }): Observable<string> {
    return this.http.post(
      `${this.base}/api/auth/signup`,
      user, { headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        responseType: 'text' }
      ) as Observable<string>;
  }

  verifyToken(token: string): Observable<any> {
    return this.http.get(
      `${this.base}/api/auth/verify-account?token=${token}`
    );
  }

  confirmToken(token: string): Observable<any> {
    return this.http.get(`${this.base}/api/events/confirm?token=${token}`,
      { responseType: 'text'});
  }








  /*  LOAD DATA */
  /*get all events*/
  getEvents(): Observable<EventModel[]> {
    return this.http.get<EventModel[]>(`${this.base}/api/events`);
  }

  /*get list of my participations*/
  getMyParticipationsIds(): Observable<number[]> {
    return this.http.get<number[]>(
      `${this.base}/api/user/my-participations`,
      { headers: this.getHeaders() }
      );
  }

  /*get list of participants in an event*/
  getEventParticipants(eventId: number): Observable<any[]> {
    return this.http.get<any[]>
    (`${this.base}/api/events/${eventId}/participants`,
      {headers: this.getHeaders() }
    );
  }

  /*get event by id*/
  getEventById(id:number): Observable<EventModel>{
    return  this.http.get<EventModel>(`${this.base}/api/events/${id}`,
      {headers: this.getHeaders()}
    );
  }







  /*ADMIN ACTIONS*/

  deleteEvent(eventId: number) : Observable<void> {
    return this.http.delete<void>(
      `${this.base}/api/admin/${eventId}`,
      {headers: this.getHeaders() }
    );
  }

  updateEventAdmin(eventId: number, eventData: any): Observable<void> {
    return this.http.put<void>(
      `${this.base}/api/admin/update-event/${eventId}`,
      eventData,
      { headers: this.getHeaders() }
    );
  }

  getAdminStats(): Observable<any> {
    return this.http.get(`${this.base}/api/admin/stats`, { headers: this.getHeaders() });
  }

  getAdminUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/api/admin/users`, { headers: this.getHeaders() });
  }

  getAdminEvents(): Observable<EventModel[]> {
    return this.http.get<EventModel[]>(`${this.base}/api/admin/events/all`, { headers: this.getHeaders() });
  }

  getAdminOrganisateurs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/api/admin/organisateurs`, { headers: this.getHeaders() });
  }

  getDeactivationRequests(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.base}/api/admin/organisateurs/deactivation-requests`,
      { headers: this.getHeaders() }
    );
  }

  deleteAdminUser(userId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/api/admin/users/${userId}`,
      { headers: this.getHeaders() }
    );
  }

  deleteAdminOrganisateur(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/api/admin/organisateurs/${id}`,
      { headers: this.getHeaders() }
    );
  }

  updateAdminUser(userId: number, user: any): Observable<any> {
    return this.http.put(
      `${this.base}/api/admin/users/${userId}`,
      user,
      { headers: this.getHeaders() }
    );
  }

  updateAdminOrganisateur(id: number, org: any): Observable<any> {
    return this.http.put(
      `${this.base}/api/admin/organisateurs/${id}`,
      org,
      { headers: this.getHeaders() }
    );
  }

  approveEvent(eventId: number): Observable<any> {
    return this.http.put(
      `${this.base}/api/admin/events/${eventId}/approve`,
      {},
      { headers: this.getHeaders() }
    );
  }

  toggleVerifyOrganisateur(id: number): Observable<any> {
    return this.http.put(
      `${this.base}/api/admin/organisateurs/${id}/verify`,
      {},
      { headers: this.getHeaders() }
    );
  }

  getUserParticipations(userId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.base}/api/admin/user/${userId}/participations`,
      { headers: this.getHeaders() }
    );
  }

  getOrganisateurEvents(orgId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.base}/api/admin/organisateur/${orgId}/events`,
      { headers: this.getHeaders() }
    );
  }

  approveDeactivation(orgId: number): Observable<any> {
    return this.http.put(
      `${this.base}/api/admin/organisateurs/${orgId}/deactivate/approve`,
      {},
      { headers: this.getHeaders() }
    );
  }

  rejectDeactivation(orgId: number): Observable<any> {
    return this.http.put(
      `${this.base}/api/admin/organisateurs/${orgId}/deactivate/reject`,
      {},
      { headers: this.getHeaders() }
    );
  }




  /*ORGANIZER ACTIONS*/

  /* create event */
  createEvent(eventData: any): Observable<any> {
    return this.http.post(
      `${this.base}/api/events`,
      eventData,
      { headers: this.getHeaders() }
    );
  }

  /*update capacity for organizer*/
  updateCapacity(eventId: number, maxParticipants: number): Observable<void> {
    return this.http.put<void>(
      `${this.base}/api/events/${eventId}/capacity`,
       {maxParticipants},
       {headers: this.getHeaders()}
     );
  }

  /*update capacity and program for organizer*/
  updateEventCapacityAndProgram(eventId: number, data: { maxParticipants: number; program: string }): Observable<void> {
    return this.http.put<void>(
      `${this.base}/api/events/${eventId}/capacity-and-program`,
      data,
      { headers: this.getHeaders() }
    );
  }






  /* CONTACT */
  sendContactForm(form: {
    prenom: string;
    nom: string;
    email: string;
    sujet: string;
    message: string;
  }): Observable<string> {
    return this.http.post(
      `${this.base}/api/contact`,
      form,
      { responseType: 'text' }
    ) as Observable<string>;
  }

  /* UPLOAD IMAGE */
  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.base}/api/upload`, formData);
  }

  /* PASSWORD */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.base}/api/auth/forgot-password`, { email });
  }

  verifyResetToken(token: string): Observable<any> {
    return this.http.get(`${this.base}/api/auth/verify-reset-token?token=${token}`);
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.base}/api/auth/reset-password`, { token, newPassword });
  }

  /* JOIN EVENT */
  joinEvent(email: string, eventId: number | null): Observable<string> {
    return this.http.post(
      `${this.base}/api/events/join`,
      { email, eventId },
      { responseType: 'text' }
    ) as Observable<string>;
  }


  /* PROFILE */
  getCreatedEvents(email: string): Observable<EventModel[]> {
    return this.http.get<EventModel[]>(
      `${this.base}/api/events/created?email=${email}`,
      { headers: this.getHeaders() }
    );
  }

  getMyEvents(email: string): Observable<EventModel[]> {
    return this.http.get<EventModel[]>(
      `${this.base}/api/events/my-events?email=${email}`,
      { headers: this.getHeaders() }
    );
  }

  updateProfile(body: {
    email: string;
    nom: string;
    prenom: string;
    newEmail: string;
    nomOrganisation: string;
  }): Observable<any> {
    return this.http.put(
      `${this.base}/api/user/update-profile`,
      body,
      { headers: this.getHeaders() }
    );
  }

  changePassword(body: {
    email: string;
    oldPassword: string;
    newPassword: string;
  }): Observable<string> {
    return this.http.put(
      `${this.base}/api/user/change-password`,
      body,
      { headers: this.getHeaders(), responseType: 'text' }
    ) as Observable<string>;
  }

  requestDeactivation(): Observable<any> {
    return this.http.put(
      `${this.base}/api/user/deactivate`,
      {},
      { headers: this.getHeaders() }
    );
  }

  getDeactivationStatus(): Observable<any> {
    return this.http.get(
      `${this.base}/api/user/deactivation-status`,
      { headers: this.getHeaders() }
    );
  }

}
