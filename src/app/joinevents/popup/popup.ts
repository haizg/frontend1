import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './popup.html',
  styleUrls: ['./popup.css']
})
export class Popup {

  isVisible = true;
  isLoading = false;
  message = '';

  email = '';
  participants = 1;

  open() {
    this.isVisible = true;
    this.email = '';
    this.participants = 1;
    this.message = '';
    this.isLoading = false;
  }

  close() {
    this.isVisible = false;
  }

  submit() {
    if (!this.email) {
      this.message = 'Email is required';
      return;
    }

    this.isLoading = true;

    const data = {
      email: this.email,
      participants: this.participants
    };

    console.log('Registration data:', data);

    setTimeout(() => {
      this.isLoading = false;
      this.message = 'Registration successful ';

      setTimeout(() => {
        this.close();
      }, 1500);

    }, 1000);
  }
}
