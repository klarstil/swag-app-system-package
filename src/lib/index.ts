import {Express, Request, Response} from "express";
import Authenticator from "./authenficator";
import ShopRepository from "./repository/shop-repository";
import { AbstractAdapter } from './repository/adapter/abstract-adapter';
import LowDbAdapter from "./repository/adapter/lowdb-adapter";

declare interface iAppTemplateOptions {
    confirmRoute: string,
    registerRoute: string,
    appSecret: string,
    appName: string
}

class AppTemplate {
    app: Express;
    options: iAppTemplateOptions;
    shopRepository: ShopRepository;

    constructor(app: Express, connector: any, options: iAppTemplateOptions) {
        this.app = app;
        this.options = options;
        this.shopRepository = new ShopRepository(connector);

        this.registerExpressRoutes(this.app);
    }

    registerExpressRoutes(app: Express): boolean {
        app.get(this.options.registerRoute, this.onRegisterRoute.bind(this));
        app.post(this.options.confirmRoute, this.onConfirmRoute.bind(this));

        return true;
    }

    onRegisterRoute(request: Request, response: Response) {
        const shopUrl = request.query['shop-url'] as string;
        const shopId = request.query['shop-id'] as string;

        if (!Authenticator.authenticateRegisterRequest({
            appSecret: this.options.appSecret,
            shopId: shopId,
            shopUrl: shopUrl,
            signature: request.get('shopware-app-signature') as string,
            timestamp: parseInt(request.query.timestamp as string)
        })) {
            response.status(401).end();
            return;
        }

        const shopSecret = Authenticator.generateSecretForShop();
        const name = this.options.appName;

        this.shopRepository.createShop({
            shopId,
            shopUrl,
            shopSecret
        });

        // Generate proof
        const proof = Authenticator.generateProof({
            shopUrl,
            shopId,
            name,
            shopSecret,
            appSecret: this.options.appSecret,
            confirmationUrl: `http://localhost:8000${this.options.confirmRoute}`
        });

        response.json(proof);
    }

    onConfirmRoute(request: Request, response: Response) {
        const shopSecret = this.shopRepository.getSecretByShopId(request.body.shopId);

        if (!Authenticator.authenticatePostRequest({
            shopSecret,
            signature: request.get('shopware-shop-signature') as string,
            body: JSON.stringify(request.body).replace(/\//g, (str) => {
                return `\\${str}`;
            })
        })) {
            response.status(401).end();
            return;
        }

        this.shopRepository.updateAccessKeysForShop(request.body);

        response.end();
    }
}

export {
    AppTemplate,
    Authenticator,
    ShopRepository,
    AbstractAdapter,
    LowDbAdapter
};