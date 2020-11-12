import { ConnectionInterface } from "./connection-interface";
import { iShop } from "../repository/shop-repository";

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

    create(values: iShop): void {
        db.get(this.tableName)
            .push(values)
            .write();
    }

    get(shopId: string): iShop {
        return db.get(this.tableName)
            .find({ shopId: shopId })
            .value();
    }

    delete(shopId: string): void {
        db.get(this.tableName)
            .remove({ shopId: shopId })
            .write();
    }

    update(values: iShop): void {
        db.get(this.tableName)
            .find({ shopId: values.shopId })
            .assign(values)
            .write();
    }
}