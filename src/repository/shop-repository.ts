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
    async updateAccessKeysForShop(shop: iShop): Promise<void> {
        await this.adapter.update(shop);
    }

    /**
     * Creates a new shop
     *
     * @param {iShop} shop
     * @returns {void}
     */
    async createShop(shop: iShop): Promise<void> {
        await this.adapter.create(shop);
    }

    /**
     * Returns a shop from the database
     *
     * @param {string} shopId
     * @returns {iShop}
     */
    async getShop(shopId: string): Promise<iShop> {
        return this.adapter.get(shopId);
    }

    /**
     * Removes a shop using the provided shop id
     *
     * @param {string} shopId
     * @returns {void}
     */
    async removeShopByShopId(shopId: string): Promise<void> {
        await this.adapter.delete(shopId);
    }

    /**
     * Returns the shop secret using the provided shop id
     *
     * @param {string} shopId
     * @returns {string}
     */
    async getSecretByShopId(shopId: string): Promise<string> {
        const shop = await this.adapter.get(shopId);
        return shop.shopSecret;
    }

    /**
     * Returns the credentials using the provided shop id
     *
     * @param {string} shopId
     * @returns {Credentials}
     */
    async getCredentialsForShopId(shopId: string): Promise<Credentials> {
        const shop = await this.adapter.get(shopId);

        return {
            shopUrl: shop.shopUrl,
            appSecret: shop.shopSecret as string,
            secretKey: shop.secretKey as string,
            token: null
        };
    }
}