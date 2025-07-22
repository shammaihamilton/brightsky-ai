// src/components/PageAnalyzer/observers/MutationObserver.ts

interface MutationObserverOptions {
  onMutation: (mutations: MutationRecord[]) => void;
  options: MutationObserverInit;
}

export class MutationObserver {
  private observer: globalThis.MutationObserver | null = null;
  private callback: (mutations: MutationRecord[]) => void;
  private options: MutationObserverInit;

  constructor({ onMutation, options }: MutationObserverOptions) {
    this.callback = onMutation;
    this.options = options;
  }

  observe(target: Node): void {
    if (this.observer) {
      this.disconnect();
    }

    this.observer = new globalThis.MutationObserver((mutations) => {
      // Filter out mutations we don't care about
      const relevantMutations = mutations.filter(mutation => {
        // Skip mutations from our own navigation overlay
        const target = mutation.target as Element;
        if (target.closest?.('[data-navigation-overlay]')) {
          return false;
        }
        
        // Skip text-only changes unless they're significant
        if (mutation.type === 'characterData') {
          const textLength = mutation.target.textContent?.length || 0;
          return textLength > 10; // Only care about substantial text changes
        }
        
        return true;
      });

      if (relevantMutations.length > 0) {
        this.callback(relevantMutations);
      }
    });

    this.observer.observe(target, this.options);
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}