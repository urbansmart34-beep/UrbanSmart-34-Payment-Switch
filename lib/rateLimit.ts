import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
    points: 10, // 10 requests
    duration: 60, // Per 60 seconds
});

export async function rateLimit(ip: string) {
    try {
        await rateLimiter.consume(ip);
        return true;
    } catch (rejRes) {
        return false;
    }
}
