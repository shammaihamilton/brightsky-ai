import type { Position, DragData, SnapPosition } from "../types/widget.types";
import { WIDGET_CONFIG } from "../config/widgetConfig";

export class PositionCalculator {
  static calculateSnapPosition(
    dragData: DragData,
    isExpanded: boolean,
    windowSize: { width: number; height: number }
  ): { position: Position; snapPosition: SnapPosition } {
    const { width: winWidth, height: winHeight } = windowSize;
    const widgetWidth = isExpanded ? WIDGET_CONFIG.expanded.width : WIDGET_CONFIG.collapsed.width;
    const widgetHeight = WIDGET_CONFIG.expanded.height;
    const padding = WIDGET_CONFIG.padding;

    const centerX = dragData.x + widgetWidth / 2;
    const centerY = dragData.y + widgetHeight / 2;

    let finalX = dragData.x;
    let finalY = dragData.y;
    let snapPosition: SnapPosition = "custom";

    if (centerX < winWidth / 3) {
      snapPosition = "top-left";
      finalX = padding;
      finalY = Math.max(padding, Math.min(dragData.y, winHeight - widgetHeight - padding));
    } else if (centerX > (winWidth * 2) / 3) {
      snapPosition = "top-right";
      finalX = winWidth - widgetWidth - padding;
      finalY = Math.max(padding, Math.min(dragData.y, winHeight - widgetHeight - padding));
    } else if (centerY < winHeight / 3) {
      snapPosition = "bottom-left";
      finalY = padding;
      finalX = Math.max(padding, Math.min(dragData.x, winWidth - widgetWidth - padding));
    } else if (centerY > (winHeight * 2) / 3) {
      snapPosition = "bottom-right";
      finalY = winHeight - widgetHeight - padding;
      finalX = Math.max(padding, Math.min(dragData.x, winWidth - widgetWidth - padding));
    } else {
      finalX = Math.max(padding, Math.min(dragData.x, winWidth - widgetWidth - padding));
      finalY = Math.max(padding, Math.min(dragData.y, winHeight - widgetHeight - padding));
    }

    return { position: { x: finalX, y: finalY }, snapPosition };
  }

  static calculateChatPanelPosition(
    widgetPosition: Position,
    isExpanded: boolean,
    windowSize: { width: number; height: number }
  ): Position {
    const { width: winWidth, height: winHeight } = windowSize;
    const widgetWidth = isExpanded ? WIDGET_CONFIG.expanded.width : WIDGET_CONFIG.collapsed.width;
    const buttonCenterX = widgetPosition.x + widgetWidth / 2;
    const { padding, panelOffset, chatPanel } = WIDGET_CONFIG;

    let chatX = widgetPosition.x;
    let chatY = widgetPosition.y + WIDGET_CONFIG.expanded.height + panelOffset;

    if (buttonCenterX > winWidth / 2) {
      chatX = widgetPosition.x + widgetWidth - chatPanel.width;
    }

    if (chatY + chatPanel.height > winHeight - padding) {
      chatY = widgetPosition.y - chatPanel.height - panelOffset;
    }

    chatX = Math.max(padding, Math.min(chatX, winWidth - chatPanel.width - padding));
    chatY = Math.max(padding, Math.min(chatY, winHeight - chatPanel.height - padding));

    return { x: chatX, y: chatY };
  }

  static constrainToViewport(
    position: Position,
    widgetSize: { width: number; height: number },
    windowSize: { width: number; height: number }
  ): Position {
    const { width: winWidth, height: winHeight } = windowSize;
    const { padding } = WIDGET_CONFIG;

    return {
      x: Math.max(padding, Math.min(position.x, winWidth - widgetSize.width - padding)),
      y: Math.max(padding, Math.min(position.y, winHeight - widgetSize.height - padding)),
    };
  }
}
