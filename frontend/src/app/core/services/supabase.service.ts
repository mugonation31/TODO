import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root' //Makes this service available app-wide (singleton)
})
export class SupabaseService {
    // The Supbase client - talks to Supabse API
    private supabase: SupabaseClient;

    // Current user state - Observable so components can subscribe to changes
    private currentUserSubject: BehaviorSubject<User | null>;
    public currentUser$: Observable<User | null>;

    constructor() {
        // Initialise Supabse client with our environment config 
        this.supabase = createClient(
            environment.supabase.url,
            environment.supabase.anonKey
        );

        // Initialise user State 
        this.currentUserSubject = new BehaviorSubject<User | null>(null);
        this.currentUser$ = this.currentUserSubject.asObservable();

        // Check if user is already logged in (from previous session)
        this.loadSession();
    }

    /**
     * Load existing session (if user was logged in before)
     */
    private async loadSession() {
        const { data } = await this.supabase.auth.getSession();
        if (data.session?.user) {
            this.currentUserSubject.next(data.session.user);
        }

        // Listen for auth state changes (login, logout, token refresh)
        this.supabase.auth.onAuthStateChange((event, session) =>{
            console.log('Auth state change:', event);
            this.currentUserSubject.next(session?.user ?? null);
        });
    }

    /**
     * Sign up a new user with email, password, and name
     */
    async signUp(email: string, password: string, name: string) {
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name  // Store name in user metadata
                }
            }
        });
        if (error) throw error;
        return data;
    }

    /**
     * Sign in with email and password
     */
    async signIn(email: string, password: string) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return data;
    }

    /**
     * Sign out the current user
     */
    async signOut() {
        const { error } = await this.supabase.auth.signOut();
        if (error) throw error;
    }

    /**
     * Get the current session (includes JWT access token)
     */
    async getSession(): Promise<Session | null> {
        const { data } = await this.supabase.auth.getSession();
        return data.session;
    }

    /**
     * Get the JWT access token (to send FastAPI backend)
     */
    async getAccessToken(): Promise<string | null> {
        const session = await this.getSession();
        return session?.access_token ?? null;
    }

    /**
     * Get current user (syncronous)
     */
    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }
}

