import { Component , Inject, PLATFORM_ID} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {ModalService} from '../services/modal.service';
import {UserService} from '../services/user.service';

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
  confirmMdp = '';
  role= 'ROLE_USER';
  nomOrganisation = '';
  errorMessage = '';

  constructor(private router:Router,
              private http:HttpClient,
              private modalService:ModalService,
              private userService: UserService,
              @Inject(PLATFORM_ID) private platformId: Object)
  {}

  close(){
    this.modalService.closeSignupModal();
  }


  signed(form:any){

    console.log("form valid?", form.valid);
    console.log("role value:", this.role);

    if (form.invalid){
      this.errorMessage = "Veuillez remplir tous les champs obligatoires";
      return;
    }
    if (this.mdp !== this.confirmMdp) {
      this.errorMessage = "Les mots de passe ne correspondent pas";
      return;
    }
    if (this.role === 'ROLE_ORGANISATEUR' && !this.nomOrganisation.trim()) {
      this.errorMessage = "Le nom de l'organisation est obligatoire pour les organisateurs";
      return;
    }
    this.errorMessage = '';

    const newUser= {
      nom:this.nom,
      prenom:this.prenom,
      email:this.email,
      password:this.mdp,
      role:this.role,
      nomOrganisation: this.nomOrganisation
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

                  const userData={
                    email:this.email,
                    nom:this.nom,
                    prenom: this.prenom,
                    role:payload.role,
                    nomOrganisation: this.nomOrganisation
                  };
                  localStorage.setItem('user', JSON.stringify(userData));
                  this.userService.setUser(userData);
                  console.log("User data saved to localStorage and userService");
                }

                console.log("Signup successful:", response);
                this.modalService.closeSignupModal();
              },
              error: () => {
                this.router.navigate(['/login']);
              }
            })

        },
        error: (err) => {
          console.error("Signup error",err);
        }
      });
  }

}
