import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-about',
  imports: [CommonModule, RouterModule, Navbar],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {

}
