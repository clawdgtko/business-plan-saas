import { z } from 'zod'

// Common schemas
export const uuidSchema = z.string().uuid()

export const emailSchema = z.string().email()

// Business Plan schemas
export const createBusinessPlanSchema = z.object({
  name: z.string().min(1).max(200),
  template: z.enum(['startup', 'restaurant', 'freelance', 'ecommerce']).optional()
})

export const businessPlanSectionSchema = z.object({
  section: z.enum(['businessInfo', 'market', 'financial', 'strategy']),
  data: z.record(z.any())
})

// Auth schemas
export const magicLinkRequestSchema = z.object({
  email: z.string().email()
})

export const onboardingSchema = z.object({
  name: z.string().min(1).max(100),
  company: z.string().min(1).max(100),
  goal: z.string().min(10).max(1000)
})

// Stripe schemas
export const checkoutSessionSchema = z.object({
  priceId: z.string().startsWith('price_'),
  successUrl: z.string().url(),
  cancelUrl: z.string().url()
})

// Helper for validation
export function validate(data, schema) {
  const result = schema.safeParse(data)
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues.map(i => ({
        path: i.path.join('.'),
        message: i.message
      }))
    }
  }
  return { success: true, data: result.data }
}
