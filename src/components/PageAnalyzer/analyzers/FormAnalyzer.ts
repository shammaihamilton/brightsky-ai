// src/components/PageAnalyzer/analyzers/FormAnalyzer.ts
import type { FormElement } from '../../../types/elements.types';

export class FormAnalyzer {
  async analyzeForms(document: Document): Promise<FormElement[]> {
    // Simple form analysis for now - will be enhanced later
    const forms = Array.from(document.querySelectorAll('form'));
    
    return forms.map((form, index) => {
      const formElement = form as HTMLFormElement;
      
      return {
        // Basic element properties
        id: form.id || `form_${index}`,
        tagName: 'form',
        className: Array.from(form.classList),
        text: this.getFormText(form),
        ariaLabel: form.getAttribute('aria-label') || undefined,
        title: form.getAttribute('title') || undefined,
        
        // Position and visibility (simplified for now)
        position: this.getBasicPosition(form),
        visibility: this.getBasicVisibility(form),
        interaction: this.getBasicInteraction(form),
        context: this.getBasicContext(form),
        purpose: this.getBasicPurpose(form),
        confidence: 0.7, // Medium confidence for basic analysis
        
        // Form-specific properties
        action: formElement.action || '',
        method: (formElement.method || 'GET') as 'GET' | 'POST' | 'PUT' | 'DELETE',
        enctype: formElement.enctype || undefined,
        fields: [], // Will be populated by input analysis
        submitButton: undefined, // Will be detected
        
        // Validation (basic)
        isValid: true, // Assume valid for now
        errors: [],
        requiredFields: this.getRequiredFields(form),
        
        // State (basic)
        isSubmitting: false,
        percentComplete: this.calculateCompletionPercentage(form),
        
        // Security (basic)
        hasCSRFToken: !!form.querySelector('input[name*="csrf"], input[name*="token"]'),
        isSecure: window.location.protocol === 'https:'
      } as FormElement;
    });
  }

  private getFormText(form: Element): string {
    // Get visible text from form labels and legends
    const labels = form.querySelectorAll('label, legend');
    const text = Array.from(labels)
      .map(el => el.textContent?.trim())
      .filter(text => text && text.length > 0)
      .join(' ');
    
    return text.substring(0, 100); // Limit length
  }

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
    return {
      isClickable: false,
      isEditable: false,
      isDisabled: false,
      isFocusable: true,
      isRequired: false,
      hasClickHandler: false,
      hasKeyboardHandler: false,
      hasHoverEffects: false,
      isFormElement: true,
      formId: element.id || undefined,
      fieldType: 'form'
    };
  }

  private getBasicContext(element: Element): any {
    return {
      parentId: undefined,
      childrenIds: [],
      siblingIds: [],
      section: 'main',
      landmark: 'form',
      role: element.getAttribute('role') || 'form',
      workflow: undefined,
      step: undefined,
      groupId: undefined
    };
  }

  private getBasicPurpose(element: Element): any {
    const form = element as HTMLFormElement;
    const action = form.action?.toLowerCase() || '';
    
    let formType = 'FORM';
    if (action.includes('login') || action.includes('signin')) {
      formType = 'LOGIN_FORM';
    } else if (action.includes('register') || action.includes('signup')) {
      formType = 'SIGNUP_FORM';
    }
    
    return {
      type: formType,
      action: undefined,
      dataType: undefined,
      destination: form.action || undefined,
      businessFunction: undefined
    };
  }

  private getRequiredFields(form: Element): string[] {
    const requiredInputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    return Array.from(requiredInputs).map(input => input.id || input.getAttribute('name') || '');
  }

  private calculateCompletionPercentage(form: Element): number {
    const inputs = form.querySelectorAll('input, textarea, select');
    if (inputs.length === 0) return 0;
    
    const filledInputs = Array.from(inputs).filter(input => {
      const inputElement = input as HTMLInputElement;
      return inputElement.value && inputElement.value.trim().length > 0;
    });
    
    return Math.round((filledInputs.length / inputs.length) * 100);
  }
}