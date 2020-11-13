import { RandomBytesShopSecretGenerator } from "@swag-app-system-package/shop-secret/random-bytes-shop-secret-generator";

describe('RandomBytesShopSecretGenerator', () => {
    test('it returns an 16 byte string', () => {
        const shopSecretGenerator = new RandomBytesShopSecretGenerator();

        const secret = shopSecretGenerator.generateShopSecret();

        expect(secret).toHaveLength(32);
    });

    test('you can set its length', () => {
        const shopSecretGenerator = new RandomBytesShopSecretGenerator(32);

        const secret = shopSecretGenerator.generateShopSecret();

        expect(secret).toHaveLength(64);
    })
})