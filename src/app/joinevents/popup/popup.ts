import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ModalService} from '../../services/modal.service';
import {ApiService} from '../../services/api.service';
import {UserService} from '../../services/user.service';

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
  eventId:number|null=null;

  constructor(
    private modalService:ModalService,
    private apiService : ApiService,
    private userService: UserService
  ) {}

  ngOnInit(){
    this.modalService.currentEventId$.subscribe(id => {
      this.eventId=id;
    });
    const user = this.userService.getUser();
    if (user) {
      this.email = user.email;
    }
  }

  close() {
    this.modalService.closeJoinModal();
  }

  submit() {
    this.isLoading = true;
    this.message='';

    this.apiService.joinEvent(this.email, this.eventId).subscribe({
        next:()=>{
          this.isLoading=false;
          this.message='Registration successful';
          setTimeout(()=> {
            this.close();
          },5000);
        },
        error:()=>{
          this.isLoading=false;
          this.message='Something went wrong. Please try again.'
        }
      });

  }
}
