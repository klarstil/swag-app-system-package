import { Request } from "express";
import {createHmac, randomBytes} from "crypto";

declare interface iGenerateProof {
    shopId: string;
    shopUrl: string;
    name: string,
    confirmationUrl: string
    shopSecret: string,
    appSecret: string;
}

declare interface iGenerateProofAnswer {
    proof: string,
    secret: string,
    confirmation_url: string
}

declare interface iAuthenticateRegisterRequest {
    shopId: string;
    shopUrl: string;
    signature: string;
    timestamp: number;
    appSecret: string;
}

declare interface iAuthenticatePostRequest {
    signature: string,
    body: string,
    shopSecret: string
}

export default class Authenticator {
    static authenticateRegisterRequest({
        shopId,
        shopUrl,
        signature,
        timestamp,
        appSecret,
    }: iAuthenticateRegisterRequest): boolean {
        const hmac = createHmac("sha256", appSecret as string);
        const hash = hmac
            .update(
                Buffer.from(
                    `shop-id=${shopId}&shop-url=${shopUrl}&timestamp=${timestamp}`,
                    "utf-8"
                )
            )
            .digest("hex");

        return hash === signature;
    }

    static authenticatePostRequest({
        signature,
        body,
        shopSecret
    }: iAuthenticatePostRequest): boolean {
        if (!signature || signature.length <= 0) {
            return false;
        }

        const hmac = createHmac("sha256", shopSecret);
        const hash = hmac
            .update(
                Buffer.from(
                    body,
                    "utf-8"
                )
            )
            .digest("hex");

        console.log({ hash });
        console.log({ signature });
        console.log({ body });

        return hash === signature;
    }

    static generateProof({
        shopId,
        shopUrl,
        shopSecret,
        appSecret,
        name,
        confirmationUrl
    }: iGenerateProof): iGenerateProofAnswer {
        const hmac = createHmac('sha256', appSecret);
        const proof = hmac.update(
            Buffer.from(
                `${shopId}${shopUrl}${name}`,
                'utf-8'
            )
        ).digest('hex');

        return {
            proof: proof,
            secret: shopSecret,
            confirmation_url: confirmationUrl
        };
    }

    static generateSecretForShop(): string {
        return randomBytes(16).toString('hex');
    }
}
