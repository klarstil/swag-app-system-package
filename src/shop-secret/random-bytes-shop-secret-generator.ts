import { randomBytes } from "crypto";
import { ShopSecretGeneratorInterface } from "@swag-app-system-package/shop-secret/shop-secret-generator-interface";
import { Shop } from "@swag-app-system-package/repository/shop-repository";

export class RandomBytesShopSecretGenerator implements ShopSecretGeneratorInterface {
    constructor(readonly length = 16) {}

    generateShopSecret(shop?: Shop): string {
        return randomBytes(this.length).toString('hex');
    }
}