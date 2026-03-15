import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ModalService} from '../../services/modal.service';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './popup.html',
  styleUrls: ['./popup.css']
})
export class Popup {
  isLoading = false;
  message = '';
  email = '';
  participants = 1;
  eventId:number|null=null;

  constructor(
    private modalService:ModalService,
    private http:HttpClient
  ) {}

  ngOnInit(){
    this.modalService.currentEventId$.subscribe(id => {
      this.eventId=id;
    });
  }




  close() {
    this.modalService.closeJoinModal();
  }

  submit() {
    if (!this.email) {
      this.message = 'Email is required';
      return;
    }

    this.isLoading = true;
    this.message='';

    const data = {
      email: this.email,
      numberOfPeople: this.participants,
      eventId:this.eventId
    };

    console.log('Registration data:', data);

    this.http.post('http://localhost:8081/api/events/join', data, {responseType:'text'})
      .subscribe({
        next:()=>{
          this.isLoading=false;
          this.message='Registration successful';
          setTimeout(()=> {
            this.close();
          },1500);
        },
        error:()=>{
          this.isLoading=false;
          this.message='Something went wrong. Please try again.'
        }
      });

  }
}
