export type PaymentProcessor = 'YOCO' | 'NORTH';

export interface RoutingContext {
    amount: number;
    currency: string;
    storeId: string;
    // In a real system, you would include factors like customer IP, BIN data, time of day, etc.
}

/**
 * Intelligent Routing Engine determines the optimal payment processor
 * for a given transaction based on configured business logic.
 */
export const determineOptimalProcessor = (context: RoutingContext): PaymentProcessor => {
    // Simulated intelligent routing rules

    // Rule 1: Cost Efficiency (Interchange Optimization)
    // E.g., Assume North API has lower processing fees for high-value transactions (> 5000 ZAR)
    if (context.amount > 500000) { // 5000 ZAR in cents
        console.log(`[ROUTER] Amount (R${context.amount / 100}) > R5000. Routing to NORTH for better interchange rate.`);
        return 'NORTH';
    }

    // Rule 2: Micro-transactions logic (e.g. if we had a 3rd provider for very small txns)

    // Default Fallback
    console.log("[ROUTER] Default routing to YOCO.");
    return 'YOCO';
}
