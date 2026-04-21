import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-confirm-delete',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-delete.html',
  styleUrl: './confirm-delete.css',
})
export class ConfirmDelete  implements OnInit{
  isOpen = false;
  title: string = '';
  message: string = '';
  private onConfirmFn : (() =>void) | null = null;

  constructor (public modalService : ModalService) {}

  ngOnInit() {
    this.modalService.deleteModal$.subscribe(open => {
      this.isOpen = open;
    });

    this.modalService.deleteModalData$.subscribe(data => {
      if (data) {
        this.title = data.title;
        this.message = data.message;
        this.onConfirmFn = data.onConfirm;
      }
    });
  }

  confirm(){
    this.onConfirmFn?.();
    this.modalService.closeDeleteModal()
  }

  cancel(){
    this.modalService.closeDeleteModal();
  }


}
