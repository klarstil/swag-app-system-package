export class ShopAuthenticationFailedError extends Error {
    constructor(shopId: string) {
        super(`Could not authenticate shop with id: ${shopId}`);
        this.name = 'ShopAuthenticationFailedError';
    }
}