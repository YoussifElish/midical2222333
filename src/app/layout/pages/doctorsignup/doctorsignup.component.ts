import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-doctorsignup',
  standalone: true,
  imports: [RouterLink,ReactiveFormsModule],
  templateUrl: './doctorsignup.component.html',
  styleUrl: './doctorsignup.component.css'
})
export class DoctorsignupComponent {
  doctorSignupForm:FormGroup=new FormGroup({

firstName:new FormControl(null,[Validators.required ,Validators.minLength(3),Validators.maxLength(8)]),
lastName:new FormControl(null,[Validators.required ,Validators.minLength(3),Validators.maxLength(8)]),
email: new FormControl(null,[Validators.required, Validators.email]),
password : new FormControl(null,[Validators.required ,Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]),
dob:new FormControl(null,Validators.required),

specialization:new FormControl(null,Validators.required),

yearsOfExperience:new FormControl(null,Validators.required),

certificationDocumentUrl:new FormControl(null,Validators.required), })

}
