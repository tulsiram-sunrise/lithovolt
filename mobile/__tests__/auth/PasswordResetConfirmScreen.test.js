import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PasswordResetConfirmScreen from '../../src/screens/auth/PasswordResetConfirmScreen';
import { authAPI } from '../../src/services/api';

jest.mock('../../src/services/api', () => ({
  authAPI: {
    passwordResetConfirm: jest.fn(),
  },
}));

const navigation = { navigate: jest.fn() };

const route = { params: { email: 'consumer@lithovolt.com' } };

describe('PasswordResetConfirmScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires all fields', () => {
    const { getByTestId, getByText } = render(
      <PasswordResetConfirmScreen navigation={navigation} route={route} />
    );

    fireEvent.press(getByTestId('password-confirm-submit'));

    expect(getByText('All fields are required.')).toBeTruthy();
  });

  it('updates password and returns to login', async () => {
    authAPI.passwordResetConfirm.mockResolvedValue({});
    const { getByTestId } = render(
      <PasswordResetConfirmScreen navigation={navigation} route={route} />
    );

    fireEvent.changeText(getByTestId('password-confirm-otp'), '123456');
    fireEvent.changeText(getByTestId('password-confirm-new'), 'NewPass@123');
    fireEvent.changeText(getByTestId('password-confirm-new-confirm'), 'NewPass@123');
    fireEvent.press(getByTestId('password-confirm-submit'));

    await waitFor(() => {
      expect(authAPI.passwordResetConfirm).toHaveBeenCalled();
      expect(navigation.navigate).toHaveBeenCalledWith('Login');
    });
  });
});
