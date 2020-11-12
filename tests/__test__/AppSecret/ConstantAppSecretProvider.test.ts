import { ConstantAppSecretProvider } from '@swag-app-system-package/AppSecret/constant-app-secret-provider';

describe('ConstantAppSecretProvider', () => {
    test('it returns the secret provided in its constructor', () => {
        const appSecret = 'thisIsSecret';

        const constantAppSecretProvider = new ConstantAppSecretProvider(appSecret);

        expect(constantAppSecretProvider.getAppSecret()).toBe(appSecret);
    });
});
