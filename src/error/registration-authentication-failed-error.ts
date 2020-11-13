export class RegistrationAuthenticationFailedError extends Error {
    constructor(shopId: string) {
        super(`Failed to validate registration authentication for shop with id ${shopId}`);
        this.name = 'RegistrationAuthenticationFailedError';
    }
}