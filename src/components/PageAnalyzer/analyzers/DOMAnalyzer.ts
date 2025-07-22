// src/components/PageAnalyzer/analyzers/DOMAnalyzer.ts
// ✅ FIXED: All issues resolved

import type {
  DOMStructure,
  SimpleElement,
  LinkElement,
  InputElement,
  ImageElement,
  // LayerType,
} from "../../../types/elements.types";
import { LayerType } from "../../../types/elements.types";

export class DOMAnalyzer {
  private elementCache = new Map<string, SimpleElement>();
  private analysisCache = new Map<
    string,
    { timestamp: number; result: DOMStructure }
  >();
  private readonly CACHE_DURATION = 5000;

  /**
   * ✅ ENHANCED: Main method now includes text content analysis
   */
  async analyzePage(document: Document): Promise<DOMStructure> {
    const cacheKey = this.generateCacheKey(document);

    const cached = this.analysisCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.result;
    }

    try {
      const startTime = Date.now();

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
        focusableElements,
        textContent, // ✅ NEW: All text content
      ] = await Promise.all([
        this.getElements(document, "form"),
        this.getElements(
          document,
          'button, input[type="button"], input[type="submit"], [role="button"]'
        ),
        this.analyzeInputs(document),
        this.analyzeLinks(document),
        this.getElements(document, 'nav, [role="navigation"]'),
        this.getElements(
          document,
          '[role="menu"], [role="menubar"], .menu, .dropdown-menu'
        ),
        this.getElements(document, 'h1, h2, h3, h4, h5, h6, [role="heading"]'),
        this.analyzeTextContent(document, "p"), // ✅ ENHANCED: Better paragraph analysis
        this.analyzeTextContent(document, "ul, ol, dl"),
        this.analyzeImages(document),
        this.getElements(
          document,
          'video, iframe[src*="youtube"], iframe[src*="vimeo"]'
        ),
        this.getElements(
          document,
          "div, section, article, aside, header, footer, main"
        ),
        this.getElements(document, '[role="dialog"], .modal, .popup, .overlay'),
        this.getElements(document, '[role="tooltip"], .tooltip, .popover'),
        this.getElements(
          document,
          '.loading, .spinner, .progress, [aria-label*="loading"]'
        ),
        this.getElements(
          document,
          '.error, .alert-danger, [role="alert"], .validation-error'
        ),
        this.getElements(document, "[role], header, nav, main, aside, footer"),
        this.getFocusableElements(document),
        this.extractAllTextContent(document), // ✅ NEW: Extract all meaningful text
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
        focusableElements,
        textContent, // ✅ NEW: Add to DOM structure
      };

      this.analysisCache.set(cacheKey, {
        timestamp: Date.now(),
        result: domStructure,
      });

      console.log(
        `DOMAnalyzer: Analysis completed in ${Date.now() - startTime}ms`
      );
      return domStructure;
    } catch (error) {
      console.error("DOMAnalyzer: Error analyzing page:", error);
      throw error;
    }
  }

  /**
   * ✅ IMPLEMENTED: Get elements by CSS selector
   */
  private async getElements(
    document: Document,
    selector: string
  ): Promise<SimpleElement[]> {
    try {
      const elements = Array.from(document.querySelectorAll(selector));
      return elements
        .filter((el) => this.isRelevant(el))
        .map((el) => this.createSimpleElement(el));
    } catch (error) {
      console.warn(`DOMAnalyzer: Error with selector "${selector}":`, error);
      return [];
    }
  }

  /**
   * ✅ IMPLEMENTED: Analyze input elements with more detail
   */
  private async analyzeInputs(document: Document): Promise<InputElement[]> {
    const inputs = Array.from(
      document.querySelectorAll("input, textarea, select")
    );

    return inputs
      .filter((input) => this.isRelevant(input))
      .map((input) => {
        const baseElement = this.createSimpleElement(input);
        const inputElement = input as
          | HTMLInputElement
          | HTMLTextAreaElement
          | HTMLSelectElement;

        return {
          ...baseElement,
          inputType: inputElement.type || "text",
          name: inputElement.name || undefined,
          value: inputElement.value || undefined,
          placeholder:
            (inputElement as HTMLInputElement).placeholder || undefined,
          isRequired: inputElement.required || false,
          hasError: this.checkInputError(input),
          errorMessage: this.getInputErrorMessage(input),
        } as InputElement;
      });
  }

  /**
   * ✅ IMPLEMENTED: Analyze link elements with more detail
   */
  private async analyzeLinks(document: Document): Promise<LinkElement[]> {
    const links = Array.from(document.querySelectorAll("a[href]"));

    return links
      .filter((link) => this.isRelevant(link))
      .map((link) => {
        const baseElement = this.createSimpleElement(link);
        const anchorElement = link as HTMLAnchorElement;

        return {
          ...baseElement,
          href: anchorElement.href,
          target: anchorElement.target || "_self",
          isExternal: this.isExternalLink(anchorElement.href),
          isDownload: anchorElement.hasAttribute("download"),
        } as LinkElement;
      });
  }

  /**
   * ✅ IMPLEMENTED: Analyze image elements with more detail
   */
  private async analyzeImages(document: Document): Promise<ImageElement[]> {
    const images = Array.from(document.querySelectorAll("img"));

    return images
      .filter((img) => this.isRelevant(img))
      .map((img) => {
        const baseElement = this.createSimpleElement(img);

        return {
          ...baseElement,
          src: img.src,
          alt: img.alt || "",
          isLoaded: img.complete && img.naturalWidth > 0,
          dimensions: {
            width: img.naturalWidth,
            height: img.naturalHeight,
          },
        } as ImageElement;
      });
  }

  /**
   * ✅ IMPLEMENTED: Get focusable elements (most important for navigation)
   */
  private getFocusableElements(document: Document): SimpleElement[] {
    const selector = `
      a[href]:not([tabindex="-1"]),
      button:not([disabled]):not([tabindex="-1"]),
      input:not([disabled]):not([tabindex="-1"]),
      textarea:not([disabled]):not([tabindex="-1"]),
      select:not([disabled]):not([tabindex="-1"]),
      [tabindex]:not([tabindex="-1"]),
      [contenteditable="true"]
    `
      .replace(/\s+/g, " ")
      .trim();

    try {
      const elements = Array.from(document.querySelectorAll(selector));
      return elements
        .filter((el) => this.isRelevant(el))
        .map((el) => this.createSimpleElement(el));
    } catch (error) {
      console.warn("DOMAnalyzer: Error getting focusable elements:", error);
      return [];
    }
  }

  /**
   * ✅ NEW: Extract all meaningful text content from the page
   */
  private async extractAllTextContent(
    document: Document
  ): Promise<SimpleElement[]> {
    const textElements: SimpleElement[] = [];

    // Get all elements that commonly contain readable text
    const textSelectors = [
      "p", // Paragraphs
      "div", // Divs with text content
      "span", // Inline text
      "li", // List items
      "td, th", // Table cells
      "blockquote", // Quotes
      "figcaption", // Image captions
      "label", // Form labels
      ".text, .content, .description", // Common text classes
      '[role="text"]', // ARIA text role
    ];

    for (const selector of textSelectors) {
      try {
        const elements = Array.from(document.querySelectorAll(selector));

        for (const element of elements) {
          if (this.isRelevantTextElement(element)) {
            const textElement = this.createTextElement(element);
            if (textElement.text && textElement.text.length > 10) {
              // Only meaningful text
              textElements.push(textElement);
            }
          }
        }
      } catch (error) {
        console.warn(`Error processing text selector ${selector}:`, error);
      }
    }

    return textElements;
  }

  /**
   * ✅ NEW: Enhanced text content analysis
   */
  private async analyzeTextContent(
    document: Document,
    selector: string
  ): Promise<SimpleElement[]> {
    try {
      const elements = Array.from(document.querySelectorAll(selector));
      return elements
        .filter((el) => this.isRelevantTextElement(el))
        .map((el) => this.createTextElement(el));
    } catch (error) {
      console.warn(
        `Error analyzing text content with selector ${selector}:`,
        error
      );
      return [];
    }
  }

  /**
   * ✅ NEW: Create text-focused element
   */
  private createTextElement(element: Element): SimpleElement {
    const baseElement = this.createSimpleElement(element);

    return {
      ...baseElement,
      // ✅ ENHANCED: Better text extraction for text elements
      text: this.getFullTextContent(element),

      // ✅ NEW: Text-specific properties
      wordCount: this.getWordCount(element.textContent || ""),
      hasLinks: element.querySelectorAll("a").length > 0,
      isHeading: /^h[1-6]$/i.test(element.tagName),
      isParagraph: element.tagName.toLowerCase() === "p",
      isList: ["ul", "ol", "dl"].includes(element.tagName.toLowerCase()),
      isLabel: element.tagName.toLowerCase() === "label",

      // ✅ CONTEXT: Where is this text?
      section: this.getTextSection(element),
      importance: this.calculateTextImportance(element),
    };
  }

  /**
   * ✅ IMPLEMENTED: Create simple element (main element creation method)
   */
  private createSimpleElement(element: Element): SimpleElement {
    const id = this.generateElementId(element);
    const cached = this.elementCache.get(id);
    if (cached) {
      cached.position = this.getEnhancedPosition(element);
      return cached;
    }

    const position = this.getEnhancedPosition(element);

    const simpleElement: SimpleElement = {
      id,
      tagName: element.tagName.toLowerCase(),
      text: this.getElementText(element),
      className: element.className || undefined,

      position: position, // ✅ Now includes z-index info

      isVisible: this.isVisible(element),
      isClickable: this.isClickable(element),
      isDisabled: (element as HTMLInputElement).disabled || undefined,

      ariaLabel: element.getAttribute("aria-label") || undefined,
      role: element.getAttribute("role") || undefined,

      // Type-specific properties
      href: (element as HTMLAnchorElement).href || undefined,
      src: (element as HTMLImageElement | HTMLVideoElement).src || undefined,
      inputType: (element as HTMLInputElement).type || undefined,
      isRequired: (element as HTMLInputElement).required || undefined,
      value: (element as HTMLInputElement).value || undefined,
      action: (element as HTMLFormElement).action || undefined,
      method: (element as HTMLFormElement).method || undefined,
      level: this.getHeadingLevel(element),
      alt: (element as HTMLImageElement).alt || undefined,
      target: (element as HTMLAnchorElement).target || undefined,
      isExternal: (element as HTMLAnchorElement).href
        ? this.isExternalLink((element as HTMLAnchorElement).href)
        : undefined,

      // ✅ NEW: Layer classification
      layerType: this.classifyLayerType(position.zIndex, element),
      blocksInteraction: this.blocksInteraction(element, position),

      confidence: this.calculateElementConfidence(element),
    };

    this.elementCache.set(id, simpleElement);
    return simpleElement;
  }

  // ✅ FIXED: Enhanced position method (renamed to avoid conflict)
  private getEnhancedPosition(element: Element) {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);

    // Parse z-index (defaults to 0 if auto)
    const zIndexStr = style.zIndex;
    const zIndex = zIndexStr === "auto" ? 0 : parseInt(zIndexStr) || 0;

    return {
      x: Math.round(rect.left + window.scrollX),
      y: Math.round(rect.top + window.scrollY),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      zIndex: zIndex,
      isOnTop: this.isElementOnTop(element, rect),
      isFixed: style.position === "fixed",
      isSticky: style.position === "sticky",
      isAbsolute: style.position === "absolute",
    };
  }

  // ✅ HELPER METHODS: All implemented

  private isRelevant(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && this.isVisible(element);
  }

  private isVisible(element: Element): boolean {
    const style = getComputedStyle(element);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      parseFloat(style.opacity) > 0.1
    );
  }

  private isClickable(element: Element): boolean {
    const tagName = element.tagName.toLowerCase();
    return (
      ["a", "button"].includes(tagName) ||
      element.getAttribute("role") === "button" ||
      element.hasAttribute("onclick")
    );
  }

  private generateElementId(element: Element): string {
    if (element.id) {
      return element.id;
    }

    const rect = element.getBoundingClientRect();
    const tagName = element.tagName.toLowerCase();
    const className = element.className || "";
    const text = this.getElementText(element)?.substring(0, 20) || "";

    const hash = this.simpleHash(
      `${tagName}-${className}-${text}-${rect.left}-${rect.top}`
    );
    return `elem_${hash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private getElementText(element: Element): string | undefined {
    const text = element.textContent?.trim();
    if (!text || text.length === 0) return undefined;
    return text.length > 100 ? text.substring(0, 100) + "..." : text;
  }

  private calculateElementConfidence(element: Element): number {
    let confidence = 0.5;

    if (element.id) confidence += 0.1;
    if (element.className) confidence += 0.1;
    if (element.getAttribute("aria-label")) confidence += 0.1;
    if (element.getAttribute("role")) confidence += 0.1;
    if (this.getElementText(element)) confidence += 0.2;

    return Math.min(confidence, 1.0);
  }

  private getHeadingLevel(element: Element): number | undefined {
    const match = element.tagName.match(/h(\d)/i);
    return match ? parseInt(match[1]) : undefined;
  }

  private checkInputError(input: Element): boolean {
    return (
      input.getAttribute("aria-invalid") === "true" ||
      input.classList.contains("error") ||
      input.classList.contains("invalid")
    );
  }

  private getInputErrorMessage(input: Element): string | undefined {
    const errorId = input.getAttribute("aria-describedby");
    if (errorId) {
      const errorElement = document.getElementById(errorId);
      return errorElement?.textContent || undefined;
    }
    return undefined;
  }

  private isExternalLink(href: string): boolean {
    try {
      const url = new URL(href);
      return url.hostname !== window.location.hostname;
    } catch {
      return false;
    }
  }

  private generateCacheKey(document: Document): string {
    return `${window.location.href}_${document.body.innerHTML.length}`;
  }

  // ✅ NEW TEXT-SPECIFIC METHODS:

  private getFullTextContent(element: Element): string | undefined {
    let text = "";

    // Get text from the element and its children
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        // Skip text in script/style tags
        const parent = node.parentElement;
        if (
          parent &&
          ["script", "style", "noscript"].includes(parent.tagName.toLowerCase())
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let node;
    while ((node = walker.nextNode())) {
      const nodeText = node.textContent?.trim();
      if (nodeText && nodeText.length > 0) {
        text += (text ? " " : "") + nodeText;
      }
    }

    text = text.trim();

    // Clean up text
    text = text.replace(/\s+/g, " "); // Collapse whitespace

    if (!text || text.length < 3) return undefined;

    // Limit length for performance
    return text.length > 500 ? text.substring(0, 500) + "..." : text;
  }

  private isRelevantTextElement(element: Element): boolean {
    // Skip if not visible
    if (!this.isVisible(element)) return false;

    // Skip if no meaningful text
    const text = element.textContent?.trim();
    if (!text || text.length < 3) return false;

    // Skip if it's mainly child elements (container)
    const childElementsText = Array.from(element.children)
      .map((child) => child.textContent?.trim() || "")
      .join(" ")
      .trim();

    const ownText = text.replace(childElementsText, "").trim();
    if (ownText.length < 3 && element.children.length > 0) return false;

    // Skip navigation elements (they're handled separately)
    if (element.closest("nav, .nav, .menu, .breadcrumb")) return false;

    // Skip form elements (handled separately)
    if (
      ["input", "textarea", "select", "button"].includes(
        element.tagName.toLowerCase()
      )
    )
      return false;

    return true;
  }

  private calculateTextImportance(element: Element): number {
    let importance = 0.5;

    const tagName = element.tagName.toLowerCase();
    const text = element.textContent?.trim() || "";
    const textLength = text.length;

    // Tag-based importance
    if (tagName === "h1") importance += 0.4;
    else if (tagName.match(/^h[2-3]$/)) importance += 0.3;
    else if (tagName.match(/^h[4-6]$/)) importance += 0.2;
    else if (tagName === "p") importance += 0.1;
    else if (tagName === "label") importance += 0.2;

    // Length-based importance
    if (textLength > 100) importance += 0.1;
    if (textLength > 300) importance += 0.1;

    // Class/ID based importance
    const className = element.className.toLowerCase();
    if (className.includes("title") || className.includes("heading"))
      importance += 0.2;
    if (className.includes("description") || className.includes("content"))
      importance += 0.1;
    if (className.includes("error") || className.includes("warning"))
      importance += 0.3;
    if (className.includes("success") || className.includes("info"))
      importance += 0.2;

    // Position-based importance (elements higher on page are more important)
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight) importance += 0.1; // Above the fold

    return Math.min(importance, 1.0);
  }

  private getTextSection(element: Element): string | undefined {
    // Check parent containers
    const section = element.closest(
      "main, section, article, aside, header, footer, nav"
    );
    if (section) {
      const tagName = section.tagName.toLowerCase();
      const id = section.id;
      const className = section.className;

      if (id) return `${tagName}#${id}`;
      if (className) return `${tagName}.${className.split(" ")[0]}`;
      return tagName;
    }

    return undefined;
  }

  private getWordCount(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }

  /**
   * ✅ NEW: Check if element is the topmost at its position
   */
  private isElementOnTop(element: Element, rect: DOMRect): boolean {
    try {
      // Get the element at the center of this element's bounding box
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const topElement = document.elementFromPoint(centerX, centerY);

      // Check if the element we found is this element or a descendant
      return topElement === element || element.contains(topElement);
    } catch (error) {
      console.error("DOMAnalyzer: isElementOnTop error:", error);
      // Fallback: assume it's on top if we can't determine
      return true;
    }
  }

  /**
   * ✅ NEW: Classify what type of layer this element represents
   */
  private classifyLayerType(zIndex: number, element: Element): LayerType {
    const tagName = element.tagName.toLowerCase();
    if (tagName === "dialog") return LayerType.MODAL;
    if (tagName === "aside" && zIndex > 100) return LayerType.NAVIGATION;
    
    const role = element.getAttribute("role");
    const className = element.className.toLowerCase();

    // Role-based classification (most reliable)
    if (role === "dialog" || role === "alertdialog") return LayerType.MODAL;
    if (role === "tooltip") return LayerType.TOOLTIP;
    if (role === "menu" || role === "menubar") return LayerType.DROPDOWN;

    // Class-based classification
    if (className.includes("modal") || className.includes("dialog"))
      return LayerType.MODAL;
    if (className.includes("tooltip") || className.includes("popover"))
      return LayerType.TOOLTIP;
    if (className.includes("dropdown") || className.includes("menu"))
      return LayerType.DROPDOWN;
    if (className.includes("overlay") || className.includes("backdrop"))
      return LayerType.OVERLAY;

    // Z-index based classification (fallback)
    if (zIndex >= 1000000) return LayerType.OVERLAY;
    if (zIndex >= 100000) return LayerType.TOOLTIP;
    if (zIndex >= 10000) return LayerType.MODAL;
    if (zIndex >= 1000) return LayerType.DROPDOWN;
    if (zIndex >= 100) return LayerType.NAVIGATION;
    if (zIndex >= 1) return LayerType.CONTENT;

    return LayerType.BACKGROUND;
  }

  /**
   * ✅ NEW: Check if element blocks interaction with elements below
   */
  private blocksInteraction(
    element: Element,
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
      zIndex: number;
      isOnTop?: boolean;
      isFixed?: boolean;
      isSticky?: boolean;
      isAbsolute?: boolean;
    }
  ): boolean {
    const role = element.getAttribute("role");
    const className = element.className.toLowerCase();

    // Modals and overlays typically block interaction
    if (role === "dialog" || role === "alertdialog") return true;
    if (className.includes("modal")) return true;
    if (className.includes("overlay")) return true;
    if (className.includes("backdrop")) return true;

    // Fixed position elements with high z-index often block interaction
    if (position.isFixed && position.zIndex > 1000) return true;

    // Large elements that cover most of the screen
    if (
      position.width > window.innerWidth * 0.8 &&
      position.height > window.innerHeight * 0.8
    )
      return true;

    return false;
  }

  /**
   * ✅ UTILITY: Find all elements that might be blocking interactions
   */
  public findBlockingElements(domStructure: DOMStructure): SimpleElement[] {
    const allElements = [
      ...domStructure.modals,
      ...domStructure.popups,
      ...domStructure.containers,
      ...domStructure.errorElements,
      ...domStructure.loadingElements,
    ];

    return allElements
      .filter((el) => el.blocksInteraction)
      .sort((a, b) => (b.position.zIndex || 0) - (a.position.zIndex || 0)); // Highest z-index first
  }

  /**
   * ✅ UTILITY: Find the topmost clickable element at a position
   */
  public findTopmostElementAt(
    x: number,
    y: number,
    domStructure: DOMStructure
  ): SimpleElement | null {
    const allInteractive = [
      ...domStructure.buttons,
      ...domStructure.links,
      ...domStructure.inputs,
      ...domStructure.focusableElements,
    ];

    // Find elements at this position
    const elementsAtPosition = allInteractive.filter((el) => {
      const pos = el.position;
      return (
        x >= pos.x &&
        x <= pos.x + pos.width &&
        y >= pos.y &&
        y <= pos.y + pos.height &&
        el.isVisible &&
        !el.isDisabled
      );
    });

    // Return the one with highest z-index
    return elementsAtPosition.reduce((topmost, current) => {
      if (!topmost) return current;
      return (current.position.zIndex || 0) > (topmost.position.zIndex || 0)
        ? current
        : topmost;
    }, null as SimpleElement | null);
  }
}
