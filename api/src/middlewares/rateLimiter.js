const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000");
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "50");

const requestCounts = new Map();

function rateLimiter(req, res, next) {
    // Simple trust proxy fallback for Docker
    const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();

    let record = requestCounts.get(ip);

    if (!record) {
        record = { count: 1, resetTime: now + windowMs };
        requestCounts.set(ip, record);
        return next();
    }

    // Reset window
    if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + windowMs;
        return next();
    }

    if (record.count >= maxRequests) {
        const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
        res.setHeader('Retry-After', retryAfterSeconds);
        return res.status(429).json({
            error: 'Too Many Requests',
            retryAfter: retryAfterSeconds
        });
    }

    record.count++;
    next();
}

module.exports = rateLimiter;
