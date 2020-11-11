import { Request } from "express";
import { createHmac } from "crypto";

declare interface iGenerateProof {
    shopId: string;
    shopUrl: string;
    name: string,
    confirmationUrl: string
    secret: string,
    appSecret: string;
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
    }: iAuthenticatePostRequest) {
        if (!signature || signature.length <= 0) {
            console.log('signature not found');
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

        return hash === signature;
    }

    static generateProof({
        shopId,
        shopUrl,
        secret,
        appSecret,
        name,
        confirmationUrl
    }: iGenerateProof): any {
        const hmac = createHmac('sha256', appSecret);
        const proof = hmac.update(
            Buffer.from(
                `${shopId}${shopUrl}${name}`,
                'utf-8'
            )
        ).digest('hex');

        return {
            proof: proof,
            secret: secret,
            confirmation_url: confirmationUrl
        };
    }
}
