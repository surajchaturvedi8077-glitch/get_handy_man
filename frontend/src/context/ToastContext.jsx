/**
 * ToastContext.jsx
 * ------------------------------------------------------------------
 * App-wide toast/snackbar. Call showToast('Job deleted') from any
 * component (via the useToast() hook) instead of managing local
 * toast state everywhere, matching the prototype's toast() helper.
 * ------------------------------------------------------------------
 */
import { createContext, useCallback, useState } from 'react';
import Toast from '../components/ui/Toast.jsx';

export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [message, setMessage] = useState(null);

  const showToast = useCallback((text, durationMs = 2200) => {
    setMessage(text);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setMessage(null), durationMs);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast message={message} />
    </ToastContext.Provider>
  );
}
