import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { NeonScroll } from '../../components/layout/NeonBackground';
import { neonTheme } from '../../styles/neonTheme';

export default function ClaimDetailsScreen({ navigation, route }) {
  const claim = route.params?.claim;

  if (!claim) {
    return (
      <NeonScroll contentContainerStyle={styles.centered}>
        <Text style={styles.errorText}>No claim data available.</Text>
      </NeonScroll>
    );
  }

  return (
    <NeonScroll contentContainerStyle={styles.container} testID="claim-details">
      <Text style={styles.title}>Claim Details</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Claim ID</Text>
        <Text style={styles.value}>#{claim.id}</Text>

        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>{claim.status}</Text>

        {claim.warranty_number ? (
          <>
            <Text style={styles.label}>Warranty Number</Text>
            <Text style={styles.value}>{claim.warranty_number}</Text>
          </>
        ) : null}

        {claim.warranty_serial || claim.serial || claim.serial_number ? (
          <>
            <Text style={styles.label}>Serial</Text>
            <Text style={styles.value}>{claim.warranty_serial || claim.serial || claim.serial_number}</Text>
          </>
        ) : null}

        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>{claim.description || 'N/A'}</Text>

        {claim.created_at ? (
          <>
            <Text style={styles.label}>Created</Text>
            <Text style={styles.value}>{formatDate(claim.created_at)}</Text>
          </>
        ) : null}

        {Array.isArray(claim.attachments) && claim.attachments.length > 0 ? (
          <>
            <Text style={styles.label}>Attachments</Text>
            <View style={styles.attachmentRow}>
              {claim.attachments.map((attachment) => (
                <TouchableOpacity
                  key={attachment.id}
                  style={styles.attachmentCard}
                  onPress={() => navigation.navigate('AttachmentViewer', { attachment })}
                >
                  {attachment.file ? (
                    <Image source={{ uri: attachment.file }} style={styles.attachmentPreview} />
                  ) : (
                    <View style={styles.attachmentPlaceholder} />
                  )}
                  <Text style={styles.attachmentLink}>Open</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : null}
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()} testID="claim-back">
        <Text style={styles.buttonText}>Back to Claims</Text>
      </TouchableOpacity>
    </NeonScroll>
  );
}

const formatDate = (value) => {
  if (!value) {
    return 'N/A';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString();
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: neonTheme.colors.text,
    fontFamily: neonTheme.fonts.heading,
    marginBottom: 16,
  },
  card: {
    backgroundColor: neonTheme.colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: neonTheme.colors.border,
  },
  label: {
    fontSize: 12,
    color: neonTheme.colors.muted,
    fontFamily: neonTheme.fonts.body,
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    color: neonTheme.colors.text,
    fontWeight: '600',
    fontFamily: neonTheme.fonts.bodyStrong,
  },
  button: {
    backgroundColor: neonTheme.colors.accent,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f1f5f9',
  },
  errorText: {
    color: '#dc2626',
  },
  attachmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  attachmentCard: {
    width: 110,
    marginRight: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: neonTheme.colors.border,
    borderRadius: 10,
    padding: 6,
    backgroundColor: neonTheme.colors.surface,
  },
  attachmentPreview: {
    width: 96,
    height: 96,
    borderRadius: 8,
    marginBottom: 6,
  },
  attachmentPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 8,
    backgroundColor: neonTheme.colors.surfaceAlt,
    marginBottom: 6,
  },
  attachmentLink: {
    fontSize: 12,
    color: neonTheme.colors.accent,
    fontWeight: '600',
  },
});
