import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';

export default function ClaimDetailsScreen({ navigation, route }) {
  const claim = route.params?.claim;

  if (!claim) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No claim data available.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
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

      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back to Claims</Text>
      </TouchableOpacity>
    </ScrollView>
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
    backgroundColor: '#f1f5f9',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
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
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 6,
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#e2e8f0',
    marginBottom: 6,
  },
  attachmentLink: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '600',
  },
});
