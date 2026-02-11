import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ConsumerClaimsScreen from '../../src/screens/consumer/ConsumerClaimsScreen';
import { warrantyAPI } from '../../src/services/api';

jest.mock('../../src/services/api', () => ({
  warrantyAPI: {
    getClaims: jest.fn(),
  },
}));

const navigation = { navigate: jest.fn() };

describe('ConsumerClaimsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders claim cards and navigates to details', async () => {
    warrantyAPI.getClaims.mockResolvedValue({
      data: [{ id: 7, status: 'PENDING', warranty_number: 'WN-1' }],
    });

    const { findByTestId } = render(<ConsumerClaimsScreen navigation={navigation} />);

    const card = await findByTestId('claim-card-7');

    fireEvent.press(card);

    expect(navigation.navigate).toHaveBeenCalledWith('ClaimDetails', {
      claim: { id: 7, status: 'PENDING', warranty_number: 'WN-1' },
    });
  });
});
