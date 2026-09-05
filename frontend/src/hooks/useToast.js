/**
 * useToast.js
 * ------------------------------------------------------------------
 */
import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext.jsx';

export default function useToast() {
  return useContext(ToastContext);
}
