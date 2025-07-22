// src/components/PageAnalyzer/analyzers/DOMAnalyzer.ts
import type { 
  DOMStructure, 
  BaseElement, 
  ElementPosition, 
  ElementVisibility, 
  ElementInteraction,
  ElementContext,
  ElementPurpose,
  LinkElement,
  InputElement,
  NavigationElement,
  MenuElement,
  HeadingElement,
  ImageElement,
  ContainerElement,
  LoadingElement,
  ErrorElement
} from '../../../types/elements.types';
import { ElementType } from '../../../types/elements.types';

export class DOMAnalyzer {
  private elementCache = new Map<string, BaseElement>();
  private analysisCache = new Map<string, { timestamp: number; result: DOMStructure }>();
  private readonly CACHE_DURATION = 5000; // 5 seconds

  /**
   * Main method to analyze the entire page
   */
  async analyzePage(document: Document): Promise<DOMStructure> {
    const cacheKey = this.generateCacheKey(document);
    
    // Check cache first
    const cached = this.analysisCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.result;
    }

    try {
      const startTime = Date.now();
      
      // Analyze all element types
      const [
        forms,
        buttons,
        inputs,
        links,
        navigation,
        menus,
        headings,
        paragraphs,
        lists,
        images,
        videos,
        containers,
        modals,
        popups,
        loadingElements,
        errorElements,
        landmarks,
        focusableElements
      ] = await Promise.all([
        this.analyzeForms(document),
        this.analyzeButtons(document),
        this.analyzeInputs(document),
        this.analyzeLinks(document),
        this.analyzeNavigation(document),
        this.analyzeMenus(document),
        this.analyzeHeadings(document),
        this.analyzeParagraphs(document),
        this.analyzeLists(document),
        this.analyzeImages(document),
        this.analyzeVideos(document),
        this.analyzeContainers(document),
        this.analyzeModals(document),
        this.analyzePopups(document),
        this.analyzeLoadingElements(document),
        this.analyzeErrorElements(document),
        this.analyzeLandmarks(document),
        this.analyzeFocusableElements(document)
      ]);

      const domStructure: DOMStructure = {
        forms,
        buttons,
        inputs,
        links,
        navigation,
        menus,
        headings,
        paragraphs,
        lists,
        images,
        videos,
        containers,
        modals,
        popups,
        loadingElements,
        errorElements,
        landmarks,
        focusableElements
      };

      // Cache the result
      this.analysisCache.set(cacheKey, {
        timestamp: Date.now(),
        result: domStructure
      });

      console.log(`DOMAnalyzer: Analysis completed in ${Date.now() - startTime}ms`);
      return domStructure;

    } catch (error) {
      console.error('DOMAnalyzer: Error analyzing page:', error);
      throw error;
    }
  }

  /**
   * Analyze form elements (will be enhanced by FormAnalyzer)
   */
  private async analyzeForms(document: Document): Promise<any[]> {
    // Basic form detection - FormAnalyzer will provide detailed analysis
    const forms = Array.from(document.querySelectorAll('form'));
    return forms.map(form => ({
      id: this.generateElementId(form),
      element: form,
      tagName: 'form',
      action: form.action || '',
      method: form.method || 'GET'
    }));
  }

  /**
   * Analyze button elements (will be enhanced by ButtonAnalyzer)  
   */
  private async analyzeButtons(document: Document): Promise<any[]> {
    // Basic button detection - ButtonAnalyzer will provide detailed analysis
    const buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], [role="button"]'));
    return buttons.map(button => ({
      id: this.generateElementId(button),
      element: button,
      tagName: button.tagName.toLowerCase(),
      text: this.getElementText(button),
      type: (button as HTMLInputElement).type || 'button'
    }));
  }

  /**
   * Analyze input elements
   */
  private async analyzeInputs(document: Document): Promise<InputElement[]> {
    const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
    
    return inputs.map(input => {
      const baseElement = this.createBaseElement(input);
      const inputElement = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      
      return {
        ...baseElement,
        inputType: inputElement.type || 'text',
        name: inputElement.name || '',
        value: inputElement.value || '',
        placeholder: (inputElement as HTMLInputElement).placeholder || undefined,
        isRequired: inputElement.required || false,
        pattern: (inputElement as HTMLInputElement).pattern || undefined,
        minLength: (inputElement as HTMLInputElement).minLength || undefined,
        maxLength: (inputElement as HTMLInputElement).maxLength || undefined,
        isFocused: document.activeElement === input,
        hasError: this.checkInputError(input),
        errorMessage: this.getInputErrorMessage(input),
        autocomplete: (inputElement as HTMLInputElement).autocomplete || undefined,
        suggestions: this.getInputSuggestions(input)
      } as InputElement;
    });
  }

  /**
   * Analyze link elements
   */
  private async analyzeLinks(document: Document): Promise<LinkElement[]> {
    const links = Array.from(document.querySelectorAll('a[href]'));
    
    return links.map(link => {
      const baseElement = this.createBaseElement(link);
      const anchorElement = link as HTMLAnchorElement;
      
      return {
        ...baseElement,
        href: anchorElement.href,
        target: anchorElement.target || '_self',
        isExternal: this.isExternalLink(anchorElement.href),
        isDownload: anchorElement.hasAttribute('download'),
        downloadFilename: anchorElement.download || undefined
      } as LinkElement;
    });
  }

  /**
   * Analyze navigation elements
   */
  private async analyzeNavigation(document: Document): Promise<NavigationElement[]> {
    const navElements = Array.from(document.querySelectorAll('nav, [role="navigation"]'));
    
    return navElements.map(nav => {
      const baseElement = this.createBaseElement(nav);
      
      return {
        ...baseElement,
        navigationItems: this.getNavigationItems(nav),
        isMainNavigation: this.isMainNavigation(nav),
        isBreadcrumb: this.isBreadcrumb(nav)
      } as NavigationElement;
    });
  }

  /**
   * Analyze menu elements
   */
  private async analyzeMenus(document: Document): Promise<MenuElement[]> {
    const menus = Array.from(document.querySelectorAll('[role="menu"], [role="menubar"], .menu, .dropdown-menu'));
    
    return menus.map(menu => {
      const baseElement = this.createBaseElement(menu);
      
      return {
        ...baseElement,
        menuItems: this.getMenuItems(menu),
        isOpen: this.isMenuOpen(menu),
        menuType: this.getMenuType(menu)
      } as MenuElement;
    });
  }

  /**
   * Analyze heading elements
   */
  private async analyzeHeadings(document: Document): Promise<HeadingElement[]> {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]'));
    
    return headings.map(heading => {
      const baseElement = this.createBaseElement(heading);
      
      return {
        ...baseElement,
        level: this.getHeadingLevel(heading),
        isPageTitle: heading.tagName === 'H1' && document.querySelectorAll('h1').length === 1
      } as HeadingElement;
    });
  }

  /**
   * Analyze paragraph elements
   */
  private async analyzeParagraphs(document: Document): Promise<any[]> {
    const paragraphs = Array.from(document.querySelectorAll('p'));
    
    return paragraphs.map(p => {
      const baseElement = this.createBaseElement(p);
      
      return {
        ...baseElement,
        wordCount: this.getWordCount(p.textContent || ''),
        hasLinks: p.querySelectorAll('a').length > 0
      };
    });
  }

  /**
   * Analyze list elements
   */
  private async analyzeLists(document: Document): Promise<any[]> {
    const lists = Array.from(document.querySelectorAll('ul, ol, dl'));
    
    return lists.map(list => {
      const baseElement = this.createBaseElement(list);
      
      return {
        ...baseElement,
        listType: list.tagName.toLowerCase(),
        itemCount: list.children.length,
        isNested: !!list.closest('li')
      };
    });
  }

  /**
   * Analyze image elements
   */
  private async analyzeImages(document: Document): Promise<ImageElement[]> {
    const images = Array.from(document.querySelectorAll('img'));
    
    return images.map(img => {
      const baseElement = this.createBaseElement(img);
      
      return {
        ...baseElement,
        src: img.src,
        alt: img.alt || '',
        isDecorative: !img.alt && img.getAttribute('role') === 'presentation',
        isLoaded: img.complete && img.naturalWidth > 0,
        dimensions: {
          width: img.naturalWidth,
          height: img.naturalHeight
        }
      } as ImageElement;
    });
  }

  /**
   * Analyze video elements
   */
  private async analyzeVideos(document: Document): Promise<any[]> {
    const videos = Array.from(document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]'));
    
    return videos.map(video => {
      const baseElement = this.createBaseElement(video);
      
      return {
        ...baseElement,
        src: (video as HTMLVideoElement).src || (video as HTMLIFrameElement).src,
        isPlaying: !(video as HTMLVideoElement).paused,
        hasControls: (video as HTMLVideoElement).controls,
        isEmbedded: video.tagName === 'IFRAME'
      };
    });
  }

  /**
   * Analyze container elements
   */
  private async analyzeContainers(document: Document): Promise<ContainerElement[]> {
    const containers = Array.from(document.querySelectorAll('div, section, article, aside, header, footer, main'));
    
    return containers.map(container => {
      const baseElement = this.createBaseElement(container);
      
      return {
        ...baseElement,
        containerType: this.getContainerType(container),
        childCount: container.children.length,
        hasScrollableContent: this.hasScrollableContent(container)
      } as ContainerElement;
    });
  }

  /**
   * Analyze modal elements
   */
  private async analyzeModals(document: Document): Promise<any[]> {
    const modals = Array.from(document.querySelectorAll('[role="dialog"], .modal, .popup, .overlay'));
    
    return modals.map(modal => {
      const baseElement = this.createBaseElement(modal);
      
      return {
        ...baseElement,
        isOpen: this.isModalOpen(modal),
        isBlocking: this.isModalBlocking(modal),
        hasCloseButton: !!modal.querySelector('[aria-label*="close"], .close, .x')
      };
    });
  }

  /**
   * Analyze popup elements
   */
  private async analyzePopups(document: Document): Promise<any[]> {
    const popups = Array.from(document.querySelectorAll('[role="tooltip"], .tooltip, .popover'));
    
    return popups.map(popup => {
      const baseElement = this.createBaseElement(popup);
      
      return {
        ...baseElement,
        triggerElement: this.findPopupTrigger(popup),
        isVisible: this.getElementVisibility(popup).isVisible
      };
    });
  }

  /**
   * Analyze loading elements
   */
  private async analyzeLoadingElements(document: Document): Promise<LoadingElement[]> {
    const loadingElements = Array.from(document.querySelectorAll(
      '.loading, .spinner, .progress, [aria-label*="loading"], [aria-label*="Loading"]'
    ));
    
    return loadingElements.map(element => {
      const baseElement = this.createBaseElement(element);
      
      return {
        ...baseElement,
        loadingType: this.getLoadingType(element),
        isActive: this.getElementVisibility(element).isVisible
      } as LoadingElement;
    });
  }

  /**
   * Analyze error elements
   */
  private async analyzeErrorElements(document: Document): Promise<ErrorElement[]> {
    const errorElements = Array.from(document.querySelectorAll(
      '.error, .alert-danger, [role="alert"], .validation-error, [aria-invalid="true"]'
    ));
    
    return errorElements.map(element => {
      const baseElement = this.createBaseElement(element);
      
      return {
        ...baseElement,
        errorType: this.getErrorType(element),
        errorMessage: this.getElementText(element),
        relatedField: this.findRelatedField(element)
      } as ErrorElement;
    });
  }

  /**
   * Analyze landmark elements
   */
  private async analyzeLandmarks(document: Document): Promise<any[]> {
    const landmarks = Array.from(document.querySelectorAll('[role], header, nav, main, aside, footer'));
    
    return landmarks.map(landmark => {
      const baseElement = this.createBaseElement(landmark);
      
      return {
        ...baseElement,
        landmarkType: this.getLandmarkType(landmark),
        isUnique: this.isUniqueLandmark(landmark, document)
      };
    });
  }

  /**
   * Analyze focusable elements
   */
  private async analyzeFocusableElements(document: Document): Promise<any[]> {
    const focusableElements = Array.from(document.querySelectorAll(
      'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
    ));
    
    return focusableElements.map(element => {
      const baseElement = this.createBaseElement(element);
      
      return {
        ...baseElement,
        tabIndex: (element as HTMLElement).tabIndex,
        isFocused: document.activeElement === element,
        isFocusable: this.isFocusable(element)
      };
    });
  }

  /**
   * Create base element information
   */
  private createBaseElement(element: Element): BaseElement {
    const id = this.generateElementId(element);
    
    // Check cache first
    const cached = this.elementCache.get(id);
    if (cached) {
      // Update position and visibility (these can change)
      cached.position = this.getElementPosition(element);
      cached.visibility = this.getElementVisibility(element);
      return cached;
    }

    const baseElement: BaseElement = {
      id,
      tagName: element.tagName.toLowerCase(),
      className: Array.from(element.classList),
      text: this.getElementText(element),
      ariaLabel: element.getAttribute('aria-label') || undefined,
      title: element.getAttribute('title') || undefined,
      position: this.getElementPosition(element),
      visibility: this.getElementVisibility(element),
      interaction: this.getElementInteraction(element),
      context: this.getElementContext(element),
      purpose: this.getElementPurpose(element),
      confidence: this.calculateElementConfidence(element)
    };

    // Cache the element
    this.elementCache.set(id, baseElement);
    return baseElement;
  }

  // Helper methods continue in next part...
  private generateElementId(element: Element): string {
    // Try to use existing ID
    if (element.id) {
      return element.id;
    }

    // Generate based on position and attributes
    const rect = element.getBoundingClientRect();
    const tagName = element.tagName.toLowerCase();
    const className = element.className || '';
    const text = this.getElementText(element).substring(0, 20);
    
    const hash = this.simpleHash(`${tagName}-${className}-${text}-${rect.left}-${rect.top}`);
    return `elem_${hash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private getElementText(element: Element): string {
    // Get visible text content
    const text = element.textContent?.trim() || '';
    return text.substring(0, 200); // Limit length
  }

  private getElementPosition(element: Element): ElementPosition {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    
    return {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height,
      viewportX: rect.left,
      viewportY: rect.top,
      zIndex: parseInt(style.zIndex) || 0,
      isOnTop: this.isElementOnTop(element),
      isFixed: style.position === 'fixed',
      isSticky: style.position === 'sticky',
      isAbsolute: style.position === 'absolute',
      scrollContainer: this.findScrollContainer(element),
      offsetFromScroll: { x: 0, y: 0 } // TODO: Calculate properly
    };
  }

  private getElementVisibility(element: Element): ElementVisibility {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    
    const isVisible = style.display !== 'none' && 
                     style.visibility !== 'hidden' && 
                     parseFloat(style.opacity) > 0;
    
    const isInViewport = rect.top < window.innerHeight && 
                        rect.bottom > 0 && 
                        rect.left < window.innerWidth && 
                        rect.right > 0;
    
    return {
      isVisible,
      isInViewport,
      opacity: parseFloat(style.opacity),
      isDisplayed: style.display !== 'none',
      isObscured: this.isElementObscured(element),
      percentageVisible: this.calculateVisiblePercentage(rect)
    };
  }

  // Additional helper methods...
  private getElementInteraction(element: Element): ElementInteraction {
    const tagName = element.tagName.toLowerCase();
    const isInput = ['input', 'textarea', 'select'].includes(tagName);
    const isButton = tagName === 'button' || element.getAttribute('role') === 'button';
    const isLink = tagName === 'a' && element.hasAttribute('href');
    
    return {
      isClickable: isButton || isLink || element.hasAttribute('onclick'),
      isEditable: isInput && !(element as HTMLInputElement).readOnly,
      isDisabled: (element as HTMLInputElement).disabled || false,
      isFocusable: this.isFocusable(element),
      isRequired: (element as HTMLInputElement).required || false,
      hasClickHandler: !!element.getAttribute('onclick'),
      hasKeyboardHandler: this.hasKeyboardHandlers(element),
      hasHoverEffects: this.hasHoverEffects(element),
      isFormElement: this.isFormElement(element),
      formId: this.getFormId(element),
      fieldType: this.getFieldType(element)
    };
  }

  private getElementContext(element: Element): ElementContext {
    return {
      parentId: element.parentElement ? this.generateElementId(element.parentElement) : undefined,
      childrenIds: Array.from(element.children).map(child => this.generateElementId(child)),
      siblingIds: [], // TODO: Implement if needed
      section: this.getPageSection(element),
      landmark: element.getAttribute('role') || undefined,
      role: element.getAttribute('role') || undefined,
      workflow: this.detectWorkflow(element),
      step: this.detectWorkflowStep(element),
      groupId: this.getGroupId(element)
    };
  }

  private getElementPurpose(element: Element): ElementPurpose {
    return {
      type: this.classifyElementType(element),
      action: this.detectElementAction(element),
      dataType: this.detectDataType(element),
      destination: this.getDestination(element),
      businessFunction: this.detectBusinessFunction(element)
    };
  }

  private calculateElementConfidence(element: Element): number {
    // Simple confidence calculation based on available information
    let confidence = 0.5;
    
    if (element.id) confidence += 0.1;
    if (element.className) confidence += 0.1;
    if (element.getAttribute('aria-label')) confidence += 0.1;
    if (element.getAttribute('role')) confidence += 0.1;
    if (this.getElementText(element)) confidence += 0.2;
    
    return Math.min(confidence, 1.0);
  }

  // Placeholder implementations for complex helper methods
  private isElementOnTop(element: Element): boolean { return true; }
  private findScrollContainer(element: Element): string | undefined { return undefined; }
  private isElementObscured(element: Element): boolean { return false; }
  private calculateVisiblePercentage(rect: DOMRect): number { 
    return rect.width * rect.height > 0 ? 100 : 0; 
  }
  private isFocusable(element: Element): boolean {
    return element.hasAttribute('tabindex') || 
           ['a', 'button', 'input', 'textarea', 'select'].includes(element.tagName.toLowerCase());
  }
  private hasKeyboardHandlers(element: Element): boolean { return false; }
  private hasHoverEffects(element: Element): boolean { return false; }
  private isFormElement(element: Element): boolean {
    return !!element.closest('form');
  }
  private getFormId(element: Element): string | undefined {
    const form = element.closest('form');
    return form ? this.generateElementId(form) : undefined;
  }
  private getFieldType(element: Element): string | undefined {
    return (element as HTMLInputElement).type;
  }
  private getPageSection(element: Element): string | undefined { return undefined; }
  private detectWorkflow(element: Element): string | undefined { return undefined; }
  private detectWorkflowStep(element: Element): number | undefined { return undefined; }
  private getGroupId(element: Element): string | undefined { return undefined; }
  private classifyElementType(element: Element): ElementType { return ElementType.UNKNOWN; }
  private detectElementAction(element: Element): any { return undefined; }
  private detectDataType(element: Element): any { return undefined; }
  private getDestination(element: Element): string | undefined { return undefined; }
  private detectBusinessFunction(element: Element): any { return undefined; }

  // Additional helper methods for specific element types
  private getNavigationItems(nav: Element): any[] { return []; }
  private isMainNavigation(nav: Element): boolean { return nav.tagName === 'NAV'; }
  private isBreadcrumb(nav: Element): boolean { 
    return nav.getAttribute('aria-label')?.toLowerCase().includes('breadcrumb') || false;
  }
  private getMenuItems(menu: Element): any[] { return []; }
  private isMenuOpen(menu: Element): boolean { return true; }
  private getMenuType(menu: Element): string { return 'dropdown'; }
  private getHeadingLevel(heading: Element): number {
    const match = heading.tagName.match(/h(\d)/i);
    return match ? parseInt(match[1]) : 1;
  }
  private getWordCount(text: string): number {
    return text.trim().split(/\s+/).length;
  }
  private getContainerType(container: Element): string {
    return container.tagName.toLowerCase();
  }
  private hasScrollableContent(container: Element): boolean {
    const style = getComputedStyle(container);
    return style.overflow === 'auto' || style.overflow === 'scroll' ||
           style.overflowY === 'auto' || style.overflowY === 'scroll';
  }
  private isModalOpen(modal: Element): boolean {
    return this.getElementVisibility(modal).isVisible;
  }
  private isModalBlocking(modal: Element): boolean { return true; }
  private findPopupTrigger(popup: Element): string | undefined { return undefined; }
  private getLoadingType(element: Element): string { return 'spinner'; }
  private getErrorType(element: Element): string { return 'validation'; }
  private findRelatedField(element: Element): string | undefined { return undefined; }
  private getLandmarkType(landmark: Element): string {
    return landmark.getAttribute('role') || landmark.tagName.toLowerCase();
  }
  private isUniqueLandmark(landmark: Element, document: Document): boolean { return true; }
  private checkInputError(input: Element): boolean {
    return input.getAttribute('aria-invalid') === 'true' ||
           input.classList.contains('error') ||
           input.classList.contains('invalid');
  }
  private getInputErrorMessage(input: Element): string | undefined {
    const errorId = input.getAttribute('aria-describedby');
    if (errorId) {
      const errorElement = document.getElementById(errorId);
      return errorElement?.textContent || undefined;
    }
    return undefined;
  }
  private getInputSuggestions(input: Element): string[] { return []; }
  private isExternalLink(href: string): boolean {
    try {
      const url = new URL(href);
      return url.hostname !== window.location.hostname;
    } catch {
      return false;
    }
  }

  private generateCacheKey(document: Document): string {
    // Simple cache key based on URL and body innerHTML length
    return `${window.location.href}_${document.body.innerHTML.length}`;
  }
}