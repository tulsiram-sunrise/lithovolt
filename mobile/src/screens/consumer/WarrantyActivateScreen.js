import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { warrantyAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { NeonScroll } from '../../components/layout/NeonBackground';
import { neonTheme } from '../../styles/neonTheme';

export default function WarrantyActivateScreen({ navigation, route }) {
  const user = useAuthStore((state) => state.user);
  const [form, setForm] = useState({
    serial_number: '',
    consumer_email: user?.email || '',
    consumer_phone: user?.phone || '',
    consumer_first_name: user?.first_name || '',
    consumer_last_name: user?.last_name || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (route.params?.serial_number) {
      setForm((prev) => ({
        ...prev,
        serial_number: route.params.serial_number,
      }));
    }
  }, [route.params?.serial_number]);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleActivate = async () => {
    if (!form.serial_number) {
      setError('Serial number is required.');
      return;
    }
    if (!form.consumer_email && !form.consumer_phone) {
      setError('Email or phone is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setInfo('');
      const response = await warrantyAPI.activateWarranty(form);
      setInfo('Warranty activated.');
      navigation.navigate('WarrantyDetails', { warranty: response.data });
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.detail || 'Activation failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <NeonScroll contentContainerStyle={styles.container} testID="warranty-activate">
      <Text style={styles.title}>Activate Warranty</Text>
      <Text style={styles.subtitle}>Enter serial number and your contact details.</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Serial number"
          placeholderTextColor="#94a3b8"
          value={form.serial_number}
          onChangeText={(value) => updateField('serial_number', value)}
          testID="activate-serial"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.consumer_email}
          onChangeText={(value) => updateField('consumer_email', value)}
          testID="activate-email"
        />
        <TextInput
          style={styles.input}
          placeholder="Phone"
          placeholderTextColor="#94a3b8"
          keyboardType="phone-pad"
          value={form.consumer_phone}
          onChangeText={(value) => updateField('consumer_phone', value)}
          testID="activate-phone"
        />
        <TextInput
          style={styles.input}
          placeholder="First name"
          placeholderTextColor="#94a3b8"
          value={form.consumer_first_name}
          onChangeText={(value) => updateField('consumer_first_name', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Last name"
          placeholderTextColor="#94a3b8"
          value={form.consumer_last_name}
          onChangeText={(value) => updateField('consumer_last_name', value)}
        />

        {loading ? <ActivityIndicator color="#0284c7" /> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {info ? <Text style={styles.infoText}>{info}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleActivate} disabled={loading} testID="activate-submit">
          <Text style={styles.buttonText}>Activate</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Back</Text>
        </TouchableOpacity>
      </View>
    </NeonScroll>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
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
  },
  form: {
    backgroundColor: neonTheme.colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: neonTheme.colors.border,
  },
  input: {
    backgroundColor: neonTheme.colors.surface,
    borderColor: neonTheme.colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: neonTheme.colors.text,
    fontFamily: neonTheme.fonts.body,
    marginBottom: 12,
  },
  button: {
    backgroundColor: neonTheme.colors.accent,
    paddingVertical: 12,
    borderRadius: 12,
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
    marginTop: 12,
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
