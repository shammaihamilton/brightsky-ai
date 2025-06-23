// Basic safe localStorage wrapper
export const safeLocalStorage = {
    getItem(key: string): string | null {
      if (typeof window === 'undefined') {
        return null;
      }
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error(`Error reading localStorage key “${key}”:`, error);
        return null;
      }
    },
    setItem(key: string, value: string): void {
      if (typeof window === 'undefined') {
        console.warn(`Tried setting localStorage key “${key}” outside browser.`);
        return;
      }
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error(`Error setting localStorage key “${key}”:`, error);
      }
    },
    removeItem(key: string): void {
       if (typeof window === 'undefined') {
        console.warn(`Tried removing localStorage key “${key}” outside browser.`);
        return;
      }
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing localStorage key “${key}”:`, error);
      }
    }
  };