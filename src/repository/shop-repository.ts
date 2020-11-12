import { ConnectionInterface } from "../database/connection-interface";

export declare interface iShop {
    shopId: string
    shopUrl: string,
    shopSecret: string
    secretKey?: string;
    apiKey?: string,
}

declare interface Credentials {
    shopUrl: string,
    appSecret: string,
    secretKey: string,
    token: string | null
}

export default class ShopRepository {
    adapter: ConnectionInterface;

    /**
     * Initializes the shop repository with the necessary connection adapter.
     *
     * @param {ConnectionInterface} adapter
     */
    constructor(adapter: ConnectionInterface) {
        this.adapter = adapter;
    }

    /**
     * Updates the access keys for the shop
     *
     * @param {iShop} shop
     * @returns {void}
     */
    updateAccessKeysForShop(shop: iShop): void {
        this.adapter.update(shop);
    }

    /**
     * Creates a new shop
     *
     * @param {iShop} shop
     * @returns {void}
     */
    createShop(shop: iShop): void {
        this.adapter.create(shop);
    }

    /**
     * Removes a shop using the provided shop id
     *
     * @param {string} shopId
     * @returns {void}
     */
    removeShopByShopId(shopId: string): void {
        this.adapter.delete(shopId);
    }

    /**
     * Returns the shop secret using the provided shop id
     *
     * @param {string} shopId
     * @returns {string}
     */
    getSecretByShopId(shopId: string): string {
        const shop = this.adapter.get(shopId);
        return shop.shopSecret;
    }

    /**
     * Returns the credentials using the provided shop id
     *
     * @param {string} shopId
     * @returns {Credentials}
     */
    getCredentialsForShopId(shopId: string): Credentials {
        const shop = this.adapter.get(shopId);

        return {
            shopUrl: shop.shopUrl,
            appSecret: shop.shopSecret as string,
            secretKey: shop.secretKey as string,
            token: null
        };
    }
}