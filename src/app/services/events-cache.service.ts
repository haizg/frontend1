import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { EventModel } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventsCacheService {

  private cache: EventModel[] | null = null;
  private lastFetch: number = 0;
  private readonly TTL = 60000;
  private loading = false;
  private events$ = new BehaviorSubject<EventModel[] | null>(null);

  constructor(private apiService: ApiService) {
    this.fetchFromServer();
  }

  getEvents(): Observable<EventModel[]> {
    const now = Date.now();
    const cacheValid = this.cache !== null && (now - this.lastFetch) < this.TTL;

    if (cacheValid) {
      return of(this.cache!);
    }

    return this.fetchFromServer();
  }

  private fetchFromServer(): Observable<EventModel[]> {
    if (this.loading && this.cache) {
      return of(this.cache);
    }

    this.loading = true;
    return this.apiService.getEvents().pipe(
      tap(data => {
        this.cache = data;
        this.lastFetch = Date.now();
        this.loading = false;
        this.events$.next(data);
      })
    );
  }

  invalidate() {
    this.cache = null;
    this.lastFetch = 0;
  }

  getEventById(id: number): EventModel | null {
    return this.cache?.find(e => e.id === id) ?? null;
  }
}
