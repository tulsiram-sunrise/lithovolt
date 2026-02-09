import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { ordersAPI, warrantyAPI } from '../../services/api';

export default function IssueWarrantyScreen({ navigation, route }) {
  const orderId = route.params?.orderId;
  const [form, setForm] = useState({
    serial_number: '',
    consumer_email: '',
    consumer_phone: '',
    consumer_first_name: '',
    consumer_last_name: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const loadOrder = async () => {
    if (!orderId) {
      return;
    }
    try {
      const response = await ordersAPI.getOrder(orderId);
      const order = response.data;
      setForm((prev) => ({
        ...prev,
        consumer_email: order?.consumer_email || prev.consumer_email,
        consumer_phone: order?.consumer_phone || prev.consumer_phone,
        consumer_first_name: order?.consumer_first_name
          || order?.consumer_name?.split(' ')[0]
          || prev.consumer_first_name,
        consumer_last_name: order?.consumer_last_name
          || order?.consumer_name?.split(' ').slice(1).join(' ')
          || prev.consumer_last_name,
      }));
    } catch (err) {
      setError('Unable to load order details.');
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const handleIssue = async () => {
    if (!form.serial_number) {
      setError('Serial number is required.');
      return;
    }
    if (!form.consumer_email && !form.consumer_phone) {
      setError('Consumer email or phone is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setInfo('');
      const response = await warrantyAPI.issueWarranty(form);
      setInfo('Warranty issued successfully.');
      navigation.navigate('WarrantyDetails', { warranty: response.data });
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.detail || 'Unable to issue warranty.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Issue Warranty</Text>
      <Text style={styles.subtitle}>Enter serial number and consumer details.</Text>

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
          placeholder="Consumer email"
          placeholderTextColor="#94a3b8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.consumer_email}
          onChangeText={(value) => updateField('consumer_email', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Consumer phone"
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
        <TextInput
          style={styles.input}
          placeholder="Notes"
          placeholderTextColor="#94a3b8"
          value={form.notes}
          onChangeText={(value) => updateField('notes', value)}
        />

        {loading ? <ActivityIndicator color="#0284c7" /> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {info ? <Text style={styles.infoText}>{info}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleIssue} disabled={loading}>
          <Text style={styles.buttonText}>Issue Warranty</Text>
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
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
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
