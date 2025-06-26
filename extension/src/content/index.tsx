import * as React from "react";
import { createRoot } from "react-dom/client";
import FloatingWidget from "../../../src/components/FloatingWidget";
declare const chrome: typeof globalThis.chrome;

// Inject Tailwind CSS into the page
const injectTailwindCSS = () => {
  const id = "floating-widget-tailwind-css";
  if (document.getElementById(id)) return; 
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = chrome.runtime.getURL("index.css");
  document.head.appendChild(link);
};

// Create widget container
const createWidget = () => {
  injectTailwindCSS();
  const container = document.createElement("div");
  container.id = "floating-widget-root";
  container.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    pointer-events: none !important;
    z-index: 2147483647 !important;
  `;

  document.body.appendChild(container);  const root = createRoot(container);
  root.render(React.createElement(FloatingWidget));
};

// Initialize
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", createWidget);
} else {
  createWidget();
}
