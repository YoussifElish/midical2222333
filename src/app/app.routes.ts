import { AddDrugComponent } from './layout/add-drug/add-drug.component';
import { ArticleComponent } from './layout/pages/article/article.component';
import { DoctorsignupComponent } from './layout/pages/doctorsignup/doctorsignup.component';
import { DoctorloginComponent } from './layout/pages/doctorlogin/doctorlogin.component';
import { SignupinfoComponent } from './layout/additions/signupinfo/signupinfo.component';
import { ContactUsComponent } from './layout/pages/contact-us/contact-us.component';
import { ReSearchComponent } from './layout/pages/re-search/re-search.component';
import { Routes } from '@angular/router';
 import { HomeComponent } from './layout/pages/home/home.component';
import { LoginComponent } from './layout/pages/login/login.component';
import { CareersComponent } from './layout/pages/careers/careers.component';
import { CommitmentComponent } from './layout/pages/commitment/commitment.component';
import { SignupComponent } from './layout/pages/signup/signup.component';
import { MedicinsComponent } from './layout/pages/medicins/medicins.component';
import { ForgotPasswordComponent } from './layout/additions/forgot-password/forgot-password.component';
import { ResetPassComponent } from './layout/additions/reset-pass/reset-pass.component';
import { ArticleDetailComponent } from './layout/pages/article-detail/article-detail.component';
import { DoctorSearchComponent } from './layout/pages/doctor-search/doctor-search.component';
import { DoctorAppointmentsComponent } from './layout/pages/doctor-appointments/doctor-appointments.component';
import { AddArticleComponent } from './layout/pages/add-article/add-article.component'; // Import AddArticleComponent
import { EditArticleComponent } from './layout/pages/edit-article/edit-article.component'; // Import EditArticleComponent
import { RoleAuthGuard } from './shared/guards/role-auth.guard'; // RoleAuthGuard is already imported
import { DrugReminderComponent } from './layout/pages/drug-reminder/drug-reminder.component'; // Import the new component
import { DrugDetailsComponent } from './layout/additions/drug-details/drug-details.component';
import { ProfileComponent } from './layout/pages/profile/profile.component'; // Import ProfileComponent
import { patientAppointmentsComponent } from './layout/pages/patient-appointment/patient-appointment.component';

// Import the new consultation components
import { ConsultationListComponent } from './layout/pages/consultation-list/consultation-list.component';
import { ConsultationDetailComponent } from './layout/pages/consultation-detail/consultation-detail.component';
import { AskQuestionComponent } from './layout/pages/ask-question/ask-question.component';

export const routes: Routes = [
  {path: '', component:HomeComponent },
  {path: 'home' , component: HomeComponent   },
  {path: 'login' , component: LoginComponent },
  {path: 'signup' , component: SignupComponent },
  {path: 'profile', component: ProfileComponent, canActivate: [RoleAuthGuard] }, // Added profile route, protected by guard
  {path: 'doctors' , component: DoctorSearchComponent },
  {path: 'doctor-appointments/:id' , component: DoctorAppointmentsComponent, canActivate: [RoleAuthGuard] },
  {path: 'patient-appointment/:id' , component: patientAppointmentsComponent, canActivate: [RoleAuthGuard] },
  {path: 'drug-reminder', component: DrugReminderComponent, canActivate: [RoleAuthGuard] },
  {path: 'Research' , component: ReSearchComponent },
  {path: 'Careers' , component: CareersComponent  },
  {path: 'drugDetails/:id' , component: DrugDetailsComponent},
  {path: 'Commitment' , component: CommitmentComponent  },
  {path: 'Contact_Us' , component: ContactUsComponent },
  {path: 'Medicines' , component: MedicinsComponent },
  {path: 'article' , component: ArticleComponent },
  {path: 'article/add' , component: AddArticleComponent ,canActivate: [RoleAuthGuard]}, // Protected add article
  {path: 'article/edit/:id' , component: EditArticleComponent, canActivate: [RoleAuthGuard] }, // Protected edit article
  {path: 'article/:id' , component: ArticleDetailComponent },

  // Consultation Routes (Consider adding canActivate guards if needed)
  {path: 'consultations', component: ConsultationListComponent },
  {path: 'consultations/ask', component: AskQuestionComponent /*, canActivate: [RoleAuthGuard] */ }, // Protect if only logged-in users can ask
  {path: 'consultations/:id', component: ConsultationDetailComponent },

  {path: 'ForgotPassword' , component: ForgotPasswordComponent  },
  {path: 'resetPass' , component:ResetPassComponent},
  {path: 'signupinfo' , component:SignupinfoComponent},
  {path: 'doctorlogin' , component:DoctorloginComponent},
  {path: 'doctorsignup' , component:DoctorsignupComponent},
  {path: 'Add-drug' , component:AddDrugComponent},


];


