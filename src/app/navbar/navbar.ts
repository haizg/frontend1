import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser, NgIf} from "@angular/common";
import {Router, RouterLink} from "@angular/router";

@Component({
  selector: 'app-navbar',
    imports: [
        NgIf,
        RouterLink
    ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
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
