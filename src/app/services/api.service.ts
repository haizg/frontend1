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
    return new HttpHeaders ({'Authorization': 'Bearer ${token}'});
  }

  /*HOME.TS*/
  getEvents(): Observable<EventModel[]> {
    return this.http.get<EventModel[]>('${this.base}/api/events');
  }

  /*delete only for admin*/
  deleteEvent(eventId: number) : Observable<void> {
    return this.http.delete<void>(
      '${this.base}/api/admin/${eventId}',
      {headers: this.getHeaders() }
    );
  }


  /*get list of my participations*/
  getMyParticipationsIds(): Observable<number[]> {
    return this.http.get<number[]>(
      '${this.base}/api/user/my-participations',
      { headers: this.getHeaders() }
      );
  }






}
