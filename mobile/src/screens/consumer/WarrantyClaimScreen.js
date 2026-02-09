import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { warrantyAPI } from '../../services/api';

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
      <View style={styles.centered}>
        <Text style={styles.errorText}>No warranty selected.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        />

        <View style={styles.attachmentRow}>
          <TouchableOpacity style={[styles.secondaryButton, styles.secondaryButtonLeft]} onPress={pickFromLibrary}>
            <Text style={styles.secondaryButtonText}>Add from library</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={takePhoto}>
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

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit Claim</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
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
    backgroundColor: '#e2e8f0',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonLeft: {
    marginRight: 8,
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontWeight: '600',
    fontSize: 12,
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
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  linkButton: {
    marginTop: 14,
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f1f5f9',
  },
});
