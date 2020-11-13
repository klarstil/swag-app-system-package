// Import dotenv and import the .env file
import { config } from 'dotenv';
import { resolve, join } from "path";
config();

import express from "express";
import { AppTemplate, CustomModuleParams, ActionButtonsParams } from "@shopware-ag/swag-app-system-package";
import LowDbAdapter from "./adapter/lowdb-adapter";
const PORT = process.env.APP_PORT || 8000;

const app = express();
app.use(express.json());
app.set('view engine', 'hbs');
app.set('views', resolve(join(__dirname, '../views')));

const appTemplate = new AppTemplate(app, new LowDbAdapter(), {
    confirmRoute: '/confirm',
    registerRoute: '/registration',
    appDeletedRoute: '/app-deleted-webhook',
    appInstalledRoute: '/app-installed-webhook',
    appUpdatedRoute: '/app-updated-webhook',
    appActivatedRoute: '/app-activated-webhook',
    appDeactivatedRoute: '/app-deactivated-webhook',
    appSecret: process.env.APP_SECRET as string,
    appName: process.env.APP_NAME as string
});

// Add your custom routes for action buttons
appTemplate.registerActionButton('/restock-product', (isValidRequest: boolean, { meta, source, data }: ActionButtonsParams) => {
    if (!isValidRequest) {
        console.log('request was not signed correctly');
        return;
    }

    console.log({ meta, source, data });
});

appTemplate.registerCustomModule('/my-own-config-module', (isValidRequest: boolean, { response }: CustomModuleParams) => {
    if (!isValidRequest) {
        response.status(401).end();
        return;
    }

    response.render('index');
});

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

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
