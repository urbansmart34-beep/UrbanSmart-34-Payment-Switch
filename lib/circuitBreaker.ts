import CircuitBreaker from 'opossum';

const performYocoCharge = async (payload: unknown) => {
    const response = await fetch('https://payments.yoco.com/api/checkouts', {
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
    timeout: 5000, // If function takes longer than 5 seconds, trigger failure
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
