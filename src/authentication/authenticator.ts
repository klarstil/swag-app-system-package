import { createHmac } from "crypto";
import { ShopInfo, Shop } from "@swag-app-system-package/repository/shop-repository";
import {
    RegistrationAuthenticationFailedError,
    ShopAuthenticationFailedError,
} from "@swag-app-system-package/error";

export class Authenticator {
    static authenticateRegistration(shop: ShopInfo, timestamp: number, appSecret: string, signature: string): void {
        if(!Authenticator.validate(
            `shop-id=${shop.shopId}&shop-url=${shop.shopUrl}&timestamp=${timestamp}`,
            appSecret,
            signature
        )) {
            throw new RegistrationAuthenticationFailedError(shop.shopId);
        }
    }

    static getRegistrationProof(shop: Shop, appSecret: string, appName: string, confirmationUrl: string) {
        const proof = Authenticator.generateRegistrationProof(shop.shopUrl, shop.shopId, appName, appSecret);

        return {
            proof: proof,
            secret: shop.shopSecret,
            confirmation_url: confirmationUrl
        };
    }

    static authenticateShop(data: string, shop: Shop, signature: string): void {
        if(!this.validate(data, shop.shopSecret, signature)) {
            throw new ShopAuthenticationFailedError(shop.shopId);
        }
    }

    static validate(data: string, secret: string, proof: string): boolean {
        const hash = Authenticator.generateHash(data, secret);

        return hash === proof;
    }

    private static generateRegistrationProof(shopUrl: string, shopId: string, appName: string, appSecret: string) {
        return Authenticator.generateHash(`${shopUrl}${shopId}${appName}`, appSecret);
    }

    private static generateHash(data: string, secret: string): string {
        const hmac = createHmac('sha256', secret);

        return hmac.update(data, "utf8").digest('hex');
    }
}