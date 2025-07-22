// src/components/PageAnalyzer/observers/MutationObserver.ts
// ✅ SIMPLIFIED: Lighter, faster mutation observer

interface MutationObserverOptions {
  onMutation: (mutations: MutationRecord[]) => void;
  options?: MutationObserverInit;
  debounceMs?: number;
}

export class MutationObserver {
  private observer: globalThis.MutationObserver | null = null;
  private callback: (mutations: MutationRecord[]) => void;
  private options: MutationObserverInit;
  private debounceTimer: NodeJS.Timeout | null = null;
  private debounceMs: number;
  private pendingMutations: MutationRecord[] = [];

  constructor({ 
    onMutation, 
    options = {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "id", "style", "hidden", "disabled"]
    },
    debounceMs = 500 
  }: MutationObserverOptions) {
    this.callback = onMutation;
    this.options = options;
    this.debounceMs = debounceMs;
  }

  observe(target: Node): void {
    if (this.observer) {
      this.disconnect();
    }

    this.observer = new globalThis.MutationObserver((mutations) => {
      // ✅ FAST: Filter only relevant mutations
      const relevantMutations = this.filterRelevantMutations(mutations);
      
      if (relevantMutations.length > 0) {
        this.pendingMutations.push(...relevantMutations);
        this.debouncedCallback();
      }
    });

    this.observer.observe(target, this.options);
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    
    this.pendingMutations = [];
  }

  /**
   * ✅ SMART: Only trigger callback after mutations stop for debounceMs
   */
  private debouncedCallback(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      if (this.pendingMutations.length > 0) {
        this.callback([...this.pendingMutations]);
        this.pendingMutations = [];
      }
      this.debounceTimer = null;
    }, this.debounceMs);
  }

  /**
   * ✅ EFFICIENT: Filter out noise and keep only meaningful changes
   */
  private filterRelevantMutations(mutations: MutationRecord[]): MutationRecord[] {
    return mutations.filter(mutation => {
      const target = mutation.target as Element;
      
      // ❌ Skip our own overlays and widgets
      if (target.closest?.('[data-navigation-overlay]') ||
          target.closest?.('[data-floating-widget]') ||
          target.closest?.('[data-page-analyzer]')) {
        return false;
      }

      // ❌ Skip script and style changes
      if (target.tagName === 'SCRIPT' || target.tagName === 'STYLE') {
        return false;
      }

      // ❌ Skip minor text changes
      if (mutation.type === 'characterData') {
        const textLength = mutation.target.textContent?.length || 0;
        return textLength > 5; // Only substantial text changes
      }

      // ❌ Skip unimportant attribute changes
      if (mutation.type === 'attributes') {
        const attrName = mutation.attributeName;
        const ignoredAttrs = ['data-testid', 'data-analytics', 'aria-expanded'];
        return !ignoredAttrs.includes(attrName || '');
      }

      // ✅ Keep structural changes (new elements, removed elements)
      if (mutation.type === 'childList') {
        // Only care about significant additions/removals
        const addedElements = Array.from(mutation.addedNodes).filter(node => 
          node.nodeType === Node.ELEMENT_NODE
        );
        const removedElements = Array.from(mutation.removedNodes).filter(node => 
          node.nodeType === Node.ELEMENT_NODE
        );
        
        return addedElements.length > 0 || removedElements.length > 0;
      }

      return true;
    });
  }

  /**
   * ✅ UTILITY: Check if mutations contain important UI changes
   */
  static hasSignificantChanges(mutations: MutationRecord[]): boolean {
    return mutations.some(mutation => {
      if (mutation.type === 'childList') {
        // New forms, buttons, inputs, modals
        const addedElements = Array.from(mutation.addedNodes).filter(node => 
          node.nodeType === Node.ELEMENT_NODE
        ) as Element[];
        
        return addedElements.some(element => {
          const tagName = element.tagName?.toLowerCase();
          return ['form', 'button', 'input', 'textarea', 'select', 'modal', 'dialog'].includes(tagName) ||
                 element.getAttribute('role') === 'button' ||
                 element.getAttribute('role') === 'dialog';
        });
      }
      
      if (mutation.type === 'attributes') {
        // Visibility or disability changes
        const attrName = mutation.attributeName;
        return ['style', 'hidden', 'disabled', 'aria-hidden'].includes(attrName || '');
      }
      
      return false;
    });
  }
}