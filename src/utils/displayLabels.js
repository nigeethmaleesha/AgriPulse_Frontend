export const locationTypeLabels = {
  SOURCE: 'Supply source',
  FARM: 'Tea farm',
  HUB: 'Collection centre',
  FACTORY: 'Factory',
}

export const locationTypeShortLabels = {
  SOURCE: 'SUPPLY',
  FARM: 'FARM',
  HUB: 'COLLECTION',
  FACTORY: 'FACTORY',
}

export const scenarioTypeLabels = {
  CLOSE_LINK: 'Connection unavailable',
  REDUCE_BY_PERCENT: 'Reduce daily carrying capacity',
  INCREASE_BY_PERCENT: 'Increase daily carrying capacity',
  SET_CAPACITY: 'Set planned daily capacity',
}

export function scenarioTypeLabel(type) {
  return scenarioTypeLabels[type] || String(type || '').replaceAll('_', ' ')
}

export function methodDisplayName(name = '') {
  const value = String(name)
  if (value.includes('Linear') || value.toLowerCase().includes('saturated')) return 'Capacity status check'
  if (value.toLowerCase().includes('heap')) return 'Priority connection ranking'
  if (value.toLowerCase().includes('closure')) return 'Full disruption impact check'
  if (value.includes('Ford') || value.includes('DFS') || value.toLowerCase().includes('synthetic')) return 'Network throughput calculation'
  return value
}

export function connectionStatus(utilizationPercent, remainingCapacity) {
  if (remainingCapacity === 0) return { label: 'At capacity', tone: 'red' }
  if (Number(utilizationPercent) >= 85) return { label: 'Near capacity', tone: 'amber' }
  return { label: 'Available', tone: 'green' }
}

export function impactAction(impactPercent = 0) {
  const impact = Number(impactPercent)
  if (impact >= 25) return 'Protect or add backup capacity'
  if (impact >= 10) return 'Review contingency options'
  if (impact > 0) return 'Monitor during peak intake'
  return 'Low operational impact'
}
