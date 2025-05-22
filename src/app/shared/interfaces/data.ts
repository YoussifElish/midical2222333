export interface signupdata extends logindata ,ForgetPass{
    "confirmPassword": "string",
    "firstName": "string",
    "lastName": "string",
    "phoneNumber": "string",
    "dob": "2025-04-27"
  }

  export interface logindata extends ForgetPass{
   
    "password": "string"
  }
 
  export interface ForgetPass{
 "email": "string",
  }

  export interface ResetPass extends ForgetPass {
  "code": "string"
  "newPassword": "string"
}
