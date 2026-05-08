import { useCallback, useState, useSyncExternalStore } from "react";

/**
 * Custom hook for managing state synchronized with localStorage.
 * Handles SSR safely by ensuring hydration matches the server render.
 * 
 * @param key The localStorage key
 * @param initialValue The fallback value if no data is stored
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const isHydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue((prev) => {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(prev) : value;
      
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
      
      return valueToStore;
    });
  }, [key]);

  // If not hydrated yet, return the initialValue to match the server render
  return [isHydrated ? storedValue : initialValue, setValue, isHydrated] as const;
}
