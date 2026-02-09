import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { warrantyAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Activate Warranty</Text>
      <Text style={styles.subtitle}>Enter serial number and your contact details.</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Serial number"
          placeholderTextColor="#94a3b8"
          value={form.serial_number}
          onChangeText={(value) => updateField('serial_number', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.consumer_email}
          onChangeText={(value) => updateField('consumer_email', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone"
          placeholderTextColor="#94a3b8"
          keyboardType="phone-pad"
          value={form.consumer_phone}
          onChangeText={(value) => updateField('consumer_phone', value)}
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

        <TouchableOpacity style={styles.button} onPress={handleActivate} disabled={loading}>
          <Text style={styles.buttonText}>Activate</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f1f5f9',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 16,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  linkButton: {
    marginTop: 12,
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
