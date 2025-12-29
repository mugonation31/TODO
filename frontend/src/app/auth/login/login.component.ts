import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],  // CommonModule for *ngIf, FormsModule for [(ngModel)]
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  // Form fields - bound to HTML inputs via [(ngModel)]
  email: string = '';
  password: string = '';

  // UI state - controls what user sees
  loading: boolean = false;
  errorMessage: string = '';

  // Inject dependencies
  // SupabaseService = talks to Supabase API
  // Router = navigates between pages
  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  /**
   * Validates the login form
   * Returns true if valid, false otherwise
   */
  private validateForm(): boolean {
    this.errorMessage = '';

    // Check both fields are filled
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password';
      return false;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email';
      return false;
    }

    return true;
  }

  /**
   * Handle login form submission
   * This connects to: SupabaseService.signIn() → Supabase Auth API
   */
  async onLogin() {
    // Validate first
    if (!this.validateForm()) {
      return;
    }

    try {
      this.loading = true;
      this.errorMessage = '';

      // Call SupabaseService to authenticate
      // This sends email/password to Supabase Auth API
      await this.supabaseService.signIn(this.email, this.password);

      // Success! Navigate to todos page
      // Router connects us to the routing system
      this.router.navigate(['/todos']);

    } catch (error: any) {
      // Show generic error (security: don't reveal if email exists or not)
      this.errorMessage = 'Invalid email or password';
    } finally {
      this.loading = false;
    }
  }
}
