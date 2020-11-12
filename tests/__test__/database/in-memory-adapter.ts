import { ConnectionInterface } from '@swag-app-system-package/database/connection-interface';
import {Shop} from "@swag-app-system-package/repository/shop-repository";

export class InMemoryAdapter implements ConnectionInterface {
    public shops: Shop[] = [];

    create(values: Shop): Promise<void> {
        return new Promise((resolve) => {
            this.shops.push({ ...values });

            resolve();
        });
    }

    delete(shopId: string): Promise<void> {
        return new Promise((resolve) => {
            this.shops = this.shops.filter((shop) => {
                return shop.shopId !== shopId;
            })

            resolve();
        });
    }

    get(shopId: string): Promise<Shop> {
        return new Promise((resolve) => {
            const shop = this.shops.find((shop: Shop) => {
                return shop.shopId === shopId;
            });

            resolve(shop);
        });
    }

    update(values: Shop): Promise<void> {
        return new Promise((resolve) => {
            this.get(values.shopId).then((shop) => {
                Object.assign(shop, values);
            })

            resolve();
        })
    }
}
