export interface SchoolSubscription {
  id: string
  name: string
  slug: string
  city: string
  adminEmail: string
  ownerName: string
  phone: string
  planTier: 'starter' | 'pro' | 'enterprise'
  planStatus: 'trial' | 'active' | 'past_due' | 'canceled'
  createdAt: string
  trialStartsAt: string
  trialEndsAt: string
  firstPaidAt: string | null
  lastPaidAt: string | null
  nextBillingDate: string
  monthlyAmount: number
  daysRemaining: number
  isTrial: boolean
  isExpired: boolean
}

export interface SubscriptionPaymentRecord {
  id: string
  schoolId: string
  amount: number
  currency: string
  billingCycle: string
  paymentMethod: string
  status: string
  paidAt: string
  periodStart: string
  periodEnd: string
  referenceNo?: string
  notes?: string
}

/**
 * Calculates remaining trial days from an end timestamp.
 */
export function calculateTrialDays(trialEndsAt: string | Date | null | undefined): number {
  if (!trialEndsAt) return 0
  const endMs = new Date(trialEndsAt).getTime()
  const nowMs = Date.now()
  const diffMs = endMs - nowMs
  if (diffMs <= 0) return 0
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Computes the next monthly billing date from a paid timestamp.
 */
export function computeNextBillingDate(paidAt?: string | Date | null): string {
  const base = paidAt ? new Date(paidAt) : new Date()
  const next = new Date(base)
  next.setMonth(next.getMonth() + 1)
  return next.toISOString()
}

/**
 * Normalizes and formats a raw school row into a consistent SchoolSubscription object.
 */
export function parseSchoolSubscription(row: any): SchoolSubscription {
  const createdAt = row?.created_at || row?.createdAt || new Date().toISOString()
  const trialStartsAt = row?.trial_starts_at || row?.trialStartsAt || createdAt
  
  // Default trial ends 30 days after start
  const defaultTrialEnd = new Date(new Date(trialStartsAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
  const trialEndsAt = row?.trial_ends_at || row?.trialEndsAt || defaultTrialEnd

  const firstPaidAt = row?.first_paid_at || row?.firstPaidAt || null
  const lastPaidAt = row?.last_paid_at || row?.lastPaidAt || null
  
  // Next billing date: if paid, 1 month after last payment; if on trial, trial_ends_at
  const nextBillingDate = row?.next_billing_date || row?.nextBillingDate || (lastPaidAt ? computeNextBillingDate(lastPaidAt) : trialEndsAt)

  const planStatus = (row?.plan_status || row?.planStatus || 'trial').toLowerCase() as SchoolSubscription['planStatus']
  const planTier = (row?.plan_tier || row?.planTier || 'pro').toLowerCase() as SchoolSubscription['planTier']
  
  const daysRemaining = calculateTrialDays(trialEndsAt)
  const isTrial = planStatus === 'trial'
  const isExpired = isTrial && daysRemaining <= 0

  return {
    id: String(row?.id || ''),
    name: row?.name || 'My Campus',
    slug: row?.slug || '',
    city: row?.city || 'Karachi',
    adminEmail: row?.admin_email || row?.adminEmail || '',
    ownerName: row?.owner_name || row?.ownerName || '',
    phone: row?.phone || '',
    planTier,
    planStatus: isExpired ? 'past_due' : planStatus,
    createdAt,
    trialStartsAt,
    trialEndsAt,
    firstPaidAt,
    lastPaidAt,
    nextBillingDate,
    monthlyAmount: Number(row?.monthly_amount || row?.monthlyAmount || 5000),
    daysRemaining,
    isTrial,
    isExpired,
  }
}

/**
 * Returns user-friendly formatted date: e.g. "20 October 2026".
 */
export function formatFriendlyDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '—'
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d)
  } catch {
    return '—'
  }
}
