import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function OtpLoginScreen({ navigation }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const [step, setStep] = useState('REQUEST');
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const isEmail = (value) => value.includes('@');

  const handleSendOtp = async () => {
    if (!contact) {
      setError('Email or phone is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setInfo('');
      const payload = isEmail(contact) ? { email: contact, otp_type: 'LOGIN' } : { phone: contact, otp_type: 'LOGIN' };
      await authAPI.sendOTP(payload);
      setStep('VERIFY');
      setInfo('OTP sent. Please check your messages.');
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

    try {
      setLoading(true);
      setError('');
      setInfo('');
      const payload = isEmail(contact) ? { email: contact, otp_code: otp } : { phone: contact, otp_code: otp };
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
    <View style={styles.container}>
      <Text style={styles.title}>OTP Login</Text>
      <Text style={styles.subtitle}>Enter your email or phone to receive an OTP.</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email or phone"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          keyboardType={isEmail(contact) ? 'email-address' : 'default'}
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
          <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Login</Text>}
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Back to login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 16,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  linkButton: {
    marginTop: 14,
    alignItems: 'center',
  },
  linkText: {
    color: '#0284c7',
    fontWeight: '600',
  },
  errorText: {
    color: '#dc2626',
    marginBottom: 10,
  },
  infoText: {
    color: '#0f172a',
    marginBottom: 10,
  },
});
