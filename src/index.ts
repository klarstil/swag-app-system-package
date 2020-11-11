// Import dotenv and import the .env file
import { config } from 'dotenv';
config();

import express, { Request, Response } from "express";
import { randomBytes } from "crypto";

// @ts-ignore
import low from 'lowdb';
// @ts-ignore
import FileSync from 'lowdb/adapters/FileSync';

const adapter = new FileSync('db.json');
const db = low(adapter);

db.defaults({ shops: [] }).write();

import Authenticator from "./lib/authenficator";

const PORT = process.env.APP_PORT || 8000;

const app = express();
app.use(express.json());

app.get("/registration", (request: Request, response: Response) => {
    const shopUrl = request.query['shop-url'] as string;
    const shopId = request.query['shop-id'] as string;

    if (!Authenticator.authenticateRegisterRequest({
        appSecret: process.env.APP_SECRET as string,
        shopId: shopId,
        shopUrl: shopUrl,
        signature: request.get('shopware-app-signature') as string,
        timestamp: parseInt(request.query.timestamp as string)
    })) {
        response.status(401).end();
        return;
    }

    const secret = randomBytes(16).toString('hex');
    const name = process.env.APP_NAME as string;

    // Write shop to db
    db.get('shops')
        .push({
            id: shopId,
            url: shopUrl,
            secret: secret,
            apiKey: null,
            secretKey: null
        })
        .write();

    // Generate proof
    const proof = Authenticator.generateProof({
        shopUrl,
        shopId,
        name,
        secret,
        appSecret: process.env.APP_SECRET as string,
        confirmationUrl: 'http://localhost:8000/confirm'
    });

    response.json(proof);
});


app.post('/confirm', (request, response) => {
    /*  const record = db.get('shops')
        .find({ id: request.body.shopId })
        .value();

    if (!Authenticator.authenticatePostRequest({
        signature: request.get('shopware-shop-signature') as string,
        shopSecret: record.secret as string,
        body: JSON.stringify(request.body)
    })) {
        response.status(401).end();
        return;
    } */

    db.get('shops')
        .find({ id: request.body.shopId })
        .assign({ apiKey: request.body.apiKey, secretKey: request.body.secretKey })
        .write();

    response.end();
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
