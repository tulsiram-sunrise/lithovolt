import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { NeonScroll } from '../../components/layout/NeonBackground';
import { neonTheme } from '../../styles/neonTheme';
import { userAPI } from '../../services/api';

export default function WholesalerRegisterScreen() {
  const [form, setForm] = useState({
    business_name: '',
    registration_number: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contact_phone: '',
    contact_email: '',
  });
  const [document, setDocument] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const loadApplication = async () => {
    try {
      const response = await userAPI.getWholesalerApplication();
      const app = response.data;
      setStatus(app.status || '');
    } catch (err) {
      setStatus('');
    }
  };

  useEffect(() => {
    loadApplication();
  }, []);

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) {
      return;
    }

    const file = result.assets?.[0];
    if (file) {
      setDocument(file);
    }
  };

  const handleSubmit = async () => {
    if (!form.business_name || !form.registration_number || !form.address) {
      setError('Please fill business name, registration number, and address.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) {
          payload.append(key, value);
        }
      });

      if (document?.uri) {
        payload.append('document', {
          uri: document.uri,
          name: document.name || 'wholesaler-doc',
          type: document.mimeType || 'application/octet-stream',
        });
      }

      await userAPI.submitWholesalerApplication(payload);
      setSuccess('Application submitted. We will review and get back to you.');
      await loadApplication();
    } catch (err) {
      const message = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Unable to submit application.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = () => {
    if (!status) {
      return null;
    }
    if (status === 'PENDING') {
      return <Text style={styles.statusPending}>Status: Pending review</Text>;
    }
    if (status === 'APPROVED') {
      return <Text style={styles.statusApproved}>Status: Approved</Text>;
    }
    if (status === 'REJECTED') {
      return <Text style={styles.statusRejected}>Status: Rejected (you can reapply)</Text>;
    }
    return null;
  };

  return (
    <NeonScroll contentContainerStyle={styles.container} testID="wholesaler-register">
      <Text style={styles.title}>Register as Wholesaler</Text>
      <Text style={styles.subtitle}>Submit your business details for approval.</Text>

      {renderStatus()}

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Business name"
          placeholderTextColor="#94a3b8"
          value={form.business_name}
          onChangeText={(value) => updateField('business_name', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Registration number (ABN/GST)"
          placeholderTextColor="#94a3b8"
          value={form.registration_number}
          onChangeText={(value) => updateField('registration_number', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          placeholderTextColor="#94a3b8"
          value={form.address}
          onChangeText={(value) => updateField('address', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="City"
          placeholderTextColor="#94a3b8"
          value={form.city}
          onChangeText={(value) => updateField('city', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="State"
          placeholderTextColor="#94a3b8"
          value={form.state}
          onChangeText={(value) => updateField('state', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Pincode"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          value={form.pincode}
          onChangeText={(value) => updateField('pincode', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Contact phone"
          placeholderTextColor="#94a3b8"
          keyboardType="phone-pad"
          value={form.contact_phone}
          onChangeText={(value) => updateField('contact_phone', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Contact email"
          placeholderTextColor="#94a3b8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.contact_email}
          onChangeText={(value) => updateField('contact_email', value)}
        />

        <TouchableOpacity style={styles.secondaryButton} onPress={pickDocument}>
          <Text style={styles.secondaryButtonText}>
            {document?.name ? `Document: ${document.name}` : 'Upload document'}
          </Text>
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? <Text style={styles.successText}>{success}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#07110b" /> : <Text style={styles.buttonText}>Submit Application</Text>}
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
    color: neonTheme.colors.muted,
    fontFamily: neonTheme.fonts.body,
    marginBottom: 12,
  },
  statusPending: {
    color: neonTheme.colors.muted,
    fontFamily: neonTheme.fonts.bodyStrong,
    marginBottom: 12,
  },
  statusApproved: {
    color: neonTheme.colors.accent,
    fontFamily: neonTheme.fonts.bodyStrong,
    marginBottom: 12,
  },
  statusRejected: {
    color: neonTheme.colors.danger,
    fontFamily: neonTheme.fonts.bodyStrong,
    marginBottom: 12,
  },
  card: {
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
    fontFamily: neonTheme.fonts.bodyStrong,
  },
  secondaryButton: {
    backgroundColor: neonTheme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: neonTheme.colors.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: neonTheme.colors.text,
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
