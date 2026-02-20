import { Component } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
    imports: [
        FormsModule,
        ReactiveFormsModule
    ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  message = 'Loading...';

  constructor(private http: HttpClient, private router :Router) {}

  ngOnInit() {
    this.http.get('http://localhost:8081/api/hello', { responseType: 'text' })
      .subscribe({
        next: res => this.message = res,
        error: err => {
          console.error(err);
          this.message = 'ERROR: Cannot connect to backend';
        }
      });
  }

  username="";
  password="";

  login(){
    const body={
      username:this.username,
      password:this.password
    };

    this.http.post('http://localhost:8081/api/login', body, { responseType: 'text' })
      .subscribe({
        next:(res:any)=> {
          console.log("success");
          alert("login successful");
          this.router.navigate(['/api/home'])
        },
        error: (err) => {
          console.log("wrong credentials");
          alert("invalid username or password")
        }

      });
  }
}
