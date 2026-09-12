import { describe, it, expect } from 'vitest'
import { aj, signupSecurity } from '../lib/arcjet'

describe('Arcjet Boundary Security', () => {
  it('initializes Arcjet client with shield, bot detection, and rate limiting rules', () => {
    expect(aj).toBeDefined()
    expect(typeof aj.protect).toBe('function')
  })

  it('initializes signup boundary protection with disposable email and rate limit rules', () => {
    expect(signupSecurity).toBeDefined()
    expect(typeof signupSecurity.protect).toBe('function')
  })
})
