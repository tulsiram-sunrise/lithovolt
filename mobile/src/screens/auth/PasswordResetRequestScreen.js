import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { authAPI } from '../../services/api';
import { NeonBackground } from '../../components/layout/NeonBackground';
import { neonTheme } from '../../styles/neonTheme';

export default function PasswordResetRequestScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleRequest = async () => {
    if (!email) {
      setError('Email is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setInfo('');
      await authAPI.passwordResetRequest({ email });
      setInfo('OTP sent to your email.');
      navigation.navigate('PasswordResetConfirm', { email });
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to request password reset.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <NeonBackground style={styles.container} testID="password-reset-request">
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your email to receive an OTP.</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          testID="password-reset-email"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {info ? <Text style={styles.infoText}>{info}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleRequest} disabled={loading} testID="password-reset-submit">
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Back to login</Text>
        </TouchableOpacity>
      </View>
    </NeonBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: neonTheme.colors.text,
    fontFamily: neonTheme.fonts.heading,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: neonTheme.colors.muted,
    fontFamily: neonTheme.fonts.body,
    marginBottom: 16,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: neonTheme.colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: neonTheme.colors.border,
  },
  input: {
    backgroundColor: neonTheme.colors.surface,
    borderColor: neonTheme.colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: neonTheme.colors.text,
    fontFamily: neonTheme.fonts.body,
    marginBottom: 12,
  },
  button: {
    backgroundColor: neonTheme.colors.accent,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: neonTheme.colors.accentGlow,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  buttonText: {
    color: '#07110b',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: neonTheme.fonts.bodyStrong,
  },
  linkButton: {
    marginTop: 14,
    alignItems: 'center',
  },
  linkText: {
    color: neonTheme.colors.accent,
    fontWeight: '600',
    fontFamily: neonTheme.fonts.bodyStrong,
  },
  errorText: {
    color: neonTheme.colors.danger,
    marginBottom: 10,
  },
  infoText: {
    color: neonTheme.colors.text,
    marginBottom: 10,
  },
});
