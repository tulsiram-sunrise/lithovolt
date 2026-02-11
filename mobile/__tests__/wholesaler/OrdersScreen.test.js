import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import OrdersScreen from '../../src/screens/wholesaler/OrdersScreen';
import { ordersAPI } from '../../src/services/api';

jest.mock('../../src/services/api', () => ({
  ordersAPI: {
    getOrders: jest.fn(),
    acceptOrder: jest.fn(),
    rejectOrder: jest.fn(),
    fulfillOrder: jest.fn(),
  },
}));

const navigation = { navigate: jest.fn() };

describe('OrdersScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders orders and accepts a pending order', async () => {
    ordersAPI.getOrders.mockResolvedValue({
      data: [{ id: 10, status: 'PENDING', consumer_name: 'Consumer', total_items: 1 }],
    });

    const { findByTestId } = render(<OrdersScreen navigation={navigation} />);

    const acceptButton = await findByTestId('order-accept-10');

    fireEvent.press(acceptButton);

    await waitFor(() => {
      expect(ordersAPI.acceptOrder).toHaveBeenCalledWith(10);
    });
  });

  it('shows error when orders fail to load', async () => {
    ordersAPI.getOrders.mockRejectedValue(new Error('fail'));

    const { getByText } = render(<OrdersScreen navigation={navigation} />);

    await waitFor(() => {
      expect(getByText('Failed to load orders.')).toBeTruthy();
    });
  });
});
