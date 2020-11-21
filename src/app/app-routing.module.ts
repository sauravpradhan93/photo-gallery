import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AngularFireAuthGuard, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(["login"]);
const redirectLoggedInToHome = () => redirectLoggedInTo(["home"]);

const routes: Routes = [
  {
    path: '', redirectTo: 'home' ,pathMatch: 'full'
  },
  {
    path: 'login',
    canActivate: [AngularFireAuthGuard],
    data: {
      authGuardPipe: redirectLoggedInToHome
    },
    loadChildren: ()=> import('./login/login.module').then( m => m.LoginModule)
  },
  {
    path: 'home',
    canActivate: [AngularFireAuthGuard],
    data: {
      authGuardPipe: redirectUnauthorizedToLogin
    },
    loadChildren: ()=> import('./home/home.module').then( m => m.HomeModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
