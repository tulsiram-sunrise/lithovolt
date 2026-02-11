import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { NeonBackground } from '../../components/layout/NeonBackground';
import { neonTheme } from '../../styles/neonTheme';

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
      <NeonBackground style={styles.centered}>
        <Text style={styles.errorText}>Attachment not available.</Text>
      </NeonBackground>
    );
  }

  return (
    <NeonBackground style={styles.container} testID="attachment-viewer">
      {isImage ? (
        <Image source={{ uri: attachment.file }} style={styles.image} resizeMode="contain" />
      ) : (
        <View style={styles.filePlaceholder}>
          <Text style={styles.fileText}>Attachment file</Text>
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleDownload} disabled={downloading} testID="attachment-download">
        {downloading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Download</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()} testID="attachment-back">
        <Text style={styles.linkText}>Back</Text>
      </TouchableOpacity>
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
  image: {
    width: '100%',
    height: '70%',
    marginBottom: 20,
    backgroundColor: neonTheme.colors.surface,
  },
  filePlaceholder: {
    width: '100%',
    height: 200,
    borderWidth: 1,
    borderColor: neonTheme.colors.border,
    borderRadius: 12,
    backgroundColor: neonTheme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  fileText: {
    color: neonTheme.colors.muted,
    fontFamily: neonTheme.fonts.body,
  },
  button: {
    shadowColor: neonTheme.colors.accentGlow,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    backgroundColor: neonTheme.colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#07110b',
    fontWeight: '600',
    fontFamily: neonTheme.fonts.bodyStrong,
  },
  linkButton: {
    marginTop: 4,
  },
  linkText: {
    color: neonTheme.colors.muted,
    fontFamily: neonTheme.fonts.body,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: neonTheme.colors.danger,
    fontFamily: neonTheme.fonts.bodyStrong,
  },
});
