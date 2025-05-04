import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Authiserviceservice } from '../../../shared/services/authntication/Authiservice.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule , CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginform: FormGroup;
  spinner: boolean = false;
  errmsg: string = '';

  constructor(private _Authiserviceservice: Authiserviceservice, private _Router: Router) {
    this.loginform = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/)
      ])
    });
  }

  ngOnInit(): void {}

  submitlogin() {
    this.spinner = true;
    if (this.loginform.valid) {
      this._Authiserviceservice.login(this.loginform.value).subscribe({
        next: (res) => {
          localStorage.setItem('userToken', res.token);
          this._Authiserviceservice.decodeUserData();
          this.spinner = false;
          this._Router.navigate(['/home']);
        },
        error: (err) => {
          this.spinner = false;
          this.errmsg = err.error.errors[0].description;
        }
      });
    }
  }
}
