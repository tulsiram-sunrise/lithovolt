import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import SalesScreen from '../../src/screens/wholesaler/SalesScreen';
import { ordersAPI } from '../../src/services/api';

jest.mock('../../src/services/api', () => ({
  ordersAPI: {
    getOrders: jest.fn(),
  },
}));

describe('SalesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads fulfilled sales', async () => {
    ordersAPI.getOrders.mockResolvedValue({ data: [] });
    const { getByTestId } = render(<SalesScreen />);

    await waitFor(() => {
      expect(getByTestId('wholesaler-sales')).toBeTruthy();
    });
  });
});
