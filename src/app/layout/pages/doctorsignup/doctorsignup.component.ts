import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Authiserviceservice } from '../../../shared/services/authntication/Authiservice.service';
import { ToastrService } from 'ngx-toastr';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-doctorsignup',
  standalone: true,
  imports: [RouterLink,ReactiveFormsModule],
  templateUrl: './doctorsignup.component.html',
  styleUrl: './doctorsignup.component.css'
})
export class DoctorsignupComponent {
  Spiner=false
  ProfileImage!:File;
  CertificateImage!:File;
  files: Record<string, File> = {};
  onFileChange(event: any, type: string) {
      const file = event.target.files[0];
      if (file) {
        this.files[type] = file;
      }
    }


  doctorSignupForm:FormGroup=new FormGroup({

FirstName:new FormControl(null,[Validators.required ,Validators.minLength(3),Validators.maxLength(8)]),
LastName:new FormControl(null,[Validators.required ,Validators.minLength(3),Validators.maxLength(8)]),
Email: new FormControl(null,[Validators.required, Validators.email]),
Password : new FormControl(null,[Validators.required ,Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]),
DOB:new FormControl(null,Validators.required),
Specialization:new FormControl(null,Validators.required),
YearsOfExperience:new FormControl(null,Validators.required),
Bio:new FormControl(null,Validators.required),
 

 
})
constructor(private _Authiserviceservice:Authiserviceservice ,private _Router:Router ,private _ToastrService:ToastrService){

}
docSignup(){
  this.Spiner=true
  const DocSignup=new FormData();
  DocSignup.append('FirstName',this.doctorSignupForm.get('FirstName')?.value),
  DocSignup.append('LastName',this.doctorSignupForm.get('LastName')?.value),
  DocSignup.append('Email',this.doctorSignupForm.get('Email')?.value),
  DocSignup.append('Password',this.doctorSignupForm.get('Password')?.value),
  DocSignup.append('DOB',this.doctorSignupForm.get('DOB')?.value),
  DocSignup.append('Specialization',this.doctorSignupForm.get('Specialization')?.value),
  DocSignup.append('YearsOfExperience',this.doctorSignupForm.get('YearsOfExperience')?.value),
  DocSignup.append('Bio',this.doctorSignupForm.get('Bio')?.value), 
  DocSignup.append('ProfileImage',this.files['ProfileImage'])
  DocSignup.append('CertificateImage',this.files['CertificateImage'])

  this._Authiserviceservice.Doctorsignup(DocSignup).subscribe({

    next:res=>{
console.log('Doctor Done')
this._Router.navigate(['/home'])
this._ToastrService.success('Curfaison','Your Acount Will Be Activat As Soon As' , { timeOut: 20000}),
 this.Spiner=false
    },
error:err=>{
  console.log(err)
 this.Spiner=false
},
 
  })
}
}
