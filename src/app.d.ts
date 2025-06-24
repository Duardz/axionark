// src/app.d.ts
/// <reference types="@sveltejs/kit" />

declare global {
  namespace App {
    interface Error {
      message: string;
      code?: string;
    }
    
    interface Locals {
      csrfToken: string;
      user?: {
        uid: string;
        email: string;
      };
    }
    
    interface PageData {
      csrfToken?: string;
    }
    
    interface PageState {
      lastActivity?: number;
    }
    
    // interface Platform {}
  }
}

export {};