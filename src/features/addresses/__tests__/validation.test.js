import { describe, expect, it } from 'vitest'
import { isAddressLocation, validateAddress } from '../validation'

const valid = { title: '', description: 'تعز، شارع جمال', location: { lat: 0, lng: 0 } }

describe('address validation', () => {
  it('allows an omitted title and zero coordinates', () => {
    expect(validateAddress(valid)).toEqual({})
  })

  it('requires a nonblank description and a confirmed location', () => {
    expect(validateAddress({ ...valid, description: ' \n ', location: null })).toEqual({
      description: expect.any(String),
      location: expect.any(String),
    })
  })

  it('enforces the 100 and 250 character limits using Unicode code points', () => {
    const atLimit = { ...valid, title: '🏠'.repeat(100), description: 'ش'.repeat(250) }
    expect(validateAddress(atLimit)).toEqual({})
    expect(validateAddress({ ...atLimit, title: atLimit.title + 'ش', description: atLimit.description + 'ش' })).toEqual({
      title: expect.any(String),
      description: expect.any(String),
    })
  })

  it.each([
    { lat: -90, lng: -180 },
    { lat: 90, lng: 180 },
  ])('accepts boundary coordinates %j', (location) => {
    expect(isAddressLocation(location)).toBe(true)
  })

  it.each([
    { lat: 90.01, lng: 0 },
    { lat: -90.01, lng: 0 },
    { lat: 0, lng: -180.01 },
    { lat: 0, lng: 180.01 },
    { lat: NaN, lng: 0 },
    { lat: 0, lng: Infinity },
    { lat: '0', lng: 0 },
    { lat: null, lng: 0 },
    { lat: 0 },
  ])('rejects invalid numeric coordinates %j', (location) => {
    expect(isAddressLocation(location)).toBe(false)
  })
})
