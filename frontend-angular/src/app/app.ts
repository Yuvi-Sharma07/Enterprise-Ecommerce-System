import { Component, signal, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  darkMode = signal<boolean>(true);

  constructor() {
    effect(() => {
      const isDark = this.darkMode();
      if (typeof window !== 'undefined') {
        const root = window.document.documentElement;
        if (isDark) {
          root.classList.add('dark');
          root.style.backgroundColor = '#0b0f19';
        } else {
          root.classList.remove('dark');
          root.style.backgroundColor = '#f8fafc';
        }
      }
    });
  }
}
