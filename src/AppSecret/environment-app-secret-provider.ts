import { AppSecrectProviderInterface } from './app-secret-provider-interface';
import { AppSecretMissingError } from '../Error/app-secret-missing-error';

export class EnvironmentAppProvider implements AppSecrectProviderInterface {
    constructor(readonly envVariableName :string) {}

    getAppSecret(): string {
        const appSecret = process.env[this.envVariableName];

        if (appSecret === undefined) {
            throw new AppSecretMissingError();
        }

        return appSecret;
    }
}