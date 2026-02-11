import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../../src/screens/consumer/HomeScreen';
import { warrantyAPI } from '../../src/services/api';

jest.mock('../../src/services/api', () => ({
  warrantyAPI: {
    getWarranties: jest.fn(),
  },
}));

jest.mock('../../src/store/authStore', () => ({
  useAuthStore: jest.fn((selector) => selector({ user: { first_name: 'Consumer' } })),
}));

const navigation = { navigate: jest.fn() };

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders warranties and navigates to details', async () => {
    warrantyAPI.getWarranties.mockResolvedValue({
      data: [{ id: 1, serial: 'LV-100', battery_model_name: 'Model A', status: 'ACTIVE' }],
    });

    const { findByTestId } = render(<HomeScreen navigation={navigation} />);

    const card = await findByTestId('warranty-card-1');

    fireEvent.press(card);

    expect(navigation.navigate).toHaveBeenCalledWith('WarrantyDetails', {
      warranty: { id: 1, serial: 'LV-100', battery_model_name: 'Model A', status: 'ACTIVE' },
    });
  });

  it('navigates to scan screen', async () => {
    warrantyAPI.getWarranties.mockResolvedValue({ data: [] });
    const { getByTestId } = render(<HomeScreen navigation={navigation} />);

    fireEvent.press(getByTestId('home-scan-qr'));

    expect(navigation.navigate).toHaveBeenCalledWith('ScanQR');
  });
});
