import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import useAuth from '../../hooks/useAuth';
import { colors } from '../../theme/colors';

export default function LoginForm({ onSuccess }) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    try {
      await login(email, password);
      onSuccess?.();
    } catch (err) {
      Alert.alert('Authentication Failed', err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Text style={{ fontSize: 30, color: '#fff' }}>✓</Text>
      </View>
      <Text style={styles.title}>GET <Text style={{ color: colors.orange }}>HANDYMAN</Text></Text>
      <Text style={styles.subtitle}>WORKER APP</Text>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#9CA6B5"
          placeholder="worker@gethandyman.app"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#9CA6B5"
          placeholder="••••••••"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log in</Text>}
      </TouchableOpacity>
      
      <Text style={styles.forgotText}>Forgot Password?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.charcoal, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26 },
  iconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { color: '#fff', fontWeight: '800', fontSize: 17, letterSpacing: 0.5 },
  subtitle: { color: '#C7CCD4', fontSize: 9.5, letterSpacing: 2, marginTop: 2, marginBottom: 26 },
  inputWrapper: { width: '100%' },
  label: { fontSize: 10, fontWeight: '700', color: '#9CA6B5', textTransform: 'uppercase', marginBottom: 4 },
  input: { backgroundColor: colors.charcoal2, borderRadius: 8, paddingVertical: 11, paddingHorizontal: 12, color: '#fff', fontSize: 13, marginBottom: 14 },
  button: { backgroundColor: colors.orange, width: '100%', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 6 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  forgotText: { color: colors.orange, fontSize: 11.5, marginTop: 14 },
});