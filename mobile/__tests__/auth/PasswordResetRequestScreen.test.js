import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PasswordResetRequestScreen from '../../src/screens/auth/PasswordResetRequestScreen';
import { authAPI } from '../../src/services/api';

jest.mock('../../src/services/api', () => ({
  authAPI: {
    passwordResetRequest: jest.fn(),
  },
}));

const navigation = { navigate: jest.fn(), goBack: jest.fn() };

describe('PasswordResetRequestScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires email before requesting reset', () => {
    const { getByTestId, getByText } = render(
      <PasswordResetRequestScreen navigation={navigation} />
    );

    fireEvent.press(getByTestId('password-reset-submit'));

    expect(getByText('Email is required.')).toBeTruthy();
  });

  it('navigates to confirm screen on success', async () => {
    authAPI.passwordResetRequest.mockResolvedValue({});
    const { getByTestId } = render(
      <PasswordResetRequestScreen navigation={navigation} />
    );

    fireEvent.changeText(getByTestId('password-reset-email'), 'consumer@lithovolt.com');
    fireEvent.press(getByTestId('password-reset-submit'));

    await waitFor(() => {
      expect(authAPI.passwordResetRequest).toHaveBeenCalledWith({ email: 'consumer@lithovolt.com' });
      expect(navigation.navigate).toHaveBeenCalledWith('PasswordResetConfirm', { email: 'consumer@lithovolt.com' });
    });
  });
});
