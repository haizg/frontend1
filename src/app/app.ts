import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <h1>Angular is working!</h1>
    <h2>{{ message }}</h2>
    <router-outlet />
  `,
  styles: []
})
export class App implements OnInit {
  message = 'Loading...';

  constructor(private http: HttpClient) {}

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
}
