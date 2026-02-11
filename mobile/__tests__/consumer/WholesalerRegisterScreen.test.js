import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import WholesalerRegisterScreen from '../../src/screens/consumer/WholesalerRegisterScreen';
import { userAPI } from '../../src/services/api';

jest.mock('../../src/services/api', () => ({
  userAPI: {
    getWholesalerApplication: jest.fn(),
    submitWholesalerApplication: jest.fn(),
  },
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(() => Promise.resolve({ canceled: true })),
}));

describe('WholesalerRegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userAPI.getWholesalerApplication.mockRejectedValue(new Error('none'));
  });

  it('submits wholesaler application', async () => {
    userAPI.submitWholesalerApplication.mockResolvedValue({ data: { id: 1 } });

    const { getByPlaceholderText, getByText } = render(<WholesalerRegisterScreen />);

    fireEvent.changeText(getByPlaceholderText('Business name'), 'Demo Wholesales');
    fireEvent.changeText(getByPlaceholderText('Registration number (ABN/GST)'), 'GST-123');
    fireEvent.changeText(getByPlaceholderText('Address'), '123 Market Road');

    fireEvent.press(getByText('Submit Application'));

    await waitFor(() => {
      expect(userAPI.submitWholesalerApplication).toHaveBeenCalled();
    });
  });
});
