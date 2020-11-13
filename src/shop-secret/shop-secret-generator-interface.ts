import { Shop } from "@swag-app-system-package/repository/shop-repository";

export declare interface ShopSecretGeneratorInterface {
    generateShopSecret(shop?: Shop): string;
}