import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { User } from '@supabase/supabase-js';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent implements OnInit {
  // Inject dependencies using Angular's inject() function
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  // Store current user info
  currentUser: User | null = null;
  userName: string = '';

  ngOnInit() {
    // Subscribe to user changes (login/logout events)
    this.supabaseService.currentUser$.subscribe(user => {
      this.currentUser = user;
      // Get user's name from metadata or email
      this.userName = user?.user_metadata?.['name'] || user?.email?.split('@')[0] || 'User';
    });
  }

  /**
   * Logout the current user
   * Steps:
   * 1. Call Supabase signOut()
   * 2. Navigate to login page
   * 3. Handle any errors
   */
  async logout() {
    try {
      // Call the Supabase signOut method
      await this.supabaseService.signOut();

      // Navigate to login page after successful logout
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error logging out:', error);
      // You could show an error message here
    }
  }
}
