import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DashboardScreen from '../../src/screens/wholesaler/DashboardScreen';
import { inventoryAPI, ordersAPI } from '../../src/services/api';

jest.mock('../../src/services/api', () => ({
  inventoryAPI: {
    getInventory: jest.fn(),
  },
  ordersAPI: {
    getOrders: jest.fn(),
  },
}));

const navigation = { navigate: jest.fn() };

describe('DashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads metrics and navigates via actions', async () => {
    ordersAPI.getOrders.mockResolvedValue({ data: [] });
    inventoryAPI.getInventory.mockResolvedValue({ data: [] });

    const { getByTestId } = render(<DashboardScreen navigation={navigation} />);

    await waitFor(() => {
      expect(ordersAPI.getOrders).toHaveBeenCalled();
      expect(inventoryAPI.getInventory).toHaveBeenCalled();
    });

    fireEvent.press(getByTestId('dashboard-inventory'));
    expect(navigation.navigate).toHaveBeenCalledWith('Inventory');
  });
});
