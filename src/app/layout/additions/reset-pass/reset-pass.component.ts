import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Authiserviceservice } from '../../../shared/services/authntication/Authiservice.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-pass',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './reset-pass.component.html',
  styleUrl: './reset-pass.component.css'
})
export class ResetPassComponent  {
  Spiner=false
  errmsg: string = '';
  resetPassForm:FormGroup=new FormGroup({
  email:new FormControl(null,[Validators.required,Validators.email]),
  code:new FormControl(null,[Validators.required, Validators.pattern(/^\d{6}$/)]),
  newPassword:new FormControl(null,[Validators.required,Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/) ])


  })
  constructor(private _Authiserviceservice:Authiserviceservice ,private _Router:Router){}
resetPass(){
    this.Spiner=true;

  if(this.resetPassForm.valid){
this._Authiserviceservice.ResetPass(this.resetPassForm.value).subscribe({

  next:(res)=>{
    console.log('Doneee',res)
    this._Router.navigate(['/login']);
      this.Spiner=false;

  },
  error:(err)=>{
    console.log('erorrr',err)
      this.Spiner=false;
       this.errmsg = err.error.errors[0].description;

  }



})


  }
}



     
}


 
