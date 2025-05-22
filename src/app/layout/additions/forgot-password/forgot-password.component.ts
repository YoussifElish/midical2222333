import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Authiserviceservice } from '../../../shared/services/authntication/Authiservice.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink,ReactiveFormsModule,CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
Spiner=false;
errmsg:string='';

  ForgetpassForm:FormGroup=new FormGroup({

  email:new FormControl(null,[Validators.required,Validators.email])
 
  })
constructor (private _Authiserviceservice:Authiserviceservice , private _Router:Router){}

forgetPass() {
  this.Spiner=true;

  if (this.ForgetpassForm.valid) {
    this._Authiserviceservice.ForgetPass(this.ForgetpassForm.value).subscribe({
      next: (res) => {
        console.log('It Done ', res);
         this._Router.navigate(['/resetPass']);
        this.Spiner=false;
      },
      error: (err) => {
        console.error('Erorrrr ', err);
                this.Spiner=false;
       this.errmsg = err.error.errors[0].description;
       }
    });
  } 
}






}
