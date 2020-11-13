import { ConnectionInterface } from "@shopware-ag/swag-app-system-package";
import { Shop } from "@shopware-ag/swag-app-system-package/build/repository/shop-repository";

// @ts-ignore
import low from 'lowdb';
// @ts-ignore
import FileSync from 'lowdb/adapters/FileSync';

const adapter = new FileSync('db.json');
const db = low(adapter);

export default class LowDbAdapter implements ConnectionInterface {
    tableName: string;

    constructor(tableName: string = 'shops') {
        db.defaults({ shops: [] }).write();
        this.tableName = tableName;
    }

    create(values: Shop): Promise<void> {
        db.get(this.tableName)
            .push(values)
            .write();

        return Promise.resolve();
    }

    get(shopId: string): Promise<Shop> {
        const result: Shop = db.get(this.tableName)
            .find({ shopId: shopId })
            .value();

        return Promise.resolve(result);
    }

    delete(shopId: string): Promise<void> {
        db.get(this.tableName)
            .remove({ shopId: shopId })
            .write();

        return Promise.resolve();
    }

    update(values: Shop): Promise<void> {
        db.get(this.tableName)
            .find({ shopId: values.shopId })
            .assign(values)
            .write();

        return Promise.resolve();
    }
}