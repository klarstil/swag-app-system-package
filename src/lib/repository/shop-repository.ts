export declare interface iShop {
    shopId: string
    shopUrl: string,
    shopSecret: string
    secretKey?: string;
    apiKey?: string,
}

declare interface Credentials {
    shopUrl: string,
    key: string,
    secretKey: string,
    token: string
}


export default class ShopRepository {
    adapter: any;

    constructor(adapter: any) {
        this.adapter = adapter;
    }

    updateAccessKeysForShop(shop: iShop): void {
        this.adapter.update(shop);
    }

    createShop(shop: iShop): void {
        this.adapter.create(shop);
    }

    removeShopByShopId(shopId: string): void {
        this.adapter.remove(shopId);
    }

    getSecretByShopId(shopId: string): string {
        const shop = this.adapter.get(shopId);
        return shop.shopSecret;
    }

    getCredentialsForShopId(shopId: string): Credentials {
        const shop = this.adapter.get(shopId);

        return {
            shopUrl: shop.shopUrl,
            key: shop.key,
            secretKey: shop.secretKey,
            token: shop.token
        };
    }
}