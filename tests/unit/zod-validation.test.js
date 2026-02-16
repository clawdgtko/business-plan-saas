import { describe, it, expect } from 'vitest'
import { updateSectionSchema, createBusinessPlanSchema } from '../../worker/src/validators/index.js'

describe('Zod Validation - Issue #72', () => {
  describe('createBusinessPlanSchema', () => {
    it('should validate valid business plan creation', () => {
      const result = createBusinessPlanSchema.safeParse({
        name: 'My Business Plan',
        template: 'startup'
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty name', () => {
      const result = createBusinessPlanSchema.safeParse({
        name: '',
        template: 'startup'
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updateSectionSchema', () => {
    it('should validate valid section data', () => {
      const result = updateSectionSchema.safeParse({
        title: 'Business Info',
        description: 'My description'
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty object', () => {
      const result = updateSectionSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('should accept any valid object with data', () => {
      const result = updateSectionSchema.safeParse({
        anyField: 'anyValue',
        nested: { key: 'value' }
      })
      expect(result.success).toBe(true)
    })
  })
})
