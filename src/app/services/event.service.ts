import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject,Observable} from 'rxjs';
import { EventModel } from '../models/event.model';

@Injectable ({providedIn:'root'})
export class EventService{
  private apiUrl='http://localhost:8081/api/events';


  constructor(private http : HttpClient) {
  }


  getEvents():Observable<EventModel[]>{
    return this.http.get<EventModel[]>(this.apiUrl);
  }

  getEventById(id:number): Observable<EventModel>{
    return  this.http.get<EventModel>(`http://localhost:8081/api/events/${id}`);
  }

}
