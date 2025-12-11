import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { User } from '../../../Core/common/CommonModels/UserModel';
import { AccountService } from '../Services/account.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { EncryptionUtil } from '../../../Core/common/CommonMethods/encryptdecrypt';
import { ConfirmationModalComponent } from '../../../Core/common/confirmation-modal/confirmation-modal.component';
import { AuthService, JwtPayload } from '../../../Auth/auth/auth.service';
import { take } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-users',
  imports: [MatTooltipModule,CommonModule,ConfirmationModalComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
users:User[]=[];
loggeduser:JwtPayload | null = null;
private accountService = inject(AccountService);
private authService = inject(AuthService);
private toastrService = inject(ToastrService);
private router = inject(Router);
selectedUser: any;
  constructor() {}

  ngOnInit(): void {
     this.authService.user$.pipe(take(1)).subscribe(user => {
            this.loggeduser = user;
          });
    this.getAllUsers();
  }

  getAllUsers() {
    this.accountService.getAllUser().subscribe((response: any) => {
      if (response.statusCode === 200) {
        if (response.data && response.data.length > 0) {

            this.users = response.data as User[];
            console.log('Hello',this.users);
            console.log(response.data);
        } else {
          this.toastrService.info(response.message || 'No users found.');
        }
      } else {
        this.toastrService.error(response.message);
      }
    });
  }
  onUpdateUser(email: any) {
    this.router.navigate(['/dashboard/account/update-user', EncryptionUtil.encrypt(email)]);
  }
  
setSelectedUser(user: any) {
  this.selectedUser = user;
}

handleDelete(isConfirmed: boolean) {
  if (isConfirmed && this.selectedUser) {
    this.accountService.deleteUser(this.selectedUser.userId).subscribe((response: any) => {
      if (response.statusCode === 200) {
        this.toastrService.success(response.message);
        this.getAllUsers(); // Refresh the user list after deletion
      } else {
        this.toastrService.error(response.message);
      }
    }); 
  }
}
navigateToAddUser(){
  this.router.navigate(['/dashboard/account/add-user']);
}
}

