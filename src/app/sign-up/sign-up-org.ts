import { Component , Inject, PLATFORM_ID} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-sign-up-org',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './sign-up-org.html',
  styleUrl: './sign-up-org.css',
})
export class SignUpOrg {
  nom='';
  prenom='';
  email='';
  mdp='';
  role= '';

  constructor(private router:Router,
              private http:HttpClient,
              @Inject(PLATFORM_ID) private platformId: Object)
        {}




  signed(form:any){

    console.log("form valid?", form.valid);
    console.log("role value:", this.role);

    if (form.invalid){
      return;
    }

    const newUser= {
      nom:this.nom,
      prenom:this.prenom,
      email:this.email,
      password:this.mdp,
      role:this.role
    }




    this.http.post("http://localhost:8081/api/auth/signup", newUser, { responseType: 'text' })
      .subscribe({
        next: (response) => {
          const credentials = {
            email: this.email,
            password:this.mdp
          };

          this.http.post("http://localhost:8081/api/auth/login",credentials, {responseType:'text'})
            .subscribe({
              next: (token) => {
                if (isPlatformBrowser(this.platformId)){
                  localStorage.setItem('token',token);
                  const payload = JSON.parse(atob(token.split('.')[1]));
                  localStorage.setItem('role',payload.role);
                }
                console.log("Signup successful:", response);
                this.router.navigate(['/api/home']);
              },
              error: () => {
                this.router.navigate(['/api/login']);
              }
            })

        },
        error: (err) => {
          console.error("Signup error",err);
        }
      });
  }
}
