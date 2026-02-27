import { Component , Inject, PLATFORM_ID } from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule, isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  isLoggedIn=false;

  constructor(private router:Router,
              @Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)){
      this.isLoggedIn=!!localStorage.getItem('token')
    }


  }

  logIn(){
    this.router.navigate(['/api/login']);
  }

  signUp(){
    this.router.navigate(['/api/signuporg']);
  }

  logOut(){
    if (isPlatformBrowser(this.platformId)){
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    }
    this.isLoggedIn=false;
    this.router.navigate(['/api/login'])
  }

}
