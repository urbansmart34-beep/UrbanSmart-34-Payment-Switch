export interface YocoSDK {
    showPopup: (options: YocoPopupOptions) => void;
}

export interface YocoPopupOptions {
    amountInCents: number;
    currency: 'ZAR';
    name?: string;
    description?: string;
    image?: string;
    callback: (result: YocoResult) => void;
}

export interface YocoResult {
    error?: {
        message: string;
    };
    id?: string; // The token
    card?: {
        last4: string;
        brand: string;
    };
}

declare global {
    interface Window {
        YocoSDK?: {
            new(options: { publicKey: string }): YocoSDK;
        };
    }
}
