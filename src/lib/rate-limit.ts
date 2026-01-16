
interface RateLimitRecord {
    count: number;
    expiry: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

interface RateLimitConfig {
    limit: number; // Max requests
    windowMs: number; // Time window in ms
}

/**
 * Simple in-memory rate limiter.
 * Note: This resets when the server restarts. For distributed systems (Vercel/AWS), use Redis/Upstash.
 */
export const checkRateLimit = (ip: string, config: RateLimitConfig = { limit: 5, windowMs: 60 * 1000 }) => {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    // Clean up expired records occasionally could be good, but for now we check on access
    if (!record) {
        rateLimitMap.set(ip, { count: 1, expiry: now + config.windowMs });
        return { success: true, remaining: config.limit - 1 };
    }

    if (now > record.expiry) {
        // Window expired, reset
        rateLimitMap.set(ip, { count: 1, expiry: now + config.windowMs });
        return { success: true, remaining: config.limit - 1 };
    }

    // Window active
    if (record.count >= config.limit) {
        return { success: false, remaining: 0 };
    }

    record.count += 1;
    return { success: true, remaining: config.limit - record.count };
};
