import { InMemoryAdapter } from './in-memory-adapter';
import { iShop } from '@swag-app-system-package/repository/shop-repository';

describe('InMemoryAdapter', () => {
    test('it can create a shop', async () => {
        const inMemoryAdapter = new InMemoryAdapter();

        const shop: iShop = {
            shopId: '1',
            shopUrl: 'http://shop.url',
            shopSecret: 'imSafe'
        };

        await inMemoryAdapter.create(shop);

        expect(inMemoryAdapter.shops).toHaveLength(1);
        expect(inMemoryAdapter.shops[0]).toEqual(shop);
    });

    test('it returns a created shop', async () => {
        const inMemoryAdapter = new InMemoryAdapter();

        const shop: iShop = {
            shopId: '1',
            shopUrl: 'http://shop.url',
            shopSecret: 'imSafe'
        };

        inMemoryAdapter.shops.push(shop);

        const fetchedShop = await inMemoryAdapter.get(shop.shopId);

        expect(fetchedShop).toEqual(shop);
    });

    test('it returns undefined if shop does not exist', async () => {
        const inMemoryAdapter = new InMemoryAdapter();

        const fetchedShop = await inMemoryAdapter.get('testId');

        expect(fetchedShop).not.toBeDefined();
    });

    test('it can delete a shop', async () => {
        const inMemoryAdapter = new InMemoryAdapter();

        const shop: iShop = {
            shopId: '1',
            shopUrl: 'http://shop.url',
            shopSecret: 'imSafe'
        };

        inMemoryAdapter.shops.push(shop);

        await inMemoryAdapter.delete(shop.shopId);

        expect(inMemoryAdapter.shops).toHaveLength(0);
    });

    test('it updates a shop', async () => {
        const inMemoryAdapter = new InMemoryAdapter();

        const shop: iShop = {
            shopId: '1',
            shopUrl: 'http://shop.url',
            shopSecret: 'imSafe'
        };

        const appKeys = {
            secretKey: 'secretFromShop',
            apiKey: 'apiKey'
        };

        inMemoryAdapter.shops.push(shop);

        await inMemoryAdapter.update({
            ...shop,
            ...appKeys
        });

        expect(inMemoryAdapter.shops).toHaveLength(1);

        const updatedShop = await inMemoryAdapter.get(shop.shopId);
        expect(updatedShop).toEqual({
            ...shop,
            ...appKeys
        });
    });
})