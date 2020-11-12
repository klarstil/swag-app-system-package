import { ConnectionInterface } from "./connection-interface";
import { Collection } from "mongodb";
import { iShop } from "../repository/shop-repository";

export default class MongoDbAdapter implements ConnectionInterface {
    collection: Collection;

    constructor(collection: Collection) {
        this.collection = collection;
    }

    async create(values: object): Promise<void> {
        await this.collection.insertOne(values);
        return Promise.resolve();
    }

    async get(shopId: string): Promise<iShop> {
        return await this.collection.findOne({ shopId: shopId }) as iShop;
    }

    async delete(shopId: string): Promise<void> {
        await this.collection.deleteOne({ shopId: shopId });
        return Promise.resolve();
    }

    async update(values: iShop): Promise<void> {
        const filter = { shopId: values.shopId };
        await this.collection.updateOne(filter, { $set: values }, { upsert: false });
        return Promise.resolve();
    }
}