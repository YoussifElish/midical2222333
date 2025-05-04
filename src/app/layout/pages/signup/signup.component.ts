import { CommonModule } from '@angular/common';
import { Authiserviceservice } from './../../../shared/services/authntication/Authiservice.service';
 import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink,ReactiveFormsModule, CommonModule], // Added CommonModule here
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

spinner:boolean=false;
errormsg!:string
  signupForm:FormGroup = new FormGroup({
    firstName:new FormControl(null,[Validators.required,Validators.minLength(3),Validators.maxLength(8)]),
    lastName:new FormControl(null,[Validators.required,Validators.minLength(3),Validators.maxLength(8)]),
    email:new FormControl(null ,[Validators.required,Validators.email]),
    phoneNumber:new FormControl(null,[Validators.required,Validators.pattern(/^01[0125][0-9]{8}$/)]),
    dob:new FormControl(null, Validators.required,),
    password:new FormControl(null,[Validators.required,Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]),
    confirmPassword:new FormControl(null,[Validators.required]),

  },this.checkConfirmpassword)
  constructor(private _Authiserviceservice:Authiserviceservice ,private  _Router:Router){}
  submitsignup(){ 
    this.spinner=true;
    if(this.signupForm.valid){
    this._Authiserviceservice.signup(this.signupForm.value).subscribe({
      next:(res)=>{
        console.log(res);
        this.spinner=false;
this._Router.navigate(['/login'])
       },

      error:(err)=>{
        console.log(err);
        this.spinner=false;
        this.errormsg = err.error.errors[0].description

      }
    });
    }
   }

checkConfirmpassword(g:AbstractControl){
  if(g.get('password')?.value==g.get('confirmPassword')?.value){
return null;


  }
  else{
    g.get('confirmPassword')?.setErrors({mismatch:true})
    return{mismatch:true};
  }
}





}
