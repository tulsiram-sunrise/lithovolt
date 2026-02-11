import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function WholesalerSettingsScreen({ navigation }) {
  const logout = useAuthStore((state) => state.logout);

  return (
    <View style={styles.container} testID="wholesaler-settings">
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('WholesalerProfile')}>
        <Text style={styles.rowText}>Account Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.row, styles.dangerRow]} onPress={logout}>
        <Text style={[styles.rowText, styles.dangerText]}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Lithovolt Mobile</Text>
        <Text style={styles.footerText}>Version 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f1f5f9',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  row: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  rowText: {
    color: '#0f172a',
    fontWeight: '600',
  },
  dangerRow: {
    borderColor: '#fecaca',
    backgroundColor: '#fff1f2',
  },
  dangerText: {
    color: '#dc2626',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 12,
  },
});
