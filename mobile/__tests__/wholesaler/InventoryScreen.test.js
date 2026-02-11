import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import InventoryScreen from '../../src/screens/wholesaler/InventoryScreen';
import { inventoryAPI } from '../../src/services/api';

jest.mock('../../src/services/api', () => ({
  inventoryAPI: {
    getInventory: jest.fn(),
    getAllocations: jest.fn(),
  },
}));

describe('InventoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads inventory and allocations', async () => {
    inventoryAPI.getInventory.mockResolvedValue({ data: [] });
    inventoryAPI.getAllocations.mockResolvedValue({ data: [] });

    const { getByTestId } = render(<InventoryScreen />);

    await waitFor(() => {
      expect(getByTestId('wholesaler-inventory')).toBeTruthy();
    });
  });
});
