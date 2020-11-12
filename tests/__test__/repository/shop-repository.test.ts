import ShopRepository, { Shop } from '@swag-app-system-package/repository/shop-repository';
import { InMemoryAdapter} from "../database/in-memory-adapter";

describe('ShopRepostory', () => {
    const shop: Shop = {
        shopId: 'shopId',
        shopUrl: 'http://shop.url',
        shopSecret: 'shopSecret',
        apiKey: 'apiKey',
        secretKey: 'secretKey',
    }

    test('it creates a shop', async () => {
        const inMemoryAdapter = new InMemoryAdapter();
        const repository = new ShopRepository(inMemoryAdapter);

        await repository.createShop(shop);

        const fetchedShop = await inMemoryAdapter.get(shop.shopId);

        expect(fetchedShop).toEqual(shop);
    });

    test('it returns a created shop', async () => {
        const inMemoryAdapter = new InMemoryAdapter();
        const repository = new ShopRepository(inMemoryAdapter);

        inMemoryAdapter.create(shop);

        const fetchedShop = await repository.getShop(shop.shopId);

        expect(fetchedShop).toEqual(shop);
    });

    test('it returns undefined if shop does not exist', async () => {
        const inMemoryAdapter = new InMemoryAdapter();
        const repository = new ShopRepository(inMemoryAdapter);

        const fetchedShop = await repository.getShop('testId');

        expect(fetchedShop).not.toBeDefined();
    });

    test('it can delete a shop', async () => {
        const inMemoryAdapter = new InMemoryAdapter();
        const repository = new ShopRepository(inMemoryAdapter);

        inMemoryAdapter.shops.push(shop);

        await repository.removeShopByShopId(shop.shopId);

        expect(inMemoryAdapter.shops).toHaveLength(0);
    });

    test('it updates a shop', async () => {
        const inMemoryAdapter = new InMemoryAdapter();
        const repository = new ShopRepository(inMemoryAdapter);

        const appKeys = {
            secretKey: 'secretFromShop',
            apiKey: 'apiKey'
        };

        inMemoryAdapter.shops.push(shop);

        await repository.updateAccessKeysForShop({
            ...shop,
            ...appKeys
        });

        expect(inMemoryAdapter.shops).toHaveLength(1);

        const updatedShop = await repository.getShop(shop.shopId);
        expect(updatedShop).toEqual({
            ...shop,
            ...appKeys
        });
    });

    test('it returns shop credentials', async () => {
        const inMemoryAdapter = new InMemoryAdapter();
        const repository = new ShopRepository(inMemoryAdapter);

        inMemoryAdapter.shops.push(shop);

        const credentials = await repository.getCredentialsForShopId(shop.shopId);

        expect(credentials).toEqual({
            shopUrl: shop.shopUrl,
            appSecret: shop.shopSecret as string,
            secretKey: shop.secretKey as string,
            token: null
        });
    });

    test('it returns shop secret from db', async () => {
        const inMemoryAdapter = new InMemoryAdapter();
        const repository = new ShopRepository(inMemoryAdapter);

        inMemoryAdapter.shops.push(shop);

        const secret = await repository.getSecretByShopId(shop.shopId);

        expect(secret).toEqual(shop.shopSecret);
    });
})