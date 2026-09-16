import React from 'react';
import { View, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoginForm from '../components/auth/LoginForm';
import { colors } from '../theme/colors';

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.content}>
          <LoginForm />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.charcoal },
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: 'center' },
});