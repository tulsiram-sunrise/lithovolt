import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { userAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function WholesalerProfileScreen({ navigation }) {
  const authUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
    gst_number: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userAPI.getMe();
      const data = response.data || {};
      setForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        company_name: data.company_name || '',
        gst_number: data.gst_number || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || '',
      });
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      setForm((prev) => ({
        ...prev,
        first_name: authUser.first_name || '',
        last_name: authUser.last_name || '',
        email: authUser.email || '',
        phone: authUser.phone || '',
      }));
    }
    loadProfile();
  }, []);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setInfo('');
      const response = await userAPI.updateProfile(form);
      setUser(response.data);
      setInfo('Profile updated successfully.');
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to update profile.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} testID="wholesaler-profile">
      <Text style={styles.title}>Account Settings</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="First name"
          placeholderTextColor="#94a3b8"
          value={form.first_name}
          onChangeText={(value) => updateField('first_name', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Last name"
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
          placeholder="Phone"
          placeholderTextColor="#94a3b8"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(value) => updateField('phone', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Company name"
          placeholderTextColor="#94a3b8"
          value={form.company_name}
          onChangeText={(value) => updateField('company_name', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="GST number"
          placeholderTextColor="#94a3b8"
          value={form.gst_number}
          onChangeText={(value) => updateField('gst_number', value)}
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
          keyboardType="number-pad"
          value={form.pincode}
          onChangeText={(value) => updateField('pincode', value)}
        />

        {loading ? <ActivityIndicator color="#0284c7" /> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {info ? <Text style={styles.infoText}>{info}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
          <Text style={styles.buttonText}>Save Changes</Text>
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
