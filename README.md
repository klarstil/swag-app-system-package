# @shopware-ag/swag-app-system-package

![GitHub](https://img.shields.io/github/license/klarstil/swag-app-system-package)
![GitHub last commit](https://img.shields.io/github/last-commit/klarstil/swag-app-system-package)
![David](https://img.shields.io/david/klarstil/swag-app-system-package)
![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/klarstil/swag-app-system-package)

This package contains an Express wrapper for the Shopware app system. It automatically allows you to create apps
using the app system using Node.js. Express is not mandatory, the helpers are getting exposed which enables you to
authenticate your request from and against your Shopware installation.

It's written in TypeScript and provides multiple adapters to get you started in no time.

## Installation

```bash
npm install --save @shopware-ag/swag-app-system-package
```

## Basic usage with MongoDB & Express

```typescript
// Import necessary modules
import express from "express";
import { MongoClient } from "mongodb";
import { AppTemplate, MongoDbAdapter } from "@shopware-ag/swag-app-system-package";

// Setup express
const app = express();
app.use(express.json());

// Create your MongoDB client
const url = 'mongodb://mongodb:mongodb@localhost:27017';
const client = new MongoClient(url, { useUnifiedTopology: true });

const run = async () => {
	 // Connect to your MongoDB database & select the collection
    await client.connect();
    const database = client.db('swag-app-template');
    const collection = database.collection('shops');

    // Run the app template
    new AppTemplate(app, new MongoDbAdapter(collection), {
        confirmRoute: '/confirm',
        registerRoute: '/registration',
        appSecret: 'mySecret'
        appName: 'MyCoolApp'
    });

    app.listen(8000, () => {
        console.log(`Server started on http://localhost:8000`);
    });
};

run().catch(err => console.log(err));
```

The app template itself hooks up the registration & confirmation routes to your express application and handles the handshake and the validation of the requests from the app system with your own application automatically.

Next up, you can define webhooks in the `manifest.xml` like the following:

```xml
// ...
<webhooks>
    <webhook name="orderPromotion" 
             url="http://locahost:8000/order-transaction-state-paid"
             event="state_enter.order_transaction.state.paid" />
</webhooks>
// ...
```

Now you can hook up the webhook to your application like any other Express route:

```typescript
app.post('/order-transaction-state-paid', (request: Request, response: Response) => {
	console.log('do something');
});
```

## Action buttons

The app system allows you to register action buttons which will be automatically hooked into the Shopware administration. The package provides you with a helper method which allows you to register them easily.

In your `manifest.xml` file you're defining the as the following:

```xml
<admin>

	// ...
	<action-button action="restockProduct" 
                   entity="product"
                   view="detail"
                   url="http://localhost:8000/restock-product">
	    <label>restock</label>
	</action-button>
	
	// ...
</admin>
```

Next up, use the helper method `registerActionButton` from the `appTemplate` to register the route:

```typescript
// Add your custom routes for action buttons
appTemplate.registerActionButton('/restock-product', (
		isValidRequest: boolean,
		{ meta, source, data }: ActionButtonsParams
	) => {
    if (!isValidRequest) {
        console.log('request was not signed correctly');
        return;
    }

    console.log({ meta, source, data });
});
```

## Lifecycle hooks & event system

The app system provides you with lifecycle webhooks which can be registered in the `manifest.xml`:

```xml
<webhooks>
    <webhook name="app-deleted" 
             url="http://localhost:8000/app-deleted-webhook" 
             event="app.deleted" />
    <webhook name="app-activated" 
             url="http://localhost:8000/app-activated-webhook"
             event="app.activated" />
    <webhook name="app-deactivated" 
             url="http://localhost:8000/app-deactivated-webhook" 
             event="app.deactivated" />
    <webhook name="app-updated" 
             url="http://localhost:8000/app-updated-webhook" 
             event="app.updated" />
    <webhook name="app-installed" 
             url="http://localhost:8000/app-installed-webhook" 
             event="app.installed" />
</webhooks>
```

All you have to do now is to register these routes to the `AppTemplate` using the configuration object:

```
const appTemplate = new AppTemplate(app, new LowDbAdapter(), {
    // ...
    appDeletedRoute: '/app-deleted-webhook',
    appInstalledRoute: '/app-installed-webhook',
    appUpdatedRoute: '/app-updated-webhook',
    appActivatedRoute: '/app-activated-webhook',
    appDeactivatedRoute: '/app-deactivated-webhook',
	 // ... 
});
```

Whenever a lifecycle hook gets called, the `AppTemplate` instance fires an event using the native `EventEmitter` from Node.js:

```typescript
appTemplate.on('app.deleted', () => {
    console.log('onAppDeleted');
});

appTemplate.on('app.installed', () => {
    console.log('onAppInstalled');
});

appTemplate.on('app.updated', () => {
    console.log('onAppUpdated');
});

appTemplate.on('app.activated', () => {
    console.log('onAppActivated');
});

appTemplate.on('app.deactivated', () => {
    console.log('onAppDeactivated');
});
```

## Custom module

For larger application, the app system allows you to include your own application into the Shopware administration using an `iframe`-element.

The package provides you with an easy-to-use method to register the endpoint for your custom module as well.

To do so, register your custom module in your `manifest.xml` as the following:

```xml
<admin>
    <module name="exampleConfig" 
            source="http://localhost:8000/my-own-config-module">
        <label>Example config</label>
        <label lang="de-DE">Beispiel-Einstellungen</label>
    </module>
</admin>
```

The custom module has to return a HTML document as a response. To do so, we have to hook up Express with a template engine. In the following example we're using `hbs`:

```typescript
import { resolve, join } from "path";
import express from "express";

const app = express();
app.use(express.json());
app.set('view engine', 'hbs');
app.set('views', resolve(join(__dirname, '../views')));

// ... AppTemplate initialization

appTemplate.registerCustomModule('/my-own-config-module', (
		isValidRequest: boolean, 
		{ response }: CustomModuleParams
	) => {
    if (!isValidRequest) {
        response.status(401).end();
        return;
    }

    response.render('index');
});
```

The template we're rendering needs to communicate with the app system that it got loaded correctly. To do so, we have to send a message using the `postMessage` API:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to your custom module!</title>

    <script>
        document.addEventListener("DOMContentLoaded", () => {
            window.parent.postMessage('connect-app-loaded', '*');
        });
    </script>
</head>
<body>
    <h1>I'm a custom module</h1>
</body>
</html>
```

## Advanced

### Custom connection adapter

The app system exports a [conenction interface](src/database/connection-interface.ts) which allows you to create your own connection adapters. In the following example, we used `lowdb` to interact with a simple JSON database:

```typescript
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
```


## Example

In the `example` directory you can find different examples how to use the package. The `lowdb-express-example` uses a custom connection adapter using `lowdb`, a small local JSON database powered by Lodash.

The example `lowdb-express-hbs-custom-module-example` shows off how you can register and use your custom module in the app system. It uses `hbs` as a template rendering for Express.

## License

[MIT](LICENSE)