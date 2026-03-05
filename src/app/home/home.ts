import { Component , Inject, PLATFORM_ID } from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {Navbar} from '../navbar/navbar';
import {EventService} from '../services/event.service';
import { Event } from '../models/event.model';
import {JoinCta} from '../shared/join-cta/join-cta';
import {Footer} from '../shared/footer/footer';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Navbar,RouterModule,JoinCta,Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  events:Event[]=[];
  userRole: string | null = null;
  userName: string = '';
  userPrenom: string = '';
  isLoggedIn: boolean = false;

  constructor(private eventService: EventService,) {}

  ngOnInit(){



    const userStr = localStorage.getItem('user');
    if(userStr) {
      const userData = JSON.parse(userStr);
      this.userRole = userData.role;
      this.userName = userData.nom;
      this.userPrenom = userData.prenom;
      this.isLoggedIn = true;
      console.log("User role:", this.userRole);
      console.log("Is Organisateur:", this.isOrganisateur);
      console.log("Is Participant:", this.isParticipant);


    }
    this.eventService.getEvents().subscribe({
      next:(data) => this.events = data,
      error:(err) => console.error('Failed to load events',err)
    });
  }
  get isOrganisateur(): boolean {
    return this.userRole ==='ROLE_ORGANISATEUR';
  }
  get isParticipant(): boolean {
    return this.userRole ==='ROLE_USER';
  }
  get fullName(): string {
    return `${this.userPrenom} ${this.userName}`;
  }



}
