import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import IssueWarrantyScreen from '../../src/screens/wholesaler/IssueWarrantyScreen';
import { ordersAPI } from '../../src/services/api';

jest.mock('../../src/services/api', () => ({
  ordersAPI: {
    getOrder: jest.fn(),
  },
  warrantyAPI: {
    issueWarranty: jest.fn(),
  },
}));

const navigation = { navigate: jest.fn(), goBack: jest.fn() };

describe('IssueWarrantyScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prefills consumer contact from order payload', async () => {
    ordersAPI.getOrder.mockResolvedValue({
      data: {
        consumer_email: 'consumer1@lithovolt.com',
        consumer_phone: '+15550001111',
        consumer_first_name: 'Consumer',
        consumer_last_name: 'One',
      },
    });

    const { getByPlaceholderText } = render(
      <IssueWarrantyScreen navigation={navigation} route={{ params: { orderId: 5 } }} />
    );

    await waitFor(() => {
      expect(ordersAPI.getOrder).toHaveBeenCalled();
      expect(getByPlaceholderText('Consumer email').props.value).toBe('consumer1@lithovolt.com');
      expect(getByPlaceholderText('Consumer phone').props.value).toBe('+15550001111');
      expect(getByPlaceholderText('First name').props.value).toBe('Consumer');
      expect(getByPlaceholderText('Last name').props.value).toBe('One');
    });
  });
});
