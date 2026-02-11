module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.(test|spec).js?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|expo(nent)?|@expo(nent)?/.*|expo-camera|expo-image-picker|expo-file-system|expo-sharing|expo-status-bar|react-native-svg|react-native-safe-area-context|react-native-screens|react-native-qrcode-svg)',
  ],
};
