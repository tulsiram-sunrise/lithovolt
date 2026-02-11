import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ClaimDetailsScreen from '../../src/screens/consumer/ClaimDetailsScreen';

const navigation = { goBack: jest.fn() };

const route = {
  params: {
    claim: {
      id: 5,
      status: 'PENDING',
      description: 'Issue',
      attachments: [],
    },
  },
};

describe('ClaimDetailsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('goes back to claims list', () => {
    const { getByTestId } = render(
      <ClaimDetailsScreen navigation={navigation} route={route} />
    );

    fireEvent.press(getByTestId('claim-back'));
    expect(navigation.goBack).toHaveBeenCalled();
  });
});
