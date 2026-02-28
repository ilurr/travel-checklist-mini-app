import { ref, computed, watch } from 'vue'
import defaultTemplate from '../data/defaultPackingList.json'

const STORAGE_KEY = 'travel-packing-trips'
const CURRENT_TRIP_KEY = 'travel-packing-current-trip'
const OLD_STORAGE_KEY = 'travel-packing-local'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
    const oldRaw = localStorage.getItem(OLD_STORAGE_KEY)
    if (oldRaw) {
      const old = JSON.parse(oldRaw)
      if (old?.categories?.length) {
        const migrated = [{
          id: `trip-${Math.random().toString(36).slice(2, 11)}`,
          destination: old.templateName || 'My list',
          date: new Date().toISOString().slice(0, 10),
          categories: old.categories,
        }]
        try { localStorage.removeItem(OLD_STORAGE_KEY) } catch (_) {}
        return migrated
      }
    }
  } catch (_) {}
  const defaultTrip = {
    id: `trip-${Math.random().toString(36).slice(2, 11)}`,
    destination: 'My first trip',
    date: new Date().toISOString().slice(0, 10),
    categories: JSON.parse(JSON.stringify(defaultTemplate.categories)),
  }
  return [defaultTrip]
}

function loadCurrentTripId() {
  try {
    return localStorage.getItem(CURRENT_TRIP_KEY) || ''
  } catch (_) {}
  return ''
}

function saveToStorage(trips) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
  } catch (_) {}
}

function saveCurrentTripId(id) {
  try {
    localStorage.setItem(CURRENT_TRIP_KEY, id)
  } catch (_) {}
}

function generateId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`
}

export function useTrips() {
  const trips = ref(loadFromStorage())
  const currentTripId = ref(loadCurrentTripId() || trips.value[0]?.id || '')

  const currentTrip = computed(() =>
    trips.value.find((t) => t.id === currentTripId.value)
  )
  const categories = computed(() => currentTrip.value?.categories || [])
  const totalItems = computed(() =>
    categories.value.reduce(
      (sum, cat) =>
        sum + (cat.items || []).reduce((s, i) => s + (Math.max(1, parseInt(i.quantity, 10) || 1)), 0),
      0
    )
  )
  const checkedCount = computed(() =>
    categories.value.reduce(
      (sum, cat) => sum + (cat.items?.filter((i) => i.checked)?.length || 0),
      0
    )
  )

  watch(
    trips,
    (v) => saveToStorage(v),
    { deep: true }
  )
  watch(currentTripId, (id) => saveCurrentTripId(id))

  function setCurrentTrip(id) {
    if (trips.value.some((t) => t.id === id)) currentTripId.value = id
  }

  function addTrip(destination = '', date = '') {
    const d = date || new Date().toISOString().slice(0, 10)
    const trip = {
      id: generateId('trip'),
      destination: (destination || 'New trip').trim(),
      date: d,
      categories: JSON.parse(JSON.stringify(defaultTemplate.categories)),
      remoteId: null,
      remoteToken: null,
    }
    trips.value.push(trip)
    currentTripId.value = trip.id
    return trip.id
  }

  function setCurrentTripShareInfo(remoteId, remoteToken) {
    if (!currentTrip.value) return
    currentTrip.value.remoteId = remoteId
    currentTrip.value.remoteToken = remoteToken
  }

  function updateTrip(tripId, { destination, date }) {
    const t = trips.value.find((x) => x.id === tripId)
    if (!t) return
    if (destination !== undefined) t.destination = String(destination).trim() || t.destination
    if (date !== undefined) t.date = date || t.date
  }

  function removeTrip(tripId) {
    const idx = trips.value.findIndex((t) => t.id === tripId)
    if (idx === -1) return
    trips.value.splice(idx, 1)
    if (currentTripId.value === tripId) {
      currentTripId.value = trips.value[0]?.id || ''
    }
  }

  function addCategory(name) {
    if (!name?.trim() || !currentTrip.value) return
    const id = generateId('cat')
    currentTrip.value.categories.push({ id, name: name.trim(), items: [] })
  }

  function removeCategory(categoryId) {
    if (!currentTrip.value) return
    currentTrip.value.categories = currentTrip.value.categories.filter((c) => c.id !== categoryId)
  }

  function addItem(categoryId, label) {
    if (!label?.trim() || !currentTrip.value) return
    const cat = currentTrip.value.categories.find((c) => c.id === categoryId)
    if (!cat) return
    if (!cat.items) cat.items = []
    cat.items.push({ id: generateId('item'), label: label.trim(), checked: false, quantity: 1 })
  }

  function updateItemQuantity(categoryId, itemId, quantity) {
    const item = currentTrip.value?.categories
      ?.find((c) => c.id === categoryId)
      ?.items?.find((i) => i.id === itemId)
    if (!item) return
    const n = Math.max(1, parseInt(quantity, 10) || 1)
    item.quantity = n
  }

  function toggleItem(categoryId, itemId) {
    const cat = currentTrip.value?.categories.find((c) => c.id === categoryId)
    const item = cat?.items?.find((i) => i.id === itemId)
    if (item) item.checked = !item.checked
  }

  function removeItem(categoryId, itemId) {
    const cat = currentTrip.value?.categories.find((c) => c.id === categoryId)
    if (!cat?.items) return
    cat.items = cat.items.filter((i) => i.id !== itemId)
  }

  function clearAllChecks() {
    if (!currentTrip.value) return
    currentTrip.value.categories.forEach((cat) => {
      (cat.items || []).forEach((i) => (i.checked = false))
    })
  }

  function getCurrentTripData() {
    if (!currentTrip.value) return null
    const categories = JSON.parse(JSON.stringify(currentTrip.value.categories))
    categories.forEach((cat) => {
      (cat.items || []).forEach((i) => {
        if (i.quantity == null) i.quantity = 1
      })
    })
    return {
      destination: currentTrip.value.destination,
      date: currentTrip.value.date,
      categories,
    }
  }

  return {
    trips,
    currentTripId,
    currentTrip,
    categories,
    totalItems,
    checkedCount,
    setCurrentTrip,
    addTrip,
    updateTrip,
    removeTrip,
    addCategory,
    removeCategory,
    addItem,
    toggleItem,
    removeItem,
    updateItemQuantity,
    clearAllChecks,
    getCurrentTripData,
    setCurrentTripShareInfo,
  }
}
