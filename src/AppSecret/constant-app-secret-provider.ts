import { AppSecrectProviderInterface } from './app-secret-provider-interface';

export class ConstantAppSecretProvider implements AppSecrectProviderInterface {
    constructor(readonly appSecret: string) {}

    getAppSecret(): string {
        return this.appSecret;
    }
}