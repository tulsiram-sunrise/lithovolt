import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WarrantyDetailsScreen from '../../src/screens/consumer/WarrantyDetailsScreen';

const navigation = { navigate: jest.fn() };

const route = {
  params: {
    warranty: {
      id: 1,
      serial: 'LV-100',
      battery_model_name: 'Model A',
      status: 'ACTIVE',
      start_date: '2024-01-01',
      end_date: '2025-01-01',
    },
  },
};

describe('WarrantyDetailsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to claim screen', () => {
    const { getByTestId } = render(
      <WarrantyDetailsScreen navigation={navigation} route={route} />
    );

    fireEvent.press(getByTestId('warranty-submit-claim'));

    expect(navigation.navigate).toHaveBeenCalledWith('WarrantyClaim', { warranty: route.params.warranty });
  });
});
