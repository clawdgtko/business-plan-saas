type CustomerType = 'B2C' | 'B2B'

type TaxOptions = {
  vatId?: string
}

type TaxResult = {
  country: string
  rate: number
  amount: number
  reverseCharge: boolean
}

const EU_VAT_RATES: Record<string, number> = {
  FR: 0.20,
  DE: 0.19,
  IT: 0.22,
  ES: 0.21,
  BE: 0.21
}

const EXTRA_RATES: Record<string, number> = {
  CH: 0.077,
  AU: 0.10,
  US: 0
}

function round2(value: number) {
  return Math.round(value * 100) / 100
}

function isEuCountry(country: string) {
  return Object.prototype.hasOwnProperty.call(EU_VAT_RATES, country)
}

function normalizeCountry(country: string) {
  return country.trim().toUpperCase()
}

export function calculateTax(
  amount: number,
  country: string,
  customerType: CustomerType = 'B2C',
  options: TaxOptions = {}
): TaxResult {
  const normalizedCountry = normalizeCountry(country)
  const hasValidVat = customerType === 'B2B' && typeof options.vatId === 'string' && options.vatId.trim() !== ''

  if (hasValidVat && isEuCountry(normalizedCountry)) {
    return {
      country: normalizedCountry,
      rate: 0,
      amount: 0,
      reverseCharge: true
    }
  }

  let rate: number | undefined = EU_VAT_RATES[normalizedCountry]
  if (rate === undefined) {
    rate = EXTRA_RATES[normalizedCountry]
  }

  if (rate === undefined) {
    throw new Error(`Unknown country: ${normalizedCountry}`)
  }

  return {
    country: normalizedCountry,
    rate,
    amount: round2(amount * rate),
    reverseCharge: false
  }
}
