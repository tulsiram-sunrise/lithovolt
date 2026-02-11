import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import WarrantyActivateScreen from '../../src/screens/consumer/WarrantyActivateScreen';
import { warrantyAPI } from '../../src/services/api';

jest.mock('../../src/services/api', () => ({
  warrantyAPI: {
    activateWarranty: jest.fn(),
  },
}));

jest.mock('../../src/store/authStore', () => ({
  useAuthStore: jest.fn((selector) => selector({ user: { email: 'c@x.com', first_name: 'C' } })),
}));

const navigation = { navigate: jest.fn(), goBack: jest.fn() };

const route = { params: { serial_number: 'LV-200' } };

describe('WarrantyActivateScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows error when serial is missing', () => {
    const { getByTestId, getByText } = render(
      <WarrantyActivateScreen navigation={navigation} route={{ params: {} }} />
    );

    fireEvent.press(getByTestId('activate-submit'));

    expect(getByText('Serial number is required.')).toBeTruthy();
  });

  it('submits activation and navigates to details', async () => {
    warrantyAPI.activateWarranty.mockResolvedValue({ data: { id: 11 } });

    const { getByTestId } = render(
      <WarrantyActivateScreen navigation={navigation} route={route} />
    );

    fireEvent.press(getByTestId('activate-submit'));

    await waitFor(() => {
      expect(warrantyAPI.activateWarranty).toHaveBeenCalled();
      expect(navigation.navigate).toHaveBeenCalledWith('WarrantyDetails', { warranty: { id: 11 } });
    });
  });
});
