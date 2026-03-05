import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {Navbar} from '../navbar/navbar';
import {EventService} from '../services/event.service';
import { Event } from '../models/event.model';
import {JoinCta} from '../shared/join-cta/join-cta';
import {Footer} from '../shared/footer/footer';
import {ModalService} from '../services/modal.service';
import {Login} from '../login/login';
import {SignUpOrg} from '../sign-up/sign-up-org';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Navbar, RouterModule, JoinCta, Footer, Login, SignUpOrg],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit{
  events:Event[]=[];
  isModalOpen=false;
  isSignupModalOpen=false;

  constructor(private eventService: EventService,private modalService: ModalService) {}

  ngOnInit(){
    this.modalService.loginModal$.subscribe(state =>this.isModalOpen=state);
    this.modalService.signupModal$.subscribe(state=> this.isSignupModalOpen= state);
    this.eventService.getEvents().subscribe({
      next:(data) => this.events = data,
      error:(err) => console.error('Failed to load events',err)
    });
  }


}
