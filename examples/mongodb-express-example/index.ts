// Import dotenv and import the .env file
import { config } from 'dotenv';
config();

import express from "express";
import { MongoClient } from "mongodb";
import { AppTemplate, MongoDbAdapter } from "@shopware-ag/swag-app-system-package";
const PORT = process.env.APP_PORT || 8000;

const app = express();
app.use(express.json());

const url = 'mongodb://mongodb:mongodb@localhost:27017';
const client = new MongoClient(url, { useUnifiedTopology: true });

const run = async () => {
    await client.connect();
    const database = client.db('swag-app-template');
    const collection = database.collection('shops');

    new AppTemplate(app, new MongoDbAdapter(collection), {
        appDeploymentRoute: `http://localhost:${PORT}`,
        confirmRoute: '/confirm',
        registerRoute: '/registration',
        appSecret: process.env.APP_SECRET as string,
        appName: process.env.APP_NAME as string
    });

    app.listen(PORT, () => {
        console.log(`Server started on http://localhost:${PORT}`);
    });
};

run().catch(err => console.log(err));
