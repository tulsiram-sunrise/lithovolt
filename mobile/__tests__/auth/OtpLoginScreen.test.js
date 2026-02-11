import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import OtpLoginScreen from '../../src/screens/auth/OtpLoginScreen';
import { authAPI } from '../../src/services/api';

jest.mock('../../src/services/api', () => ({
  authAPI: {
    sendOTP: jest.fn(),
    verifyOTP: jest.fn(),
  },
}));

const mockSetAuth = jest.fn();

jest.mock('../../src/store/authStore', () => ({
  useAuthStore: jest.fn(() => mockSetAuth),
}));

const navigation = { goBack: jest.fn() };

describe('OtpLoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires contact before sending OTP', () => {
    const { getByText } = render(<OtpLoginScreen navigation={navigation} />);

    fireEvent.press(getByText('Send OTP'));

    expect(getByText('Email or phone is required.')).toBeTruthy();
  });

  it('moves to verify step after sending OTP', async () => {
    authAPI.sendOTP.mockResolvedValue({});
    const { getByText, getByPlaceholderText, queryByPlaceholderText } = render(
      <OtpLoginScreen navigation={navigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Email or phone'), 'consumer1@lithovolt.com');
    fireEvent.press(getByText('Send OTP'));

    await waitFor(() => {
      expect(authAPI.sendOTP).toHaveBeenCalled();
      expect(queryByPlaceholderText('OTP code')).toBeTruthy();
    });
  });

  it('verifies OTP and sets auth state', async () => {
    authAPI.sendOTP.mockResolvedValue({});
    authAPI.verifyOTP.mockResolvedValue({
      data: {
        access: 'access',
        refresh: 'refresh',
        user: { id: 2, role: 'CONSUMER' },
      },
    });

    const { getByText, getByPlaceholderText } = render(<OtpLoginScreen navigation={navigation} />);

    fireEvent.changeText(getByPlaceholderText('Email or phone'), 'consumer1@lithovolt.com');
    fireEvent.press(getByText('Send OTP'));

    await waitFor(() => getByPlaceholderText('OTP code'));

    fireEvent.changeText(getByPlaceholderText('OTP code'), '123456');
    fireEvent.press(getByText('Verify & Login'));

    await waitFor(() => {
      expect(mockSetAuth).toHaveBeenCalledWith(
        { id: 2, role: 'CONSUMER' },
        'access',
        'refresh'
      );
    });
  });
});
