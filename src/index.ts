import { Express, Request, Response } from "express";
import { Authenticator } from "./authenficator";
import { ShopRepository } from "./repository/shop-repository";
import { EventEmitter } from "events";
import { ConnectionInterface} from "./database/connection-interface";
import { MongoDbAdapter } from "./database/mongodb-adapter";
export * from './app-secret';

declare interface iAppTemplateOptions {
    confirmRoute: string,
    registerRoute: string,
    appInstalledRoute?: string,
    appDeletedRoute?: string,
    appUpdatedRoute?: string,
    appActivatedRoute?: string,
    appDeactivatedRoute?: string,
    appSecret: string,
    appName: string
}

export declare interface ActionButtonsParams {
    signature: string,
    source: object,
    data: object,
    meta: object
}

export declare interface CustomModuleParams extends ActionButtonsParams {
    request: Request,
    response: Response
}

class AppTemplate extends EventEmitter {
    app: Express;
    options: iAppTemplateOptions;
    shopRepository: ShopRepository;

    /**
     * Constructor which initializes the app template which represents an
     * {@link https://www.npmjs.com/package/express express} wrapper.
     *
     * @param {Express} app
     * @param {ConnectionInterface} adapter
     * @param {iAppTemplateOptions} options
     */
    constructor(app: Express, adapter: ConnectionInterface, options: iAppTemplateOptions) {
        super();

        this.app = app;
        this.options = options;
        this.shopRepository = new ShopRepository(adapter);

        this.registerExpressRoutes(this.app);
    }

    /**
     * Registers the necessary routes for the authentication of the application against the app system into
     * the provided express app.
     *
     * @param {Express} app
     * @returns {boolean}
     */
    registerExpressRoutes(app: Express): boolean {
        app.get(this.options.registerRoute, this.onRegisterRoute.bind(this));
        app.post(this.options.confirmRoute, this.onConfirmRoute.bind(this));

        if (this.options.appDeletedRoute) {
            app.post(this.options.appDeletedRoute, this.onAppDeleteRoute.bind(this));
        }

        const additionalLifeCycleRoutes = [
            this.options.appActivatedRoute,
            this.options.appDeactivatedRoute,
            this.options.appInstalledRoute,
            this.options.appUpdatedRoute
        ].filter(Boolean);

        if (additionalLifeCycleRoutes.length) {
            additionalLifeCycleRoutes.forEach((routeName) => {
                app.post(routeName as string, this.onAppLifecycleRoute.bind(this));
            });
        }

        return true;
    }

    /**
     * Route handler for the registration route which verifies the register request from the app system and creates
     * a new shop.
     *
     * @param {Request} request
     * @param {Response} response
     * @returns {void}
     */
    async onRegisterRoute(request: Request, response: Response): Promise<void> {
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

        await this.shopRepository.createShop({
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

    /**
     * Route handler for the confirmation route which verifies the post request from the app system and updates the
     * associated shop with the credentials from the handshake.
     *
     * @param {Request} request
     * @param {Response} response
     * @returns {void}
     */
    async onConfirmRoute(request: Request, response: Response): Promise<void> {
        const isValid = await this.authenticatePostRequest(request, request.body.shopId);

        if (!isValid) {
            response.status(401).end();
            return;
        }

        await this.shopRepository.updateAccessKeysForShop(request.body);

        response.end();
    }

    /**
     * Route handler for the app deleted route which verifies the post request and removes the shop.
     *
     * @param {Request} request
     * @param {response} response
     * @returns {void}
     */
    async onAppDeleteRoute(request: Request, response: Response) {
        const isValid = await this.authenticatePostRequest(request, request.body.source.shopId);

        if (!isValid) {
            response.status(401).end();
            return;
        }

        this.emit(request.body.data.event, request.body);

        await this.shopRepository.removeShopByShopId(request.body.source.shopId);
        response.end();
    }

    /**
     * Route handler for the individual lifecycle routes which verifies the post request and trigger an event.
     *
     * @param {Request} request
     * @param {Response} response
     * @returns {void}
     */
    async onAppLifecycleRoute(request: Request, response: Response) {
        const isValid = await this.authenticatePostRequest(request, request.body.source.shopId);

        if (!isValid) {
            response.status(401).end();
            return;
        }

        this.emit(request.body.data.event, request.body);

        response.end();
    }

    /**
     * Register a url to the express application which will be triggered when the user pressed the corresponding action
     * button in the administration.
     *
     * @param {String} url
     * @param {Function} callback
     * @returns {Promise<ActionButtonsParams>}
     */
    registerActionButton(url: string, callback: Function): void {
        this.app.post(url, async (request: Request, response: Response) => {
            const isValid = await this.authenticatePostRequest(request, request.body.source.shopId);

            const params: ActionButtonsParams = {
                signature: request.get('shopware-shop-signature') as string,
                source: request.body.source,
                data: request.body.data,
                meta: request.body.meta
            };

            if (!isValid) {
                response.status(401).end();
                callback(isValid, params);
                return;
            }

            response.end();
            callback(isValid, params);
        });
    }

    /**
     * Register a url which will be triggered when a custom module in the administration will be opened.
     *
     * @param {String} url
     * @param {Function} callback
     * @returns {Promise<CustomModuleParams>}
     */
    registerCustomModule(url: string, callback: Function): void {
        this.app.get(url, async (request: Request, response: Response) => {
            const shopId = request.query['shop-id'] as string;
            const signature = request.query['shopware-shop-signature'] as string;
            const isValid = this.authenticateGetRequest(request, shopId);

            const params: CustomModuleParams = {
                source: request.body.source,
                data: request.body.data,
                meta: request.body.meta,
                signature,
                request,
                response
            };

            callback(isValid, params);
        });
    }

    /**
     * Helper method which validates if a post request is authenticated correctly.
     *
     * @private
     * @param {Request} request
     * @param {String} shopId
     * @returns {boolean}
     */
    async authenticatePostRequest(request: Request, shopId: string): Promise<boolean> {
        const shopSecret = await this.shopRepository.getSecretByShopId(shopId);

        return Authenticator.authenticatePostRequest({
            shopSecret,
            signature: request.get('shopware-shop-signature') as string,
            body: JSON.stringify(request.body).replace(/\//g, (str) => {
                return `\\${str}`;
            })
        });
    }

    async authenticateGetRequest(request: Request, shopId: string): Promise<boolean> {
        const shopSecret = await this.shopRepository.getSecretByShopId(shopId);
        const signature = request.query['shopware-shop-signature'] as string;
        const query = request.query;
        const queryString = `shop-id=${shopId}&shop-url=${query['shop-url']}&timestamp=${query.timestamp}`;

        return Authenticator.authenticateGetRequest({
            signature,
            shopSecret,
            queryString
        });
    }
}

export {
    AppTemplate,
    Authenticator,
    ShopRepository,
    ConnectionInterface,
    MongoDbAdapter
};