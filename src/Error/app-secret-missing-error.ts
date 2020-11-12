export class AppSecretMissingError extends Error {
    constructor() {
        super('App secret was not found.');
        this.name = 'AppSecretMissingError';
    }
}
