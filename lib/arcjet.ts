import arcjet, {
  shield,
  detectBot,
  tokenBucket,
  slidingWindow,
  protectSignup,
} from '@arcjet/next'

// Initialize Arcjet Boundary Security Client
// Uses ARCJET_KEY environment variable (supports mock/dev mode when key is absent)
export const aj = arcjet({
  key: process.env.ARCJET_KEY || 'ajkey_test_mock_eduflow',
  rules: [
    // 1. Arcjet Shield: Protect against common web attacks (SQL injection, XSS, SSRF)
    shield({
      mode: process.env.NODE_ENV === 'production' ? 'LIVE' : 'DRY_RUN',
    }),

    // 2. Bot Detection: Block malicious automated scrapers while allowing search engines
    detectBot({
      mode: process.env.NODE_ENV === 'production' ? 'LIVE' : 'DRY_RUN',
      allow: [
        'CATEGORY:SEARCH_ENGINE', // Googlebot, Bing, etc.
        'CATEGORY:PREVIEW',       // Slack, WhatsApp preview scrapers
      ],
    }),

    // 3. Sliding Window Rate Limiting: 60 requests per 60 seconds per IP
    slidingWindow({
      mode: process.env.NODE_ENV === 'production' ? 'LIVE' : 'DRY_RUN',
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
        mode: process.env.NODE_ENV === 'production' ? 'LIVE' : 'DRY_RUN',
        deny: ['DISPOSABLE', 'INVALID', 'NO_MX_RECORDS'],
      },
      bots: {
        mode: process.env.NODE_ENV === 'production' ? 'LIVE' : 'DRY_RUN',
        allow: [],
      },
      rateLimit: {
        mode: process.env.NODE_ENV === 'production' ? 'LIVE' : 'DRY_RUN',
        interval: '10m',
        max: 5,
      },
    }),
  ],
})

export default aj
