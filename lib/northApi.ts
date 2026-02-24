import CircuitBreaker from 'opossum';

// Simulate a call to a secondary processor (North Custom Pay API)
const performNorthCharge = async (payload: any) => {
    // Simulate network delay for the mock API
    await new Promise(r => setTimeout(r, Math.random() * 500 + 200));

    // Simulate potential failure (e.g. 5% chance of gateway timeout to test our failover systems if hit)
    if (Math.random() < 0.05) {
        throw new Error("North API: Gateway Timeout");
    }

    // Return a mock successful response matching the expected interface
    return new Response(JSON.stringify({
        id: `north_ch_${Math.random().toString(36).substring(2, 11)}`,
        status: "success",
        // In a real flow, North might have its own hosted checkout. For the mock, we just loop back to success.
        redirectUrl: payload.successUrl
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

const options = {
    timeout: 10000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
};

export const northBreaker = new CircuitBreaker(performNorthCharge, options);
