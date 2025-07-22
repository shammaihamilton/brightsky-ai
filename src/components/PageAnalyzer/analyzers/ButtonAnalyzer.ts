// src/components/PageAnalyzer/analyzers/ButtonAnalyzer.ts
import type { ButtonElement } from '../../../types/elements.types';

export class ButtonAnalyzer {
  async analyzeButtons(document: Document): Promise<ButtonElement[]> {
    // Find all button-like elements
    const buttons = Array.from(document.querySelectorAll(
      'button, input[type="button"], input[type="submit"], input[type="reset"], [role="button"]'
    ));
    
    return buttons.map((button, index) => {
      const buttonElement = button as HTMLButtonElement | HTMLInputElement;
      
      return {
        // Basic element properties
        id: button.id || `button_${index}`,
        tagName: button.tagName.toLowerCase(),
        className: Array.from(button.classList),
        text: this.getButtonText(button),
        ariaLabel: button.getAttribute('aria-label') || undefined,
        title: button.getAttribute('title') || undefined,
        
        // Position and visibility (simplified)
        position: this.getBasicPosition(button),
        visibility: this.getBasicVisibility(button),
        interaction: this.getBasicInteraction(button),
        context: this.getBasicContext(button),
        purpose: this.getBasicPurpose(button),
        confidence: 0.8, // Good confidence for button detection
        
        // Button-specific properties
        buttonType: this.getButtonType(button),
        isPressed: button.getAttribute('aria-pressed') === 'true',
        isLoading: this.isButtonLoading(button),
        opensModal: this.opensModal(button),
        navigatesTo: this.getNavigationTarget(button),
        submitsForm: this.submitsForm(button),
        variant: this.getButtonVariant(button),
        size: this.getButtonSize(button)
      } as ButtonElement;
    });
  }

  private getButtonText(button: Element): string {
    // Get text content from button
    let text = button.textContent?.trim() || '';
    
    // If no text, try value attribute (for input buttons)
    if (!text && button.tagName === 'INPUT') {
      text = (button as HTMLInputElement).value || '';
    }
    
    // If still no text, try aria-label
    if (!text) {
      text = button.getAttribute('aria-label') || '';
    }
    
    return text.substring(0, 50); // Limit length
  }

  private getButtonType(button: Element): 'submit' | 'button' | 'reset' {
    if (button.tagName === 'INPUT') {
      const type = (button as HTMLInputElement).type;
      if (type === 'submit' || type === 'reset') {
        return type;
      }
    }
    
    if (button.tagName === 'BUTTON') {
      const type = (button as HTMLButtonElement).type;
      if (type === 'submit' || type === 'reset') {
        return type;
      }
    }
    
    return 'button';
  }

  private isButtonLoading(button: Element): boolean {
    // Check for common loading indicators
    return button.classList.contains('loading') ||
           button.classList.contains('spinner') ||
           button.getAttribute('aria-busy') === 'true' ||
           !!button.querySelector('.spinner, .loading');
  }

  private opensModal(button: Element): boolean {
    // Check if button opens a modal
    const target = button.getAttribute('data-target') ||
                  button.getAttribute('data-toggle') ||
                  button.getAttribute('aria-controls');
    
    return !!(target && (
      target.includes('modal') ||
      button.getAttribute('data-toggle') === 'modal' ||
      button.classList.contains('modal-trigger')
    ));
  }

  private getNavigationTarget(button: Element): string | undefined {
    // Check if button navigates to a URL
    const href = button.getAttribute('href');
    const onclick = button.getAttribute('onclick');
    
    if (href) return href;
    
    // Parse onclick for navigation
    if (onclick && onclick.includes('location')) {
      const match = onclick.match(/location\s*=\s*['"]([^'"]+)['"]/);
      return match ? match[1] : undefined;
    }
    
    return undefined;
  }

  private submitsForm(button: Element): boolean {
    return this.getButtonType(button) === 'submit' ||
           !!button.closest('form');
  }

  private getButtonVariant(button: Element): 'primary' | 'secondary' | 'danger' | 'success' | 'warning' {
    const className = button.className.toLowerCase();
    
    if (className.includes('primary') || className.includes('btn-primary')) {
      return 'primary';
    }
    if (className.includes('danger') || className.includes('btn-danger') || className.includes('delete')) {
      return 'danger';
    }
    if (className.includes('success') || className.includes('btn-success')) {
      return 'success';
    }
    if (className.includes('warning') || className.includes('btn-warning')) {
      return 'warning';
    }
    
    return 'secondary';
  }

  private getButtonSize(button: Element): 'small' | 'medium' | 'large' {
    const className = button.className.toLowerCase();
    
    if (className.includes('small') || className.includes('sm')) {
      return 'small';
    }
    if (className.includes('large') || className.includes('lg')) {
      return 'large';
    }
    
    return 'medium';
  }

  // Helper methods (same as FormAnalyzer)
  private getBasicPosition(element: Element): any {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height,
      viewportX: rect.left,
      viewportY: rect.top,
      zIndex: 0,
      isOnTop: true,
      isFixed: false,
      isSticky: false,
      isAbsolute: false,
      offsetFromScroll: { x: 0, y: 0 }
    };
  }

  private getBasicVisibility(element: Element): any {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    return {
      isVisible: style.display !== 'none' && style.visibility !== 'hidden',
      isInViewport: rect.top < window.innerHeight && rect.bottom > 0,
      opacity: parseFloat(style.opacity),
      isDisplayed: style.display !== 'none',
      isObscured: false,
      percentageVisible: 100
    };
  }

  private getBasicInteraction(element: Element): any {
    const button = element as HTMLButtonElement;
    
    return {
      isClickable: true,
      isEditable: false,
      isDisabled: button.disabled || false,
      isFocusable: !button.disabled,
      isRequired: false,
      hasClickHandler: !!element.getAttribute('onclick'),
      hasKeyboardHandler: true,
      hasHoverEffects: false,
      isFormElement: !!element.closest('form'),
      formId: element.closest('form')?.id || undefined,
      fieldType: 'button'
    };
  }

  private getBasicContext(element: Element): unknown {
    return {
      parentId: undefined,
      childrenIds: [],
      siblingIds: [],
      section: 'main',
      landmark: undefined,
      role: element.getAttribute('role') || 'button',
      workflow: undefined,
      step: undefined,
      groupId: undefined
    };
  }

  private getBasicPurpose(element: Element): any {
    const text = this.getButtonText(element).toLowerCase();
    const className = element.className.toLowerCase();
    
    let buttonType = 'BUTTON';
    if (text.includes('submit') || this.submitsForm(element)) {
      buttonType = 'SUBMIT_BUTTON';
    } else if (text.includes('cancel') || text.includes('close')) {
      buttonType = 'CANCEL_BUTTON';
    } else if (text.includes('delete') || text.includes('remove')) {
      buttonType = 'DELETE_BUTTON';
    } else if (text.includes('edit') || text.includes('modify')) {
      buttonType = 'EDIT_BUTTON';
    } else if (text.includes('save')) {
      buttonType = 'SAVE_BUTTON';
    }
    
    return {
      type: buttonType,
      action: undefined,
      dataType: undefined,
      destination: this.getNavigationTarget(element),
      businessFunction: undefined
    };
  }
}