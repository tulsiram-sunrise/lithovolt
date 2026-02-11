import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { authAPI } from '../../services/api';
import { NeonBackground } from '../../components/layout/NeonBackground';
import { neonTheme } from '../../styles/neonTheme';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.password_confirm) {
      setError('Email and password are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await authAPI.register(form);
      setSuccess('Account created. You can now login.');
      setTimeout(() => navigation.navigate('Login'), 600);
    } catch (err) {
      const message = err.response?.data?.detail || 'Registration failed. Please check the form.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <NeonBackground style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#94a3b8"
          value={form.first_name}
          onChangeText={(value) => updateField('first_name', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#94a3b8"
          value={form.last_name}
          onChangeText={(value) => updateField('last_name', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(value) => updateField('email', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone (optional)"
          placeholderTextColor="#94a3b8"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(value) => updateField('phone', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={form.password}
          onChangeText={(value) => updateField('password', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={form.password_confirm}
          onChangeText={(value) => updateField('password_confirm', value)}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? <Text style={styles.successText}>{success}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
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
    fontWeight: 'bold',
    color: neonTheme.colors.text,
    fontFamily: neonTheme.fonts.heading,
    marginBottom: 16,
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
  successText: {
    color: neonTheme.colors.accent,
    marginBottom: 10,
  },
});
