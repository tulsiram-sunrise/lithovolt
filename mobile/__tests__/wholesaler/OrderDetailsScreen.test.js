import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import OrderDetailsScreen from '../../src/screens/wholesaler/OrderDetailsScreen';
import { ordersAPI } from '../../src/services/api';

jest.mock('../../src/services/api', () => ({
  ordersAPI: {
    getOrder: jest.fn(),
    getOrderItems: jest.fn(),
  },
}));

jest.mock('../../src/store/authStore', () => ({
  useAuthStore: jest.fn((selector) => selector({ token: 'token' })),
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://',
  downloadAsync: jest.fn(() => Promise.resolve({ uri: 'file://invoice.pdf' })),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(false)),
  shareAsync: jest.fn(),
}));

const navigation = { navigate: jest.fn(), goBack: jest.fn() };

const route = { params: { orderId: 12 } };

describe('OrderDetailsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('downloads invoice', async () => {
    ordersAPI.getOrder.mockResolvedValue({ data: { id: 12, status: 'PENDING' } });
    ordersAPI.getOrderItems.mockResolvedValue({ data: [] });

    const { findByTestId } = render(
      <OrderDetailsScreen navigation={navigation} route={route} />
    );

    const button = await findByTestId('order-download-invoice');

    fireEvent.press(button);

    const FileSystem = require('expo-file-system');
    await waitFor(() => {
      expect(FileSystem.downloadAsync).toHaveBeenCalled();
    });
  });
});
