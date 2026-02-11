import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ScanQRScreen from '../../src/screens/consumer/ScanQRScreen';
import { warrantyAPI } from '../../src/services/api';

jest.mock('../../src/services/api', () => ({
  warrantyAPI: {
    verifyWarranty: jest.fn(),
  },
}));

const navigate = jest.fn();
const navigation = { navigate };

let mockPermissionState = { granted: true };
const mockRequestPermission = jest.fn();

jest.mock('expo-camera', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    CameraView: ({ onBarCodeScanned, children }) => (
      <>
        <View testID="mock-camera" onBarCodeScanned={onBarCodeScanned} />
        {children}
      </>
    ),
    useCameraPermissions: () => [mockPermissionState, mockRequestPermission],
  };
});

describe('ScanQRScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPermissionState = { granted: true };
  });

  it('shows permission denied message when not granted', () => {
    mockPermissionState = { granted: false };
    const { getByText } = render(<ScanQRScreen navigation={navigation} />);
    expect(getByText('Camera permission denied.')).toBeTruthy();
  });

  it('navigates to warranty details after scan', async () => {
    warrantyAPI.verifyWarranty.mockResolvedValue({ data: { id: 9 } });

    const { getByTestId } = render(<ScanQRScreen navigation={navigation} />);

    fireEvent(getByTestId('mock-camera'), 'onBarCodeScanned', { data: 'LV-TEST-123' });

    await waitFor(() => {
      expect(warrantyAPI.verifyWarranty).toHaveBeenCalledWith('LV-TEST-123');
      expect(navigate).toHaveBeenCalledWith('WarrantyDetails', { warranty: { id: 9 } });
    });
  });
});
