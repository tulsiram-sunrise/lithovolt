import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SettingsScreen from '../../src/screens/consumer/SettingsScreen';

const mockLogout = jest.fn();

jest.mock('../../src/store/authStore', () => ({
  useAuthStore: jest.fn((selector) => selector({ logout: mockLogout })),
}));

const navigation = { navigate: jest.fn() };

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to profile and logs out', () => {
    const { getByTestId } = render(<SettingsScreen navigation={navigation} />);

    fireEvent.press(getByTestId('settings-profile'));
    expect(navigation.navigate).toHaveBeenCalledWith('Profile');

    fireEvent.press(getByTestId('settings-logout'));
    expect(mockLogout).toHaveBeenCalled();
  });
});
