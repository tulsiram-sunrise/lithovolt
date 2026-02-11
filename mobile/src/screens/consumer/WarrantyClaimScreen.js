import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { warrantyAPI } from '../../services/api';
import { NeonBackground } from '../../components/layout/NeonBackground';
import { neonTheme } from '../../styles/neonTheme';

export default function WarrantyClaimScreen({ navigation, route }) {
  const warranty = route.params?.warranty;
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const addAttachment = (asset) => {
    if (!asset?.uri) {
      return;
    }
    setAttachments((prev) => [...prev, asset]);
  };

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.7,
    });

    if (!result.canceled) {
      addAttachment(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError('Camera permission is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });

    if (!result.canceled) {
      addAttachment(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!description) {
      setError('Please provide a short description of the issue.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setInfo('');
      const payload = new FormData();
      payload.append('description', description);
      if (warranty?.warranty_number) {
        payload.append('warranty_number', warranty.warranty_number);
      } else if (warranty?.serial || warranty?.serial_number) {
        payload.append('serial_number', warranty.serial || warranty.serial_number);
      }

      attachments.forEach((asset, index) => {
        payload.append('attachments', {
          uri: asset.uri,
          name: asset.fileName || `attachment-${index + 1}.jpg`,
          type: asset.mimeType || 'image/jpeg',
        });
      });

      await warrantyAPI.createClaim(payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setInfo('Claim submitted successfully.');
      navigation.navigate('Home');
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.detail || 'Failed to submit claim.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!warranty) {
    return (
      <NeonBackground style={styles.centered}>
        <Text style={styles.errorText}>No warranty selected.</Text>
      </NeonBackground>
    );
  }

  return (
    <NeonBackground style={styles.container} testID="warranty-claim">
      <Text style={styles.title}>Warranty Claim</Text>
      <Text style={styles.subtitle}>Serial: {warranty.serial || warranty.serial_number}</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Describe the issue</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Example: Battery not holding charge"
          placeholderTextColor="#94a3b8"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          testID="claim-description"
        />

        <View style={styles.attachmentRow}>
          <TouchableOpacity style={[styles.secondaryButton, styles.secondaryButtonLeft]} onPress={pickFromLibrary} testID="claim-add-library">
            <Text style={styles.secondaryButtonText}>Add from library</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={takePhoto} testID="claim-add-camera">
            <Text style={styles.secondaryButtonText}>Take photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.previewRow}>
          {attachments.map((asset, index) => (
            <Image key={`${asset.uri}-${index}`} source={{ uri: asset.uri }} style={styles.preview} />
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {info ? <Text style={styles.infoText}>{info}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading} testID="claim-submit">
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit Claim</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Back</Text>
        </TouchableOpacity>
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
    textAlign: 'center',
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: neonTheme.colors.text,
    fontFamily: neonTheme.fonts.bodyStrong,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: neonTheme.colors.surface,
    borderColor: neonTheme.colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: neonTheme.colors.text,
    fontFamily: neonTheme.fonts.body,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  attachmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: neonTheme.colors.surface,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: neonTheme.colors.border,
  },
  secondaryButtonLeft: {
    marginRight: 8,
  },
  secondaryButtonText: {
    color: neonTheme.colors.text,
    fontWeight: '600',
    fontSize: 12,
    fontFamily: neonTheme.fonts.bodyStrong,
  },
  previewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  preview: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  button: {
    backgroundColor: neonTheme.colors.accent,
    paddingVertical: 12,
    borderRadius: 10,
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
    marginTop: 14,
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
