import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { OrderStateService } from '../order-state.service';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs';
import { DashboardService } from '../dashboard.service';
import { Product } from '../products/products.component';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { OrderConfirmModalComponent } from '../../../Core/common/order-confirm-modal/order-confirm-modal.component';
import { Addresses } from '../../accounts/add-update-store/add-update-store.component';
import { AccountService } from '../../accounts/Services/account.service';
import { AuthService, JwtPayload } from '../../../Auth/auth/auth.service';


@Component({
  selector: 'app-order-confirmation',
  imports: [CommonModule, RouterLink, FormsModule, OrderConfirmModalComponent],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.css'
})
export class OrderConfirmationComponent {

  private orderStateService = inject(OrderStateService);
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private toaster = inject(ToastrService);
  private router = inject(Router);
  private accountService = inject(AccountService);
  user:JwtPayload | null = null;
  addresses:Addresses[]=[];
  cartItems = this.orderStateService.cart$;
  isConfirmed: boolean = false;
  showAddressValidation = false;
  selectedAddressId: number | null = null;
  showConfirmValidation: boolean = false;
  selectedProductModal?: Product;
  @ViewChild('successModal') successModal!: OrderConfirmModalComponent;
  orderType:string='Tabacco'


  totalAmount$ = this.cartItems.pipe(
    map(items =>
      items.reduce((sum, p) => sum + (p.subtotal || 0), 0)
    )
  );


  constructor() {
    this.getCartItems();
    this.authService.user$.subscribe(user => {
      this.user = user;
      if (user?.role) {
        
      }
    });
    this.loadAddresses();
  }
  loadAddresses(){
    this.accountService.getAllAddresses(this.user?.StoreId).subscribe((res: any) => {
      if(res !=null){
        this.addresses = res as Addresses[];
      } else {

        this.toaster.error('No addresses found');
      }
    });
  }

  getCartItems() {
    this.dashboardService.getCartItems().subscribe((res: any) => {
      if (res.statusCode == 200 && res.data && res.data.length > 0) {
        this.orderStateService.clearCart();
        res.data.forEach((item: Product) => {
          item.subtotal = item.actualSubTotal || 0;
        });
        this.orderStateService.setCart(res.data as Product[]);
      }

    })
  }
  // submitOrder(){

  //   console.log(this.isConfirmed);
  //     
  //   this.dashboardService.orderProducts().subscribe((res:any)=>{
  //     if(res.statusCode == 200){
  //       this.toaster.success(res.message);
  //       this.orderStateService.clearCart();
  //       this.getCartItems();
  //       this.router.navigate(['/dashboard/products']);
  //     }
  //     else{
  //       this.router.navigate(['/dashboard/products']);
  //     }
  //   });
  // }

//   submitOrder(): void {
//       
//     if (!this.isConfirmed || this.selectedAddressId === null) {
//       this.showConfirmValidation = true;
//       return;
//     }

//     this.showConfirmValidation = false;

//     this.dashboardService.orderProducts(this.selectedAddressId).subscribe((res: any) => {
//       if (res.statusCode == 200) {
//        this.successModal.show();
//          this.orderStateService.clearCart();
//       this.getCartItems();
//       // this.router.navigate(['/dashboard/home']);

//       } else {
//         this.router.navigate(['/dashboard/home']);
//       }

//       // ✅ Reset checkbox and hide validation
//       this.isConfirmed = false;
//       this.showConfirmValidation = false;
//     });
// }
submitOrder(): void {
   

  // Reset flags before checking
  this.showConfirmValidation = false;
  this.showAddressValidation = false;

  // Validation for address
  if (!this.selectedAddressId) {
    this.showAddressValidation = true;
  }

  // Validation for confirmation checkbox
  if (!this.isConfirmed) {
    this.showConfirmValidation = true;
  }

  // If any validation fails, stop here
  if (this.showConfirmValidation || this.showAddressValidation) {
    return;
  }

  // ✅ If valid, place order
  this.dashboardService.orderProducts(this.selectedAddressId).subscribe((res: any) => {
    if (res.statusCode == 200) {
      this.successModal.show();
      this.orderStateService.clearCart();
      this.getCartItems();
      // this.router.navigate(['/dashboard/home']);
    } else {
      this.router.navigate(['/dashboard/home']);
    }

    // Reset form state after success
    this.isConfirmed = false;
    this.selectedAddressId = null;
    this.showConfirmValidation = false;
    this.showAddressValidation = false;
  });
}

openProductDetailModal(product: Product) {
    
  this.selectedProductModal = product;
  // @ts-ignore
  this.selectedProductModal = {
    ...this.selectedProductModal,
    productBase64: `data:image/jpeg;base64,${this.selectedProductModal?.productBase64}`,
  }
  const modal = new (window as any).bootstrap.Modal(document.getElementById('exampleModal')!);
  modal.show();
}

onSuccessModalClosed(): void {
  this.router.navigate(['/dashboard/home']);
}
}
