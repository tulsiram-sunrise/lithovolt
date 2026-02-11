import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import WarrantyClaimScreen from '../../src/screens/consumer/WarrantyClaimScreen';
import { warrantyAPI } from '../../src/services/api';

jest.mock('../../src/services/api', () => ({
  warrantyAPI: {
    createClaim: jest.fn(),
  },
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: true })),
  launchCameraAsync: jest.fn(() => Promise.resolve({ canceled: true })),
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  MediaTypeOptions: { Images: 'Images' },
}));

const navigation = { navigate: jest.fn(), goBack: jest.fn() };

const route = {
  params: {
    warranty: { serial: 'LV-300', warranty_number: 'WN-300' },
  },
};

describe('WarrantyClaimScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires description before submit', () => {
    const { getByTestId, getByText } = render(
      <WarrantyClaimScreen navigation={navigation} route={route} />
    );

    fireEvent.press(getByTestId('claim-submit'));

    expect(getByText('Please provide a short description of the issue.')).toBeTruthy();
  });

  it('submits claim and navigates home', async () => {
    warrantyAPI.createClaim.mockResolvedValue({});

    const { getByTestId } = render(
      <WarrantyClaimScreen navigation={navigation} route={route} />
    );

    fireEvent.changeText(getByTestId('claim-description'), 'Battery issue');
    fireEvent.press(getByTestId('claim-submit'));

    await waitFor(() => {
      expect(warrantyAPI.createClaim).toHaveBeenCalled();
      expect(navigation.navigate).toHaveBeenCalledWith('Home');
    });
  });
});
