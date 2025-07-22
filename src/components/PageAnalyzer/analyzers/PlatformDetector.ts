// src/components/PageAnalyzer/analyzers/PlatformDetector.ts
import type { PlatformInfo } from '../../../types/page.types';

export class PlatformDetector {
  async detectPlatform(url: string, document: Document): Promise<PlatformInfo> {
    const hostname = new URL(url).hostname.toLowerCase();
    const title = document.title.toLowerCase();
    const bodyText = document.body.textContent?.toLowerCase() || '';

    // AWS Detection
    if (this.isAWS(hostname, title, bodyText)) {
      return {
        name: 'AWS',
        version: this.detectAWSVersion(document),
        framework: this.detectFramework(document),
        isKnownPlatform: true
      };
    }

    // Azure Detection
    if (this.isAzure(hostname, title, bodyText)) {
      return {
        name: 'Azure',
        version: this.detectAzureVersion(document),
        framework: this.detectFramework(document),
        isKnownPlatform: true
      };
    }

    // GitHub Detection
    if (this.isGitHub(hostname, title, bodyText)) {
      return {
        name: 'GitHub',
        version: this.detectGitHubVersion(document),
        framework: this.detectFramework(document),
        isKnownPlatform: true
      };
    }

    // Google Cloud Detection
    if (this.isGoogleCloud(hostname, title, bodyText)) {
      return {
        name: 'Google Cloud',
        version: this.detectGCPVersion(document),
        framework: this.detectFramework(document),
        isKnownPlatform: true
      };
    }

    // Generic/Unknown Platform
    return {
      name: this.extractGenericPlatformName(hostname, title),
      framework: this.detectFramework(document),
      isKnownPlatform: false
    };
  }

  private isAWS(hostname: string, title: string, bodyText: string): boolean {
    return hostname.includes('aws.amazon.com') ||
           hostname.includes('console.aws.amazon.com') ||
           title.includes('aws') ||
           title.includes('amazon web services') ||
           bodyText.includes('amazon web services');
  }

  private isAzure(hostname: string, title: string, bodyText: string): boolean {
    return hostname.includes('portal.azure.com') ||
           hostname.includes('azure.microsoft.com') ||
           hostname.includes('azure.com') ||
           title.includes('azure') ||
           title.includes('microsoft azure') ||
           bodyText.includes('microsoft azure');
  }

  private isGitHub(hostname: string, title: string, bodyText: string): boolean {
    return hostname.includes('github.com') ||
           hostname.includes('github.io') ||
           title.includes('github') ||
           bodyText.includes('github');
  }

  private isGoogleCloud(hostname: string, title: string, bodyText: string): boolean {
    return hostname.includes('cloud.google.com') ||
           hostname.includes('console.cloud.google.com') ||
           title.includes('google cloud') ||
           title.includes('gcp') ||
           bodyText.includes('google cloud platform');
  }

  private detectAWSVersion(document: Document): string | undefined {
    // Look for version indicators in AWS console
    const versionMeta = document.querySelector('meta[name="aws-console-version"]');
    if (versionMeta) {
      return versionMeta.getAttribute('content') || undefined;
    }

    // Check for new vs old console
    if (document.querySelector('[data-testid="awsc-nav-header"]')) {
      return 'New Console';
    }

    if (document.querySelector('#awsc-navigation')) {
      return 'Classic Console';
    }

    return undefined;
  }

  private detectAzureVersion(document: Document): string | undefined {
    // Azure portal version detection
    const azureShell = document.querySelector('[data-automation-id="shell"]');
    if (azureShell) {
      return 'Modern Portal';
    }

    return undefined;
  }

  private detectGitHubVersion(document: Document): string | undefined {
    // GitHub version detection
    if (document.querySelector('[data-turbo-permanent]')) {
      return 'Modern GitHub';
    }

    return undefined;
  }

  private detectGCPVersion(document: Document): string | undefined {
    // Google Cloud Console version
    const gcpConsole = document.querySelector('[data-test-id="console-nav"]');
    if (gcpConsole) {
      return 'Cloud Console';
    }

    return undefined;
  }

  private detectFramework(document: Document): string | undefined {
    // React detection
    if (document.querySelector('[data-reactroot]') || 
        document.querySelector('#react-root') ||
        window.React) {
      return 'React';
    }

    // Angular detection
    if (document.querySelector('[ng-app]') || 
        document.querySelector('[data-ng-app]') ||
        window.angular) {
      return 'Angular';
    }

    // Vue detection
    if (document.querySelector('[data-v-]') || window.Vue) {
      return 'Vue';
    }

    // Next.js detection
    if (document.querySelector('#__next')) {
      return 'Next.js';
    }

    return undefined;
  }

  private extractGenericPlatformName(hostname: string, title: string): string {
    // Extract meaningful platform name from hostname or title
    const domain = hostname.replace('www.', '').split('.')[0];
    
    // Capitalize first letter
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  }
}