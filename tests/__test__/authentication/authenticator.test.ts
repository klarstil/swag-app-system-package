import { createHmac } from "crypto";
import { Authenticator } from '@swag-app-system-package/authentication';
import { Shop } from "@swag-app-system-package/repository/shop-repository";
import {
    RegistrationAuthenticationFailedError,
    ShopAuthenticationFailedError,
} from "@swag-app-system-package/error";

function createHash(data: string, secret: string) {
    const hmac = createHmac('sha256', secret);
    return hmac.update(data, "utf8").digest('hex');
}

describe('Authenticator', () => {
    const shop: Shop = {
        shopId: 'abcd',
        shopUrl: 'http://shop.url',
        shopSecret: 'asdsad'
    };
    const appSecret: string = 'ThisIsNotSoSafe';
    const appName: string = 'TestApp';

    describe('authenticateRegistration', () => {
        it('does not throw if signature is correct', () => {
            const timeStamp = (new Date('2020-11-13')).getTime();

            const signature = createHash(
              `shop-id=${shop.shopId}&shop-url=${shop.shopUrl}&timestamp=${timeStamp}`,
              appSecret,
            );

            expect(() => {
                Authenticator.authenticateRegistration(shop, timeStamp, appSecret, signature);
            }).not.toThrow();
        });

        it ('throws error if signature is nor correct', () => {
            const timeStamp = (new Date('2020-11-13')).getTime();

            const signature = createHash(
                `shopId=${shop.shopId}&shopUrl=${shop.shopUrl}&timestamp=${timeStamp}`,
                appSecret,
            );

            expect(() => {
                Authenticator.authenticateRegistration(shop, timeStamp, appSecret, signature);
            }).toThrow(RegistrationAuthenticationFailedError);
        });
    });

    describe('getRegistrationProof', () => {
        it('returns a registration proof', () => {
            const proof = createHash(
                `${shop.shopUrl}${shop.shopId}${appName}`, appSecret
            );
            const confirmationUrl = '/confirm';

            expect(
                Authenticator.getRegistrationProof(shop, appSecret, appName, confirmationUrl)
            ).toEqual({
                proof,
                secret: shop.shopSecret,
                confirmation_url: confirmationUrl
            });
        });
    });

    describe('authenticateShop', () => {
        it('does not throw if authentication da is correct',  () => {
            const data = JSON.stringify({
                data: 'this is a test',
            });
            const signature = createHash(data, shop.shopSecret);

            expect(() => {
                Authenticator.authenticateShop(data, shop, signature)
            }).not.toThrow();
        });

       it('throws error if signature is invalid', ()=> {
           const data = JSON.stringify({
               data: 'this is a test',
           });
           const signature = createHash(data, 'thatsNotMyKey');

           expect(() => {
               Authenticator.authenticateShop(data, shop, signature)
           }).toThrow(ShopAuthenticationFailedError);
       });
    });
})