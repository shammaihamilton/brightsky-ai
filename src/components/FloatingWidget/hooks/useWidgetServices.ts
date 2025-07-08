import { useContext } from 'react';
import type { IWidgetServices } from '../interfaces';
import { WidgetContext } from '../context/WidgetContextProvider';

export const useWidgetServices = (): IWidgetServices => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidgetServices must be used within a WidgetProvider');
  }
  return context;
};
