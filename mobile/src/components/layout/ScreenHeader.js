/**
 * ScreenHeader.js
 * ------------------------------------------------------------------
 * The dark header bar used at the top of most screens: an optional
 * back button, a title/subtitle, and an optional right-side element.
 * Sits inside SafeAreaView so it clears the phone's status bar/notch.
 * ------------------------------------------------------------------
 */
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';

export default function ScreenHeader({ title, subtitle, showBack = true, rightAction }) {
  const navigation = useNavigation();
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.row}>
        <View style={styles.left}>
          {showBack && navigation.canGoBack() && (
            <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
              <Text style={styles.back}>←</Text>
            </Pressable>
          )}
          <View>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        {rightAction}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.charcoal },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: '#fff', fontSize: 18 },
  title: { color: '#fff', fontWeight: '800', fontSize: 12.5, letterSpacing: 0.5 },
  subtitle: { color: '#C7CCD4', fontSize: 9.5, marginTop: 1 },
});
