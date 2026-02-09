import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function AttachmentViewerScreen({ navigation, route }) {
  const attachment = route.params?.attachment;
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const isImage = attachment?.file ? attachment.file.match(/\.(png|jpe?g|webp)$/i) : false;

  const handleDownload = async () => {
    if (!attachment?.file) {
      return;
    }

    try {
      setDownloading(true);
      setError('');
      const fileName = attachment.file.split('/').pop() || `attachment-${attachment.id || 'file'}`;
      const target = `${FileSystem.documentDirectory}${fileName}`;
      const result = await FileSystem.downloadAsync(attachment.file, target);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri);
      }
    } catch (err) {
      setError('Unable to download attachment.');
    } finally {
      setDownloading(false);
    }
  };

  if (!attachment?.file) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Attachment not available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isImage ? (
        <Image source={{ uri: attachment.file }} style={styles.image} resizeMode="contain" />
      ) : (
        <View style={styles.filePlaceholder}>
          <Text style={styles.fileText}>Attachment file</Text>
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleDownload} disabled={downloading}>
        {downloading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Download</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
        <Text style={styles.linkText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: '100%',
    height: '70%',
    marginBottom: 20,
  },
  filePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  fileText: {
    color: '#e2e8f0',
  },
  button: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 4,
  },
  linkText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  errorText: {
    color: '#fca5a5',
  },
});
