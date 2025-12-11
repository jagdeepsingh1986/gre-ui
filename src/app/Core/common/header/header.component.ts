import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, JwtPayload } from '../../../Auth/auth/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private authService = inject(AuthService);
  user:JwtPayload | null = null;
  constructor() {
    this.authService.user$.pipe(take(1)).subscribe(user => {
          this.user = user;
        });
  }
logout(){
   
this.authService.logout();  
}
}
