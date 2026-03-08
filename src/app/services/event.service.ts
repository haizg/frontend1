import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject,Observable} from 'rxjs';
import { Event } from '../models/event.model';

@Injectable ({providedIn:'root'})
export class EventService{
  private apiUrl='http://localhost:8081/api/events';
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  events$ = this.eventsSubject.asObservable();

  constructor(private http : HttpClient) {
  }
  loadEvents() {
    this.http.get<Event[]>(this.apiUrl).subscribe({
      next: (events) => this.eventsSubject.next(events),
      error: (err) => console.error('Failed to load events', err)
    });
  }

  getEvents():Observable<Event[]>{
    return this.http.get<Event[]>(this.apiUrl);
  }

}
