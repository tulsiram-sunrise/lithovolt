import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PlaceOrderScreen from '../../src/screens/wholesaler/PlaceOrderScreen';
import { inventoryAPI, ordersAPI } from '../../src/services/api';

jest.mock('../../src/services/api', () => ({
  inventoryAPI: {
    getModels: jest.fn(),
  },
  ordersAPI: {
    createOrder: jest.fn(),
  },
}));

const navigation = { navigate: jest.fn(), goBack: jest.fn() };

describe('PlaceOrderScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads models and submits an order', async () => {
    inventoryAPI.getModels.mockResolvedValue({
      data: [{ id: 1, name: 'LV 12V 150Ah', sku: 'LV-150', is_active: true }],
    });
    ordersAPI.createOrder.mockResolvedValue({ data: { id: 22 } });

    const { findByText, findByTestId } = render(
      <PlaceOrderScreen navigation={navigation} />
    );

    const addButton = await findByText('Add');
    fireEvent.press(addButton);

    const submitButton = await findByText('Submit Order');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(ordersAPI.createOrder).toHaveBeenCalled();
      expect(navigation.navigate).toHaveBeenCalledWith('Orders');
    });
  });
});
