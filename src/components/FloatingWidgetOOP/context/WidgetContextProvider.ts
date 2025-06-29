import { createContext } from 'react';
import type { IWidgetServices } from '../interfaces';

export const WidgetContext = createContext<IWidgetServices | null>(null);
