import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { NeonBackground } from '../../components/layout/NeonBackground';
import { neonTheme } from '../../styles/neonTheme';

export default function OtpLoginScreen({ navigation }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const [step, setStep] = useState('REQUEST');
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSendOtp = async () => {
    if (!contact) {
      setError('Phone number is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setInfo('');
      const payload = { phone: contact.trim() };
      await authAPI.sendOTP(payload);
      setStep('VERIFY');
      setInfo('OTP sent to your phone.');
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to send OTP.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('Enter the OTP code.');
      return;
    }

    if (otp.trim().length !== 6) {
      setError('OTP must be 6 digits.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setInfo('');
      const payload = { phone: contact.trim(), otp: otp.trim() };
      const response = await authAPI.verifyOTP(payload);
      const { access, refresh, user } = response.data;
      setAuth(user, access, refresh);
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.detail || 'Invalid OTP. Try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <NeonBackground style={styles.container}>
      <Text style={styles.title}>OTP Login</Text>
      <Text style={styles.subtitle}>Enter your phone number to receive an OTP.</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Phone number"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          keyboardType="phone-pad"
          value={contact}
          onChangeText={setContact}
          editable={step === 'REQUEST'}
        />

        {step === 'VERIFY' && (
          <TextInput
            style={styles.input}
            placeholder="OTP code"
            placeholderTextColor="#94a3b8"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {info ? <Text style={styles.infoText}>{info}</Text> : null}

        {step === 'REQUEST' ? (
          <TouchableOpacity style={styles.button} onPress={handleSendOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Login</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={handleSendOtp}
              disabled={loading}
            >
              <Text style={styles.linkText}>Resend OTP</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => {
                setStep('REQUEST');
                setOtp('');
                setError('');
                setInfo('');
              }}
              disabled={loading}
            >
              <Text style={styles.linkText}>Change phone number</Text>
            </TouchableOpacity>
          </>
        )}

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
