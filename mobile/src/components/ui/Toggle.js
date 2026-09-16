/**
 * Toggle.js
 * ------------------------------------------------------------------
 * An on/off switch (used for "Include GST" etc). Thin wrapper around
 * React Native's built-in Switch so the rest of the app doesn't
 * import from 'react-native' directly for this.
 * ------------------------------------------------------------------
 */
import { Switch } from 'react-native';
import { colors } from '../../theme/colors';

export default function Toggle({ on, onToggle }) {
  return (
    <Switch
      value={on}
      onValueChange={onToggle}
      trackColor={{ false: colors.grayLight, true: colors.green }}
      thumbColor="#fff"
    />
  );
}
