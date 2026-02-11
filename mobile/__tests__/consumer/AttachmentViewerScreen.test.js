import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AttachmentViewerScreen from '../../src/screens/consumer/AttachmentViewerScreen';

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://',
  downloadAsync: jest.fn(() => Promise.resolve({ uri: 'file://file.jpg' })),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));

const navigation = { goBack: jest.fn() };

describe('AttachmentViewerScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows error when attachment missing', () => {
    const { getByText } = render(
      <AttachmentViewerScreen navigation={navigation} route={{ params: {} }} />
    );

    expect(getByText('Attachment not available.')).toBeTruthy();
  });

  it('downloads and shares attachment', async () => {
    const route = { params: { attachment: { id: 1, file: 'https://example.com/a.jpg' } } };
    const { getByTestId } = render(
      <AttachmentViewerScreen navigation={navigation} route={route} />
    );

    fireEvent.press(getByTestId('attachment-download'));

    const FileSystem = require('expo-file-system');
    const Sharing = require('expo-sharing');

    await waitFor(() => {
      expect(FileSystem.downloadAsync).toHaveBeenCalled();
      expect(Sharing.shareAsync).toHaveBeenCalled();
    });
  });
});
