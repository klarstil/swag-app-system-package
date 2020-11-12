import { iShop } from "../repository/shop-repository";

export declare interface ConnectionInterface {
    create(values: iShop): Promise<void>,
    get(shopId: string): Promise<iShop>
    delete(shopId: string): Promise<void>,
    update(values: iShop): Promise<void>
}