import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
const router = inject(Router);

  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  if (accessToken || refreshToken) {
    // Redirect to dashboard or home
    router.navigate(['/dashboard/home']); // change path if needed
    return false; // block access to login
  }

  return true; // 
};


export const canHavePromoOrderScreenPermission: CanActivateFn = (route, state) => {
    
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getUser()// should return user info + roles

  // Read roles from route data
  var canAccess = user?.role?.includes('CanOrderPromoProducts');
  if (!canAccess) {
    // Redirect to unauthorized page or home
    router.navigate(['/dashboard/unauthorize']); // change path if needed
    return false; 
  }

  return true; 
};

export const canHaveOrderScreenPermission: CanActivateFn = (route, state) => {
    
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getUser()// should return user info + roles

  // Read roles from route data
  var canAccess = user?.role?.includes('CanOrderSalesProducts');
  if (!canAccess) {
    // Redirect to unauthorized page or home
    router.navigate(['/dashboard/unauthorize']); // change path if needed
    return false; 
  }

  return true; 
};
// CanViewOrderHistory"

export const canHaveOrderHistoryScreenPermission: CanActivateFn = (route, state) => {
    
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getUser()// should return user info + roles

  // Read roles from route data
  var canAccess = user?.role?.includes('CanViewOrderHistory');
  if (!canAccess) {
    // Redirect to unauthorized page or home
    router.navigate(['/dashboard/unauthorize']); // change path if needed
    return false; 
  }

  return true; 
};



export const canHavePromoOrderHistoryScreenPermission: CanActivateFn = (route, state) => {
    
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getUser()// should return user info + roles

  // Read roles from route data
  var canAccess = user?.role?.includes('CanViewPromoOrderHistory');
  if (!canAccess) {
    // Redirect to unauthorized page or home
    router.navigate(['/dashboard/unauthorize']); // change path if needed
    return false; 
  }

  return true; 
};