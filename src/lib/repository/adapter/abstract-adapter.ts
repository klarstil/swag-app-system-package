import { iShop } from "../shop-repository";

export declare interface AbstractAdapter {
    create(values: object): void,
    get(shopId: string): iShop
    delete(shopId: string): any,
    update(values: object): any
}