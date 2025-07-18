import { useMemo } from "react";

interface Position {
  x: number;
  y: number;
}

export const usePositionCalculations = (
  position: Position,
  actualButtonSize: number,
  isPanelOpen: boolean,
) => {
  const chatPanelPosition = useMemo(() => {
    const panelWidth = 320;
    const panelHeight = 280;
    const padding = 15;

    let x = position.x - panelWidth - 5;
    let y = position.y - panelHeight - 10;

    if (x < padding) {
      x = position.x + actualButtonSize;
    }

    if (y < padding) {
      y = position.y + actualButtonSize + 10;
    }

    if (x + panelWidth > window.innerWidth - padding) {
      x = window.innerWidth - panelWidth - padding;
    }

    if (y + panelHeight > window.innerHeight - padding) {
      y = window.innerHeight - panelHeight - padding;
    }

    return { x, y };
  }, [position, actualButtonSize]);

  const menuPosition = useMemo(() => {
    const menuWidth = 200;
    const menuHeight = 300;
    const padding = 10;
    const gap = 2;

    let x = position.x + actualButtonSize + gap + 10;
    let y = position.y + actualButtonSize + gap;

    if (x + menuWidth > window.innerWidth - padding) {
      x = position.x - menuWidth - gap;
    }

    if (y + menuHeight > window.innerHeight - padding) {
      y = position.y - menuHeight - gap + 30;
    }

    if (x < padding) x = padding;
    if (y < padding) y = padding;

    // Avoid overlap with chat panel
    if (isPanelOpen) {
      if (
        x < chatPanelPosition.x + 320 &&
        x + menuWidth > chatPanelPosition.x &&
        y < chatPanelPosition.y + 280 &&
        y + menuHeight > chatPanelPosition.y
      ) {
        x = Math.min(
          window.innerWidth - menuWidth - padding,
          chatPanelPosition.x + 320 + 10,
        );
      }
    }

    return { x, y };
  }, [position, actualButtonSize, isPanelOpen, chatPanelPosition]);

  return { chatPanelPosition, menuPosition };
};
