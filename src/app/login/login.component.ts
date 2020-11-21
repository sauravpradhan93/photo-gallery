import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  login: FormGroup;
  alert: boolean = false;
  alertMessage: string;
  login_loading: boolean = false;
  register_loading: boolean = false;
  constructor(public _formBuilder: FormBuilder, private _firebaseAuth: AngularFireAuth, private _router: Router) { 
    this.login = this._formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required]
    });
  }

  ngOnInit(): void {
  }

  register(){
    this.alert = false;
    if (this.login.valid) {
      this.register_loading = true;
      let email = this.login.get('email').value;
      let password = this.login.get('password').value;
      this._firebaseAuth.createUserWithEmailAndPassword(email, password).then(()=> {
        alert('User register succesfully');
        this.register_loading = false;
      }).catch((err)=> {
        this.alertMessage = err.message;
        this.alert = true;
        this.register_loading = true;
      })
    } else {
      this.alertMessage = 'Please fill the email and password correctly';
      this.alert = true;
    }
  }

  loginuser(formValues){
    this.alert = false;
    if (this.login.valid) {
      this.login_loading = true;
      this._firebaseAuth.signInWithEmailAndPassword(formValues.email, formValues.password).then(()=> {
        this._router.navigateByUrl('/home');
        this.login_loading = false;
      }).catch((err)=>{
        this.alertMessage = err.message;
        this.alert = true;
        this.login_loading = false;
      })
    } else {
      this.alertMessage = 'Please fill the email and password correctly';
      this.alert = true;
    }
  }

}
