import arcjet, {
  shield,
  detectBot,
  tokenBucket,
  slidingWindow,
  protectSignup,
} from '@arcjet/next'

// Initialize Arcjet Boundary Security Client
const isLive = Boolean(process.env.ARCJET_KEY && !process.env.ARCJET_KEY.includes('mock') && process.env.NODE_ENV === 'production')
const securityMode = isLive ? 'LIVE' : 'DRY_RUN'

// Uses ARCJET_KEY environment variable (supports mock/dev mode when key is absent)
export const aj = arcjet({
  key: process.env.ARCJET_KEY || 'ajkey_test_mock_eduflow',
  rules: [
    // 1. Arcjet Shield: Protect against common web attacks (SQL injection, XSS, SSRF)
    shield({
      mode: securityMode,
    }),

    // 2. Bot Detection: Block malicious automated scrapers while allowing search engines
    detectBot({
      mode: securityMode,
      allow: [
        'CATEGORY:SEARCH_ENGINE', // Googlebot, Bing, etc.
        'CATEGORY:PREVIEW',       // Chat & link preview scrapers
      ],
    }),

    // 3. Sliding Window Rate Limiting: 60 requests per 60 seconds per IP
    slidingWindow({
      mode: securityMode,
      interval: '60s',
      max: 60,
    }),
  ],
})

// Specialized boundary protection for school admin & parent signup
export const signupSecurity = arcjet({
  key: process.env.ARCJET_KEY || 'ajkey_test_mock_eduflow',
  rules: [
    protectSignup({
      email: {
        mode: securityMode,
        deny: ['DISPOSABLE', 'INVALID', 'NO_MX_RECORDS'],
      },
      bots: {
        mode: securityMode,
        allow: [],
      },
      rateLimit: {
        mode: securityMode,
        interval: '10m',
        max: 5,
      },
    }),
  ],
})

export default aj
