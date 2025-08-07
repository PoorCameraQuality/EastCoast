interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string // Custom error message
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store for development (use Redis in production)
const store: RateLimitStore = {}

export class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  // Public method to get the error message
  getMessage(): string {
    return this.config.message || 'Rate limit exceeded'
  }

  // Public method to get max requests
  getMaxRequests(): number {
    return this.config.maxRequests
  }

  async checkLimit(identifier: string): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
    retryAfter?: number
  }> {
    const now = Date.now()
    const key = `rate_limit:${identifier}`
    
    // Get current state
    const current = store[key]
    
    if (!current || now > current.resetTime) {
      // First request or window expired
      store[key] = {
        count: 1,
        resetTime: now + this.config.windowMs
      }
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: store[key].resetTime
      }
    }
    
    if (current.count >= this.config.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      }
    }
    
    // Increment counter
    current.count++
    
    return {
      allowed: true,
      remaining: this.config.maxRequests - current.count,
      resetTime: current.resetTime
    }
  }

  // Clean up expired entries (call periodically)
  cleanup(): void {
    const now = Date.now()
    Object.keys(store).forEach(key => {
      if (store[key].resetTime < now) {
        delete store[key]
      }
    })
  }
}

// Pre-configured rate limiters
export const rateLimiters = {
  // API endpoints: 100 requests per 15 minutes
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many API requests. Please try again later.'
  }),
  
  // Form submissions: 10 submissions per hour
  forms: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'Too many form submissions. Please try again later.'
  }),
  
  // Authentication: 5 attempts per 15 minutes
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many login attempts. Please try again later.'
  }),
  
  // File uploads: 5 uploads per hour
  uploads: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    message: 'Too many file uploads. Please try again later.'
  })
}

// Helper function to get client identifier
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIP || 'unknown'
  
  // Add user agent for more granular limiting
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return `${ip}:${userAgent.slice(0, 50)}`
}

// Rate limiting middleware for API routes
export async function withRateLimit(
  request: Request,
  limiter: RateLimiter,
  identifier?: string
): Promise<Response | null> {
  const clientId = identifier || getClientIdentifier(request)
  const result = await limiter.checkLimit(clientId)
  
  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        success: false,
        message: limiter.getMessage(),
        retryAfter: result.retryAfter
      }),
      {
        status: 429, // Too Many Requests
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limiter.getMaxRequests().toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetTime.toString(),
          'Retry-After': result.retryAfter?.toString() || '60'
        }
      }
    )
  }
  
  return null // Continue with request
}

// Cleanup expired entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    Object.values(rateLimiters).forEach(limiter => limiter.cleanup())
  }, 5 * 60 * 1000)
}
