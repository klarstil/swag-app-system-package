import { iShop } from "../repository/shop-repository";

export declare interface ConnectionInterface {
    create(values: object): void,
    get(shopId: string): iShop
    delete(shopId: string): any,
    update(values: object): any
}