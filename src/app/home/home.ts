import { Component , Inject, PLATFORM_ID } from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {Navbar} from '../navbar/navbar';
import {EventService} from '../services/event.service';
import { Event } from '../models/event.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Navbar,RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  events:Event[]=[];

  constructor(private eventService: EventService,) {}

  ngOnInit(){
    this.eventService.getEvents().subscribe({
      next:(data) => this.events = data,
      error:(err) => console.error('Failed to load events',err)
    });
  }


}
