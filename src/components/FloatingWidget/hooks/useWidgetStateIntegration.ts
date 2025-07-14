import { useState, useEffect } from "react";
import type { WidgetState } from "../interfaces";
import { useWidgetState } from "./index";

export const useWidgetStateIntegration = () => {
  const stateService = useWidgetState();
  const [state, setState] = useState<WidgetState>(stateService.getState());

  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = stateService.subscribe((newState: WidgetState) => {
      setState(newState);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [stateService]);

  return {
    isPanelOpen: state.isPanelOpen,
    showMenu: state.showMenu,
    isHovered: state.isHovered,
    isDragging: state.isDragging,

    // State actions
    togglePanel: () => stateService.togglePanel(),
    openPanel: () => stateService.openPanel(),
    closePanel: () => stateService.closePanel(),
    toggleMenu: () => stateService.toggleMenu(),
    openMenu: () => stateService.openMenu(),
    closeMenu: () => stateService.closeMenu(),
    setHovered: (value: boolean) => stateService.setHovered(value),
  };
};
