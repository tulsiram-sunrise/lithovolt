import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ConsumerProfileScreen from '../../src/screens/consumer/ConsumerProfileScreen';
import { userAPI } from '../../src/services/api';

jest.mock('../../src/services/api', () => ({
  userAPI: {
    getMe: jest.fn(),
    updateProfile: jest.fn(),
  },
}));

const mockSetUser = jest.fn();

jest.mock('../../src/store/authStore', () => ({
  useAuthStore: jest.fn((selector) => selector({
    user: { first_name: 'Consumer', email: 'consumer@x.com' },
    setUser: mockSetUser,
  })),
}));

const navigation = { goBack: jest.fn() };

describe('ConsumerProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads profile and saves updates', async () => {
    userAPI.getMe.mockResolvedValue({ data: { first_name: 'Consumer', email: 'consumer@x.com' } });
    userAPI.updateProfile.mockResolvedValue({ data: { first_name: 'Updated' } });

    const { getByTestId } = render(<ConsumerProfileScreen navigation={navigation} />);

    await waitFor(() => {
      expect(getByTestId('profile-first-name').props.value).toBe('Consumer');
    });

    fireEvent.changeText(getByTestId('profile-first-name'), 'Updated');
    fireEvent.press(getByTestId('profile-save'));

    await waitFor(() => {
      expect(userAPI.updateProfile).toHaveBeenCalled();
      expect(mockSetUser).toHaveBeenCalledWith({ first_name: 'Updated' });
    });
  });
});
