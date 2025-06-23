export interface Position {
  x: number;
  y: number;
}

export interface WidgetDimensions {
  width: number;
  height: number;
}

export interface WidgetConfig {
  collapsed: WidgetDimensions;
  expanded: WidgetDimensions;
  chatPanel: WidgetDimensions;
  padding: number;
  panelOffset: number;
}

export interface DragData {
  x: number;
  y: number;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';
export type SnapPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';
