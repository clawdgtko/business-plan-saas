/// <reference types="@playwright/test" />

/**
 * Types globaux pour les tests E2E
 */

declare module 'playwright-lighthouse' {
  interface PlayAuditOptions {
    page: import('@playwright/test').Page;
    thresholds: {
      performance?: number;
      accessibility?: number;
      'best-practices'?: number;
      seo?: number;
      pwa?: number;
    };
    port?: number;
    reports?: {
      formats?: {
        html?: boolean;
        json?: boolean;
        csv?: boolean;
      };
      name?: string;
      directory?: string;
    };
  }

  export function playAudit(options: PlayAuditOptions): Promise<void>;
}

// Extend Playwright types
declare global {
  interface Window {
    // Analytics
ddle?: any;
    gtag?: (...args: any[]) => void;
    
    // Performance
    performance: Performance;
  }
}

export {};
