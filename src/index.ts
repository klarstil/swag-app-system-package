// Import dotenv and import the .env file
import { config } from 'dotenv';
config();

import express from "express";
import { AppTemplate, LowDbAdapter } from "./lib";
const PORT = process.env.APP_PORT || 8000;

const app = express();
app.use(express.json());

new AppTemplate(app, new LowDbAdapter(), {
    confirmRoute: '/confirm',
    registerRoute: '/registration',
    appSecret: process.env.APP_SECRET as string,
    appName: process.env.APP_NAME as string
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
