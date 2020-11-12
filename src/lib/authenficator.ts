import { createHmac, randomBytes } from "crypto";

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
    /**
     * Verifies the register request from the app system.
     *
     * @param {String} shopId
     * @param {String} shopUrl
     * @param {String} signature
     * @param {Number} timestamp
     * @param {String} appSecret
     * @returns {boolean}
     */
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

    /**
     * Verifies post requests from the app system.
     *
     * @param {String} signature
     * @param {String} body
     * @param {String} shopSecret
     * @returns {boolean}
     */
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

        return hash === signature;
    }

    /**
     * Generates the necessary proof for the handshake with the app system.
     *
     * @param {String} shopId
     * @param {String} shopUrl
     * @param {String} shopSecret
     * @param {String} appSecret
     * @param {String} name
     * @param {String} confirmationUrl
     * @returns {iGenerateProofAnswer}
     */
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

    /**
     * Generates a secret for each shop which will be used for the handshake
     *
     * @returns {boolean}
     */
    static generateSecretForShop(): string {
        return randomBytes(16).toString('hex');
    }
}
