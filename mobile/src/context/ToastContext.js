/**
 * ToastContext.js
 * ------------------------------------------------------------------
 * App-wide toast/snackbar, shown over whatever screen is active.
 * Call showToast('Job deleted') from any component via useToast().
 * ------------------------------------------------------------------
 */
import { createContext, useCallback, useRef, useState } from 'react';
import Toast from '../components/ui/Toast';

export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [message, setMessage] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((text, durationMs = 2200) => {
    setMessage(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMessage(null), durationMs);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast message={message} />
    </ToastContext.Provider>
  );
}
