import { calculateTax } from './tax'

type BillingCycle = 'monthly' | 'yearly'
type Plan = 'starter' | 'premium'

type ProrataInput = {
  currentPlan: Plan
  newPlan: Plan
  currentPeriodEnd: Date
  now: Date
}

type CreditInput = {
  plan: Plan
  periodStart: Date
  periodEnd: Date
  now: Date
}

const PLAN_PRICES: Record<Plan, Record<BillingCycle, number>> = {
  starter: {
    monthly: 29,
    yearly: 290
  },
  premium: {
    monthly: 79,
    yearly: 790
  }
}

function round2(value: number) {
  return Math.round(value * 100) / 100
}

function getPlanPrice(plan: Plan, billing: BillingCycle) {
  const planPricing = PLAN_PRICES[plan]
  if (!planPricing) {
    throw new Error(`Unknown plan: ${plan}`)
  }
  return planPricing[billing]
}

function diffInDays(start: Date, end: Date) {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / msPerDay))
}

function subtractOneMonth(date: Date) {
  const copy = new Date(date.getTime())
  copy.setMonth(copy.getMonth() - 1)
  return copy
}

export class PricingCalculator {
  static calculate(plan: Plan, billing: BillingCycle, country: string) {
    const net = getPlanPrice(plan, billing)
    const tax = calculateTax(net, country, 'B2C')

    return {
      net,
      tax: tax.amount,
      total: round2(net + tax.amount)
    }
  }

  static calculateUpgradeProrata({ currentPlan, newPlan, currentPeriodEnd, now }: ProrataInput) {
    const currentPrice = getPlanPrice(currentPlan, 'monthly')
    const newPrice = getPlanPrice(newPlan, 'monthly')
    const priceDiff = Math.max(0, newPrice - currentPrice)

    const periodStart = subtractOneMonth(currentPeriodEnd)
    const daysInPeriod = diffInDays(periodStart, currentPeriodEnd) || 1
    const daysRemaining = Math.min(daysInPeriod, diffInDays(now, currentPeriodEnd))
    const ratio = daysRemaining / daysInPeriod

    const amount = round2(priceDiff * ratio)

    return {
      amount,
      immediateCharge: amount > 0
    }
  }

  static calculateRemainingCredit({ plan, periodStart, periodEnd, now }: CreditInput) {
    if (now.getTime() >= periodEnd.getTime()) {
      return 0
    }

    const monthlyPrice = getPlanPrice(plan, 'monthly')
    const daysInPeriod = diffInDays(periodStart, periodEnd) || 1
    const daysRemaining = diffInDays(now, periodEnd)

    return round2(monthlyPrice * (daysRemaining / daysInPeriod))
  }

  static getTrialDays(plan: Plan) {
    return plan === 'premium' ? 14 : 0
  }

  static calculateTrialEnd(plan: Plan, now: Date = new Date()) {
    const days = PricingCalculator.getTrialDays(plan)
    const msPerDay = 24 * 60 * 60 * 1000
    return new Date(now.getTime() + days * msPerDay)
  }
}
