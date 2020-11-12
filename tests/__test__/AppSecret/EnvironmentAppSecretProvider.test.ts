import { EnvironmentAppProvider } from '@swag-app-system-package/AppSecret/environment-app-secret-provider';
import { AppSecretMissingError } from '@swag-app-system-package/Error/app-secret-missing-error';

describe('EnvironmentAppProvider', () => {
    const envVariableName = 'test_app_secret';
    const appSecret = 'thisIsNotSoSafe';

    test('it returns the app secret from environment variables', () => {
        const environmentAppProvider = new EnvironmentAppProvider(envVariableName);
        
        process.env[envVariableName] = appSecret;

        expect(environmentAppProvider.getAppSecret()).toBe(appSecret);
    });

    test('it throws AppSecretMissingError if environment variable is not set', () => {
        const environmentAppProvider = new EnvironmentAppProvider(envVariableName);
        
        delete process.env[envVariableName];

        expect(() => {
            environmentAppProvider.getAppSecret()
        }).toThrow(AppSecretMissingError);
    })
})