/**
 * Card.js
 * ------------------------------------------------------------------
 * A bordered, rounded container. `onPress` makes it act like a
 * tappable list row (used for enquiry/job/invoice rows).
 * ------------------------------------------------------------------
 */
import { View, Pressable, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default function Card({ children, onPress, style }) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper onPress={onPress} style={[styles.card, style]}>
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.grayLight,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
});
