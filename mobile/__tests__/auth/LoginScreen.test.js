import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../src/screens/auth/LoginScreen';
import { authAPI } from '../../src/services/api';

jest.mock('../../src/services/api', () => ({
  authAPI: {
    login: jest.fn(),
  },
}));

const mockSetAuth = jest.fn();

jest.mock('../../src/store/authStore', () => ({
  useAuthStore: jest.fn(() => mockSetAuth),
}));

const navigation = { navigate: jest.fn() };

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows validation error when fields are empty', async () => {
    const { getByTestId, getByText } = render(<LoginScreen navigation={navigation} />);

    fireEvent.press(getByTestId('login-submit'));

    expect(getByText('Email and password are required.')).toBeTruthy();
  });

  it('logs in successfully and sets auth state', async () => {
    authAPI.login.mockResolvedValue({
      data: {
        access: 'access-token',
        refresh: 'refresh-token',
        user: { id: 1, role: 'WHOLESALER' },
      },
    });

    const { getByTestId } = render(<LoginScreen navigation={navigation} />);

    fireEvent.changeText(getByTestId('login-email'), 'wholesaler1@lithovolt.com');
    fireEvent.changeText(getByTestId('login-password'), 'Wholesaler@123');
    fireEvent.press(getByTestId('login-submit'));

    await waitFor(() => {
      expect(mockSetAuth).toHaveBeenCalledWith(
        { id: 1, role: 'WHOLESALER' },
        'access-token',
        'refresh-token'
      );
    });
  });
});
