import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/additions/navbar/navbar.component';
import { FooterComponent } from './layout/additions/footer/footer.component';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, EditorModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' }
  ],
})
export class AppComponent {
  title = 'MedicalgraduationProject';
  darkMode: boolean = false;

  toggleDarkmode() {
    this.darkMode = !this.darkMode;
    document.body.setAttribute('data-bs-theme', this.darkMode ? 'dark' : 'light');
  }
}