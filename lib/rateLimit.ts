import { RateLimiterMemory } from 'rate-limiter-flexible';

// Tier 1: Standard API pacing (e.g., 50 requests per minute)
const standardLimiter = new RateLimiterMemory({
    points: 50,
    duration: 60,
    blockDuration: 60 * 5, // Block for 5 minutes if exceeded
});

// Tier 2: DDoS / Surge Penalty. If they hit 150 requests in a minute, block them entirely for 2 hours.
const surgeLimiter = new RateLimiterMemory({
    points: 150,
    duration: 60,
    blockDuration: 60 * 60 * 2, // Block for 2 hours
});

export async function rateLimit(ip: string) {
    try {
        // Track against both limits simultaneously
        await surgeLimiter.consume(ip);
        await standardLimiter.consume(ip);
        return true;
    } catch (rejRes) {
        // Automatically console log the block for audit tracking
        console.warn(`[SECURITY] Rate Limit Triggered for IP: ${ip}. IP temporarily blocked.`);
        return false;
    }
}
