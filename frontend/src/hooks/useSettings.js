/**
 * useSettings.js
 * ------------------------------------------------------------------
 */
import { useContext } from 'react';
import { SettingsContext } from '../context/SettingsContext.jsx';

export default function useSettings() {
  return useContext(SettingsContext);
}
