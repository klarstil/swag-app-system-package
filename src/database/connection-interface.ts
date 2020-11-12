import { Shop } from "../repository/shop-repository";

export declare interface ConnectionInterface {
    create(values: Shop): Promise<void>,
    get(shopId: string): Promise<Shop>
    delete(shopId: string): Promise<void>,
    update(values: Shop): Promise<void>
}