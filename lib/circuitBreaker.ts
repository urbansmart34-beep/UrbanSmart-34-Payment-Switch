import CircuitBreaker from 'opossum';
import { fetchWithRetry } from '@/lib/retry';

const performYocoCharge = async (payload: unknown) => {
    const response = await fetchWithRetry('https://payments.yoco.com/api/checkouts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.YOCO_SECRET_KEY || ''}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        if (response.status >= 500) {
            throw new Error(`Yoco API Server Error: ${response.status}`);
        }
        // 4xx errors are "success" in terms of circuit breaker (client error, not service down)
        return response;
    }

    return response;
};

const options = {
    timeout: 15000, // Increased to 15s to allow for exponential backoff retries before hard-failing
    errorThresholdPercentage: 50, // When 50% of requests fail, trip the breaker
    resetTimeout: 30000 // After 30 seconds, try again.
};

export const yocoBreaker = new CircuitBreaker(performYocoCharge, options);

yocoBreaker.fallback(() => {
    return new Response(JSON.stringify({ error: "Payment Service Temporarily Unavailable" }), {
        status: 503,
        headers: { "Content-Type": "application/json" }
    });
});
