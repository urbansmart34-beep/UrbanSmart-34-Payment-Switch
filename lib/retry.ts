export interface RetryOptions {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    backoffFactor?: number;
    retryableStatuses?: number[];
}

const defaultOptions: Required<RetryOptions> = {
    maxRetries: 3,
    initialDelayMs: 200,
    maxDelayMs: 5000,
    backoffFactor: 2,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Utility to execute a fetch operation with exponential backoff retries.
 * 
 * @param url The fetch URL
 * @param init The fetch init options
 * @param options Retry configuration options
 * @returns The final Response object, regardless of success/fail status
 */
export async function fetchWithRetry(url: string, init?: RequestInit, options?: RetryOptions): Promise<Response> {
    const config = { ...defaultOptions, ...options };
    let attempt = 0;

    while (attempt <= config.maxRetries) {
        try {
            const response = await fetch(url, init);

            // If the response is successful, or it's an error status we shouldn't retry (like 400 Bad Request)
            if (response.ok || !config.retryableStatuses.includes(response.status)) {
                return response;
            }

            // Exceeded max retries but still getting a retryable error status
            if (attempt === config.maxRetries) {
                return response;
            }

            // We hit a retryable status code (e.g. 503 Service Unavailable). Calculate backoff.
            console.warn(`[Retry ${attempt + 1}/${config.maxRetries}] Temporary error ${response.status} from ${url}. Retrying...`);
        } catch (error) {
            // Network failure (e.g. DNS resolution failed, connection actively refused)
            if (attempt === config.maxRetries) {
                throw error; // Let the circuit breaker handle the hard throw
            }
            console.warn(`[Retry ${attempt + 1}/${config.maxRetries}] Network error connecting to ${url}: ${(error as Error).message}. Retrying...`);
        }

        // Calculate exponential backoff with jitter
        const delay = Math.min(
            config.initialDelayMs * Math.pow(config.backoffFactor, attempt),
            config.maxDelayMs
        );

        // Add up to 20% jitter to prevent thundering herd
        const jitter = delay * 0.2 * Math.random();
        const finalDelay = delay + jitter;

        await new Promise(resolve => setTimeout(resolve, finalDelay));
        attempt++;
    }

    // This should never be reached due to the loop bounds, but TS needs a return
    throw new Error("Maximum retries bypassed unexpectedly.");
}
