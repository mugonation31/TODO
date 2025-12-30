import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  // Form fields - these will be bound to HTML inputs using [(ngModel)]
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  // UI state - controls what the user sees
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Inject services we need
  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  /**
   * Validates the signup form
   * Returns true if valid, false otherwise
   */
  private validateForm(): boolean {
    // Reset messages
    this.errorMessage = '';

    // Check all fields are filled
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      return false;
    }

    // Check name length (at least 2 characters)
    if (this.name.trim().length < 2) {
      this.errorMessage = 'Name must be at least 2 characters';
      return false;
    }

    // Check email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }

    // Check password length (Supabase requires minimum 6 characters)
    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return false;
    }

    // Check passwords match
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return false;
    }

    return true;
  }

  /**
   * Handle signup form submission
   */
  async onSignup() {
    // Validate the form first
    if (!this.validateForm()) {
      return; // Stop if validation fails
    }

    try {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      // Call Supabase to create the user (confirmPassword already validated above)
      await this.supabaseService.signUp(this.email, this.password, this.name);

      // Success!
      this.successMessage = 'Account created successfully! Please check your email to confirm.';

      // Clear the form
      this.name = '';
      this.email = '';
      this.password = '';
      this.confirmPassword = '';

      // Optional: Redirect to login after 2 seconds
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);

    } catch (error: any) {
      // Show error message to user
      this.errorMessage = error.message || 'Signup failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}
