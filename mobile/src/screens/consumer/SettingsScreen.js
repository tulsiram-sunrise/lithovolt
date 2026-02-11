import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { NeonBackground } from '../../components/layout/NeonBackground';
import { neonTheme } from '../../styles/neonTheme';

export default function SettingsScreen({ navigation }) {
  const logout = useAuthStore((state) => state.logout);

  return (
    <NeonBackground style={styles.container} testID="consumer-settings">
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Profile')} testID="settings-profile">
        <Text style={styles.rowText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Claims')} testID="settings-claims">
        <Text style={styles.rowText}>My Claims</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.row, styles.dangerRow]} onPress={logout} testID="settings-logout">
        <Text style={[styles.rowText, styles.dangerText]}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Lithovolt Mobile</Text>
        <Text style={styles.footerText}>Version 1.0.0</Text>
      </View>
    </NeonBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: neonTheme.colors.text,
    fontFamily: neonTheme.fonts.heading,
    marginBottom: 16,
  },
  row: {
    backgroundColor: neonTheme.colors.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: neonTheme.colors.border,
  },
  rowText: {
    color: neonTheme.colors.text,
    fontWeight: '600',
    fontFamily: neonTheme.fonts.bodyStrong,
  },
  dangerRow: {
    borderColor: neonTheme.colors.danger,
    backgroundColor: '#2a1518',
  },
  dangerText: {
    color: neonTheme.colors.danger,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  footerText: {
    color: neonTheme.colors.muted,
    fontSize: 12,
  },
});
