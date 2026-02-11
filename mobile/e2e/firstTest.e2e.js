describe('Auth flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('shows login screen', async () => {
    await expect(element(by.id('login-screen'))).toBeVisible();
  });

  it('navigates to OTP login', async () => {
    await element(by.text('Login with OTP')).tap();
    await expect(element(by.text('OTP Login'))).toBeVisible();
  });

  it('opens password reset and returns', async () => {
    await element(by.text('Back to login')).tap();
    await element(by.text('Forgot password?')).tap();
    await expect(element(by.text('Reset Password'))).toBeVisible();
    await element(by.text('Back to login')).tap();
    await expect(element(by.id('login-screen'))).toBeVisible();
  });
});
