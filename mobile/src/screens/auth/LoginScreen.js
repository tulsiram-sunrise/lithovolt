import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { NeonBackground } from '../../components/layout/NeonBackground';
import { neonTheme } from '../../styles/neonTheme';

export default function LoginScreen({ navigation }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await authAPI.login({ email, password });
      const { access, refresh, user } = response.data;
      setAuth(user, access, refresh);
    } catch (err) {
      const message = err.response?.data?.detail || 'Login failed. Check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <NeonBackground style={styles.container} testID="login-screen">
      <View style={styles.screen}>
        <View style={styles.logoWrap}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.subtitle}>Battery Management Platform</Text>
          </View>
        </View>

        <View style={styles.formWrap}>
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              testID="login-email"
            />
            <View style={styles.passwordField}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                testID="login-password"
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword((prev) => !prev)}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <Text style={styles.passwordToggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading} testID="login-submit">
              {loading ? <ActivityIndicator color="#0284c7" /> : <Text style={styles.buttonText}>Login</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('OtpLogin')}
            >
              <Text style={styles.linkText}>Login with OTP</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('PasswordResetRequest')}
            >
              <Text style={styles.linkText}>Forgot password?</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.outlineButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  screen: {
    flex: 1,
    width: '100%',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: neonTheme.colors.muted,
    fontFamily: neonTheme.fonts.bodyStrong,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  logoWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formWrap: {
    flex: 4,
    alignItems: 'center',
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
  passwordField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: neonTheme.colors.surface,
    borderColor: neonTheme.colors.border,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: neonTheme.colors.text,
    fontFamily: neonTheme.fonts.body,
  },
  passwordToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  passwordToggleText: {
    color: neonTheme.colors.accent,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: neonTheme.fonts.bodyStrong,
  },
  errorText: {
    color: neonTheme.colors.danger,
    marginBottom: 12,
  },
  button: {
    backgroundColor: neonTheme.colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: neonTheme.colors.accentGlow,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  buttonText: {
    color: '#07110b',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: neonTheme.fonts.bodyStrong,
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: neonTheme.colors.accent,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: neonTheme.fonts.bodyStrong,
  },
  divider: {
    height: 1,
    backgroundColor: neonTheme.colors.border,
    marginVertical: 16,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: neonTheme.colors.accent,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: neonTheme.colors.accent,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: neonTheme.fonts.bodyStrong,
  },
  logo: {
    width: 200,
    height: 80,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
